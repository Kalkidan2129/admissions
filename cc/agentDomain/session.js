// The Agent domain tab's sign-in and endpoint state, held in this module's memory only.
//
// Two tokens, both in closure variables: the participant token the builder pastes, and the admin
// token the portal mints from it. Neither is written to localStorage, sessionStorage, a cookie, a
// file or a URL, neither appears in `access` or `endpoints`, and reloading the page forgets both.
//
// Sign-in, in order (platform commit a82f731, mgmtBridgeService.ts):
//   1. GET  /api/portal/mgmt/status  with the participant token: is this account a management user?
//   2. POST /api/portal/mgmt/enter   with the participant token: mints a 12-hour admin token,
//      returning { admin_token, role, sections }. 403 means "not a management user".
//   3. The four /api/admin reads, with the admin token.
// If a read answers 401, the admin token is minted again ONCE per sign-in (shared by every read
// that hit it) and each such read is retried once. A second 401 is shown with the portal's words.
import { ENDPOINT_PATHS, MGMT_STATUS_PATH, MGMT_ENTER_PATH, ApiError, getJson, postJson } from './api.js';

export const NOT_LOADED = 'not_loaded';
export const LOADING = 'loading';
export const OK = 'ok';
export const ERROR = 'error';

const isStringArray = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string');

function checkStatus(body) {
  if (!body || typeof body.is_mgmt !== 'boolean' || !isStringArray(body.sections ?? null)) {
    throw new ApiError('ContractViolation', 'GET', MGMT_STATUS_PATH, 'answered without the expected is_mgmt and sections fields.');
  }
  return { is_mgmt: body.is_mgmt, role: body.role ?? null, label: body.label ?? null, sections: body.sections };
}

// The body carries the admin token, so a contract failure names the missing field, never the body.
function checkMinted(body) {
  if (!body || typeof body.admin_token !== 'string' || !body.admin_token || typeof body.role !== 'string' || !isStringArray(body.sections ?? null)) {
    throw new ApiError('ContractViolation', 'POST', MGMT_ENTER_PATH, 'answered HTTP 200 without a usable admin_token, role and sections.');
  }
  return body;
}

const blankAccess = () => ({ status: NOT_LOADED, step: null, mgmt: null, entered: null, error: null, remints: 0 });

export function createSession({ domainKey, fetchImpl = (...a) => fetch(...a), now = () => new Date() } = {}) {
  let participantToken = null;
  let adminToken = null;
  let baseUrl = null;
  let generation = 0;
  const listeners = new Set();
  const paths = ENDPOINT_PATHS(domainKey);
  const blank = () => Object.fromEntries(Object.entries(paths).map(([k, path]) => [k, { status: NOT_LOADED, path }]));
  let endpoints = blank();
  let access = blankAccess();

  const notify = () => listeners.forEach((fn) => fn());
  const set = (key, value) => { endpoints = { ...endpoints, [key]: { path: paths[key], ...value } }; notify(); };
  const setAccess = (value) => { access = { ...access, ...value }; notify(); };
  const secrets = () => [participantToken, adminToken];
  const call = (fn, path, token) => fn({ baseUrl, token, path, fetchImpl, secrets: secrets() });

  // Keeps the minted token only if no forget() or newer connect() happened while it was in flight.
  async function mint(gen) {
    const { body } = await call(postJson, MGMT_ENTER_PATH, participantToken);
    const minted = checkMinted(body);
    if (gen === generation) adminToken = minted.admin_token;
    return minted;
  }

  return {
    paths,
    get baseUrl() { return baseUrl; },
    get hasToken() { return participantToken !== null; },
    get endpoints() { return endpoints; },
    get access() { return access; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    // A later connect() or forget() supersedes an earlier one: responses from an older
    // generation are dropped, so a slow answer can never repopulate a forgotten session.
    async connect(newBaseUrl, newParticipantToken) {
      if (!newParticipantToken) throw new Error('Enter your participant token.');
      baseUrl = newBaseUrl;
      participantToken = newParticipantToken;
      adminToken = null;
      const mine = ++generation;
      const live = () => mine === generation;
      endpoints = blank();
      access = { ...blankAccess(), status: LOADING, step: 'status' };
      notify();

      try {
        const { body } = await call(getJson, MGMT_STATUS_PATH, participantToken);
        if (!live()) return;
        setAccess({ mgmt: checkStatus(body), step: 'enter' });
      } catch (err) {
        if (live()) setAccess({ status: ERROR, error: err, loadedAt: now() });
        return;
      }

      let minted;
      try {
        minted = await mint(mine);
      } catch (err) {
        if (live()) { adminToken = null; setAccess({ status: ERROR, error: err, loadedAt: now() }); }
        return;
      }
      if (!live()) return;
      setAccess({ status: OK, step: 'entered', entered: { role: minted.role, sections: minted.sections }, loadedAt: now() });

      let remint = null; // one shared re-mint per sign-in
      const read = async (key) => {
        const used = adminToken;
        try {
          return await call(getJson, paths[key], used);
        } catch (err) {
          if (err.status !== 401) throw err;
          if (!remint) {
            remint = mint(mine).then((m) => { if (live()) setAccess({ entered: { role: m.role, sections: m.sections }, remints: access.remints + 1 }); });
          }
          try { await remint; } catch (mintErr) {
            throw new ApiError(mintErr.error_class ?? 'AuthError', 'GET', paths[key],
              `answered HTTP 401, and minting a new admin token failed: ${mintErr.message}`, 401, mintErr.body ?? null);
          }
          if (!live()) throw err;
          try {
            return await call(getJson, paths[key], adminToken);
          } catch (again) {
            if (again.status === 401) {
              throw new ApiError('AuthError', 'GET', paths[key], `still answered HTTP 401 after a new admin token was minted, with: ${again.body}`, 401, again.body);
            }
            throw again;
          }
        }
      };

      await Promise.all(Object.keys(paths).map(async (key) => {
        set(key, { status: LOADING });
        try {
          const { status, body } = await read(key);
          if (live()) set(key, { status: OK, httpStatus: status, data: body, loadedAt: now() });
        } catch (err) {
          if (live()) set(key, { status: ERROR, error: err, loadedAt: now() });
        }
      }));
    },

    forget() {
      participantToken = null;
      adminToken = null;
      generation++;
      endpoints = blank();
      access = blankAccess();
      notify();
    },
  };
}
