// Calls the portal with a Bearer token the caller passes in: the participant token for the two
// /api/portal/mgmt calls, the minted admin token for the /api/admin reads.
//
// A token is a parameter, never a module variable here, never written to storage, never put in
// a URL and never included in an error message or a log line. When the portal's error body is
// shown, any token passed as a secret is replaced with [redacted] first.
//
// Failure modes, each with a stable error_class:
//   TimeoutError       no answer within timeoutMs            GET retried
//   NetworkError       fetch rejected (offline, CORS, DNS)   GET retried
//   UpstreamUnavailable HTTP 5xx or 429                       GET retried
//   AuthError          HTTP 401 or 403                        not retried here; session.js re-mints once on 401
//   HttpError          any other non-2xx                      not retried
//   ContractViolation  2xx whose body is not JSON             not retried
// Retry: GET only (idempotent), at most MAX_ATTEMPTS attempts, RETRY_DELAY_MS apart. POST (the
// admin-token mint) is never retried here, so a flaky network cannot mint twice behind your back.
// When every attempt fails the error carries the HTTP status and the portal's exact body.

// `domain` and `coverage` are the domain-scoped routes under -mine: the same payloads as
// /agent-domains/:key and its /coverage, gated on the dashboard section. Until they are deployed
// the portal answers 404, which the panels show as "not deployed yet", not as a failure.
export const ENDPOINT_PATHS = (domainKey) => ({
  mine: '/api/admin/agent-domains-mine',
  domain: `/api/admin/agent-domains-mine/${encodeURIComponent(domainKey)}`,
  coverage: `/api/admin/agent-domains-mine/${encodeURIComponent(domainKey)}/coverage`,
  governance: '/api/admin/agent-domain-change-requests-mine',
});
export const isDomainScopedRoute = (path) => /^\/api\/admin\/agent-domains-mine\/[^/]+(\/coverage)?$/.test(path);

// The supported sign-in, read at platform commit a82f731 (participantRoutes.ts:1533-1551).
export const MGMT_STATUS_PATH = '/api/portal/mgmt/status';
export const MGMT_ENTER_PATH = '/api/portal/mgmt/enter';
export const DEFAULT_PORTAL = 'https://enterprise.colaberry.ai';

export const TIMEOUT_MS = 15000;
export const MAX_ATTEMPTS = 2;
export const RETRY_DELAY_MS = 500;
const MAX_BODY_CHARS = 600;

export class ApiError extends Error {
  constructor(errorClass, method, path, detail, status = null, body = null) {
    super(`${errorClass}: ${method} ${path} ${detail}`);
    this.name = 'ApiError';
    this.error_class = errorClass;
    this.method = method;
    this.path = path;
    this.status = status;
    this.body = body;
  }
}

// Accepts an https origin, or http on localhost for a local portal. Returns the normalised base
// (no trailing slash) or throws with a message the form can show.
export function normaliseBaseUrl(raw) {
  let url;
  try { url = new URL(String(raw ?? '').trim()); } catch (err) {
    throw new Error(`"${raw}" is not a web address (${err.message}).`);
  }
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) {
    throw new Error('The portal address must start with https:// (http:// is accepted only for localhost).');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('The portal address must not carry a username, password, query or #fragment.');
  }
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

export function redact(text, secrets) {
  let out = String(text);
  for (const s of secrets) if (s) out = out.split(s).join('[redacted]');
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RETRYABLE = new Set(['TimeoutError', 'NetworkError', 'UpstreamUnavailable']);

async function bodyText(res, secrets) {
  let text;
  try { text = await res.text(); } catch (err) { return `(the body could not be read: ${err.message})`; }
  if (!text) return '(an empty body)';
  const clean = redact(text, secrets);
  return clean.length > MAX_BODY_CHARS ? `${clean.slice(0, MAX_BODY_CHARS)}… (cut at ${MAX_BODY_CHARS} characters)` : clean;
}

async function attempt({ fetchImpl, baseUrl, path, method, token, timeoutMs, secrets }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new ApiError('TimeoutError', method, path, `had no answer after ${timeoutMs} ms.`);
    throw new ApiError('NetworkError', method, path, `could not be reached (${redact(err.message, secrets)}). If the address is right, the portal may be refusing this page's origin.`);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const body = await bodyText(res, secrets);
    const cls = res.status === 401 || res.status === 403 ? 'AuthError'
      : res.status >= 500 || res.status === 429 ? 'UpstreamUnavailable' : 'HttpError';
    throw new ApiError(cls, method, path, `answered HTTP ${res.status} with: ${body}`, res.status, body);
  }
  try {
    return { status: res.status, body: await res.json() };
  } catch (err) {
    throw new ApiError('ContractViolation', method, path, `answered HTTP ${res.status} but the body is not JSON (${err.message}).`, res.status);
  }
}

export async function requestJson({ baseUrl, token, path, method = 'GET', fetchImpl = fetch, timeoutMs = TIMEOUT_MS,
  retryDelayMs = RETRY_DELAY_MS, secrets = [], maxAttempts: getAttempts = MAX_ATTEMPTS }) {
  const all = [token, ...secrets];
  // A caller that must call exactly once (the visitor sample) passes maxAttempts: 1.
  const maxAttempts = method === 'GET' ? getAttempts : 1;
  for (let n = 1; ; n++) {
    try {
      return await attempt({ fetchImpl, baseUrl, path, method, token, timeoutMs, secrets: all });
    } catch (err) {
      if (!(err instanceof ApiError) || !RETRYABLE.has(err.error_class) || n >= maxAttempts) {
        console.error(JSON.stringify({ level: 'error', service: 'command-center', event: 'portal_call_failed',
          outcome: 'failure', error_class: err.error_class ?? 'UnknownError', context: { method, path, status: err.status ?? null, attempts: n } }));
        throw err;
      }
      await sleep(retryDelayMs);
    }
  }
}

export const getJson = (opts) => requestJson({ ...opts, method: 'GET' });
export const postJson = (opts) => requestJson({ ...opts, method: 'POST' });
