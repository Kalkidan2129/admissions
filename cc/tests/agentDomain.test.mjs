// Run with: node --test cc/tests/agentDomain.test.mjs
// The rules the Agent domain tab must keep: participant token -> mgmt status -> minted admin
// token, one re-mint on 401, the portal's exact words on failure, both tokens in memory only,
// not-loaded distinct from
// returned-nothing, effectiveAuthority() parity with the platform, the no_tool_grants count in
// words, the owner's ladder wording, tool requests that grant nothing, and draft shown as draft.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { effectiveAuthority, RUNGS } from '../agentDomain/authority.js';
import { getJson, postJson, ApiError, normaliseBaseUrl, ENDPOINT_PATHS, MGMT_STATUS_PATH, MGMT_ENTER_PATH } from '../agentDomain/api.js';
import { createSession, NOT_LOADED, LOADING, OK, ERROR } from '../agentDomain/session.js';
import { accessView, sectionFor } from '../agentDomain/access.js';
import {
  panelStatus, emptyMessage, employeeView, authorityRows, noToolGrantsSummary, ladderCell,
  governanceView, gapsView, validationLabel, TOOL_REQUEST_DISCLOSURE,
} from '../agentDomain/model.js';
import { sampleEndpoints } from '../agentDomain/fixtures.js';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const TOKEN = 'tok-SECRET-123';
const PARTICIPANT = 'participant-SECRET-456';
const ADMIN_1 = 'admin-SECRET-first';
const ADMIN_2 = 'admin-SECRET-second';
const P = ENDPOINT_PATHS('admissions');
const silence = () => { const orig = console.error; console.error = () => {}; return () => { console.error = orig; }; };
const response = (status, body, json = true) => ({ status, ok: status >= 200 && status < 300,
  json: async () => { if (!json) throw new SyntaxError('Unexpected token <'); return body; },
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) });

// ── effectiveAuthority(): parity with autonomyLadder.ts:185-223 at 92d103b ──
const base = { capability_id: 'c', max_permitted_autonomy: 'autonomy:R9', granted_tools: [], environment: 'sandbox', human_decision: false };

test('no approved level gives null with no_approved_autonomy', () => {
  assert.deepEqual(effectiveAuthority({ ...base, approved_autonomy: null }), { capability_id: 'c', effective_autonomy: null, reasons: ['no_approved_autonomy'] });
  assert.equal(effectiveAuthority({ ...base, approved_autonomy: 'R7' }).effective_autonomy, null); // bare rung is not a stage
});

test('approved above R2 with no tools is forced to R2 with no_tool_grants', () => {
  assert.deepEqual(effectiveAuthority({ ...base, approved_autonomy: 'autonomy:R7' }), { capability_id: 'c', effective_autonomy: 'autonomy:R2', reasons: ['no_tool_grants'] });
  assert.equal(effectiveAuthority({ ...base, approved_autonomy: 'autonomy:R2' }).reasons.length, 0);
  assert.equal(effectiveAuthority({ ...base, approved_autonomy: 'autonomy:R7', granted_tools: ['t'] }).effective_autonomy, 'autonomy:R7');
});

test('a ceiling only lowers, production flags R6+, human decisions cap at R5', () => {
  assert.deepEqual(effectiveAuthority({ ...base, approved_autonomy: 'autonomy:R6', max_permitted_autonomy: 'autonomy:R4', granted_tools: ['t'] }).reasons, ['capped_by_max_permitted']);
  assert.ok(effectiveAuthority({ ...base, approved_autonomy: 'autonomy:R6', granted_tools: ['t'], environment: 'production' }).reasons.includes('production_requires_separate_pilot_approval'));
  const hd = effectiveAuthority({ ...base, approved_autonomy: 'autonomy:R7', granted_tools: ['t'], human_decision: true });
  assert.equal(hd.effective_autonomy, 'autonomy:R5');
  assert.deepEqual(hd.reasons, ['human_decision_required_at_every_level', 'capped_below_automation_because_human_decision']);
});

// ── The ladder in the owner's words ──
test('all ten rungs match the brief word for word', () => {
  const brief = readFileSync(join(repo, 'docs', 'stories', 'admissions.STORY-000.md'), 'utf8');
  const rows = [...brief.matchAll(/^\| `(autonomy:R\d)` \| (.+) \|$/gm)].map((m) => ({ stage: m[1], meaning: m[2] }));
  assert.equal(rows.length, 10);
  assert.deepEqual(RUNGS.map((r) => ({ ...r })), rows);
});

test('ladder cells: ceiling marked, above it unreachable, R8 unreachable by fact', () => {
  const row = { ceiling: 'autonomy:R4', effective: null };
  assert.deepEqual(ladderCell('autonomy:R4', row), ['ceiling']);
  assert.deepEqual(ladderCell('autonomy:R5', row), ['unreachable']);
  assert.deepEqual(ladderCell('autonomy:R8', row), ['unreachable-fact']);
  assert.deepEqual(ladderCell('autonomy:R2', row), []);
  assert.deepEqual(ladderCell('autonomy:R2', { ceiling: null, effective: null }), ['unknown']);
});

// ── no_tool_grants count ──
test('zero constrained capabilities is said in words', () => {
  const rows = authorityRows([{ capability_id: 'a', target_autonomy: 'autonomy:R4', effective_authority: null }], []);
  const s = noToolGrantsSummary(rows);
  assert.equal(s.count, 0);
  assert.match(s.sentence, /constrains zero capabilities/);
  assert.match(s.sentence, /1 have no approved level/);
});

test('a non-zero count comes from effectiveAuthority, not from the ceiling', () => {
  const e = sampleEndpoints('admissions');
  const rows = authorityRows(e.coverage.data.rows, []);
  assert.equal(noToolGrantsSummary(rows).count, 1); // sample.report approved R7, no tools
  assert.equal(rows.find((r) => r.id === 'sample.report').effective, 'autonomy:R2');
  assert.equal(rows.find((r) => r.id === 'sample.intake').effective, null); // ceiling R4 is not authority
});

// ── Not loaded vs loading vs error vs returned nothing ──
test('each panel state is worded differently and names the endpoint', () => {
  const s = (status, extra = {}) => ({ path: P.coverage, status, ...extra });
  const notLoaded = panelStatus([s(NOT_LOADED)]);
  const loading = panelStatus([s(LOADING)]);
  const failed = panelStatus([s(ERROR, { error: new ApiError('AuthError', 'GET', P.coverage, 'answered HTTP 403 with: {}', 403) })]);
  const empty = emptyMessage({ path: P.coverage, httpStatus: 200 }, 'no capabilities');
  assert.deepEqual([notLoaded.kind, loading.kind, failed.kind], ['not-loaded', 'loading', 'error']);
  for (const m of [notLoaded.message, loading.message, failed.message, empty]) assert.ok(m.includes(`GET ${P.coverage}`), m);
  assert.match(notLoaded.message, /^Not loaded yet/);
  assert.match(empty, /answered \(HTTP 200\) and returned no capabilities/);
  assert.notEqual(notLoaded.message, empty);
  assert.equal(panelStatus([s(OK)]).kind, 'ok');
});

test('no agent is said in words, distinct from no domain', () => {
  const mine = (domains) => ({ status: OK, path: P.mine, httpStatus: 200, data: { domains } });
  assert.equal(employeeView(mine([]), 'admissions').kind, 'empty');
  const none = employeeView(mine([{ domain_key: 'admissions', agent_id: null }]), 'admissions');
  assert.equal(none.kind, 'no-agent');
  assert.match(none.message, /^No agent/);
  const ok = employeeView(sampleEndpoints('admissions').mine, 'admissions');
  assert.match(ok.fields.find(([k]) => k === 'Set by')[1], /^Not recorded by the platform/);
  assert.match(ok.fields.find(([k]) => k === 'Autonomy level')[1], /not a rung/);
});

// ── Governance: a tool request grants nothing ──
test('an approved tool request is never shown as a grant', () => {
  const v = governanceView(sampleEndpoints('admissions').governance.data.change_requests);
  assert.equal(v.tools.length, 1);
  assert.equal(v.changes.length, 1);
  assert.match(TOOL_REQUEST_DISCLOSURE, /grants nothing/);
  const text = JSON.stringify(v.tools);
  assert.doesNotMatch(text, /granted|grants? access|now has|has been given/i);
  assert.equal(v.changes[0].status, 'Pending: nobody has decided yet');
});

test('draft is shown as draft, never as agreed', () => {
  assert.match(validationLabel('draft'), /^Draft: not agreed/);
  assert.doesNotMatch(validationLabel('draft'), /approved|confirmed|signed/i);
  const gaps = gapsView(sampleEndpoints('admissions').coverage, null).map((g) => g.text).join(' ');
  assert.match(gaps, /2 of 3 capabilities are draft/);
  assert.match(gaps, /autonomy:R8 .* is unreachable by fact/);
});

// ── The API client ──
test('the token goes in the Authorization header, never the URL', async () => {
  const calls = [];
  await getJson({ baseUrl: 'https://portal.example', token: TOKEN, path: P.mine,
    fetchImpl: async (url, init) => { calls.push({ url, init }); return response(200, { domains: [] }); } });
  assert.equal(calls[0].url, `https://portal.example${P.mine}`);
  assert.ok(!calls[0].url.includes(TOKEN));
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${TOKEN}`);
  assert.equal(calls[0].init.credentials, 'omit');
});

test('401 is an AuthError, not retried, and the message never carries the token', async () => {
  const restore = silence();
  let n = 0;
  await assert.rejects(getJson({ baseUrl: 'https://p', token: TOKEN, path: P.mine, retryDelayMs: 1, fetchImpl: async () => { n++; return response(401, {}); } }),
    (err) => err.error_class === 'AuthError' && !err.message.includes(TOKEN));
  restore();
  assert.equal(n, 1);
});

test('5xx is retried once, then reported; a timeout and a non-JSON body are classified', async () => {
  const restore = silence();
  let n = 0;
  const ok = await getJson({ baseUrl: 'https://p', token: TOKEN, path: P.mine, retryDelayMs: 1,
    fetchImpl: async () => (++n === 1 ? response(503, {}) : response(200, { domains: [] })) });
  assert.equal(n, 2);
  assert.equal(ok.status, 200);
  await assert.rejects(getJson({ baseUrl: 'https://p', token: TOKEN, path: P.mine, retryDelayMs: 1, fetchImpl: async () => response(503, {}) }),
    (err) => err.error_class === 'UpstreamUnavailable');
  const hang = (_u, { signal }) => new Promise((_r, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('x'), { name: 'AbortError' }))));
  await assert.rejects(getJson({ baseUrl: 'https://p', token: TOKEN, path: P.mine, timeoutMs: 10, retryDelayMs: 1, fetchImpl: hang }), (err) => err.error_class === 'TimeoutError');
  await assert.rejects(getJson({ baseUrl: 'https://p', token: TOKEN, path: P.mine, fetchImpl: async () => response(200, null, false) }), (err) => err.error_class === 'ContractViolation');
  restore();
});

test('the portal address must be https (or http on localhost) with no query or credentials', () => {
  assert.equal(normaliseBaseUrl('https://portal.example/'), 'https://portal.example');
  assert.equal(normaliseBaseUrl('http://localhost:3001'), 'http://localhost:3001');
  assert.throws(() => normaliseBaseUrl('http://portal.example'));
  assert.throws(() => normaliseBaseUrl('https://portal.example/?token=x'));
  assert.throws(() => normaliseBaseUrl('https://user:pw@portal.example'));
  assert.throws(() => normaliseBaseUrl('not a url'));
});

// ── Sign-in: participant token -> mgmt status -> minted admin token -> /api/admin reads ──
// A fake portal that answers by path and records every call. `admin(path, token)` answers the
// /api/admin reads; `enter` is the list of answers POST /enter gives, one per call.
const MGMT = { is_mgmt: true, role: 'product_experience', label: 'Product Experience', sections: ['dashboard', 'program'] };
const minted = (token, sections = ['dashboard', 'program']) => response(200, { admin_token: token, role: 'product_experience', sections });
const allOk = () => response(200, { rows: [], domains: [], change_requests: [] });

function fakePortal({ status = () => response(200, MGMT), enter = [minted(ADMIN_1)], admin = allOk } = {}) {
  const calls = [];
  let mints = 0;
  const fetchImpl = async (url, init) => {
    const path = new URL(url).pathname;
    const token = init.headers.Authorization.replace(/^Bearer /, '');
    calls.push({ path, method: init.method, token, url });
    if (path === MGMT_STATUS_PATH) return status();
    if (path === MGMT_ENTER_PATH) return enter[Math.min(mints++, enter.length - 1)];
    return admin(path, token);
  };
  return { calls, fetchImpl, posts: () => calls.filter((c) => c.method === 'POST').length,
    adminCalls: () => calls.filter((c) => c.path.startsWith('/api/admin/')) };
}
async function signIn(portal, { quiet = false } = {}) {
  const s = createSession({ domainKey: 'admissions', fetchImpl: portal.fetchImpl });
  const restore = quiet ? silence() : () => {};
  try { await s.connect('https://p', PARTICIPANT); } finally { restore(); }
  return s;
}
const words = (s) => accessView(s.access, s.paths).lines.join(' ');
// Everything the session exposes to the page, errors included, so a token in any of it is caught.
const everything = (s) => JSON.stringify({ access: s.access, endpoints: s.endpoints, view: accessView(s.access, s.paths) },
  (_k, v) => (v instanceof Error ? { message: v.message, body: v.body } : v));

test('sign-in calls status, then enter, with the participant token; every /api/admin read uses the minted admin token', async () => {
  const portal = fakePortal();
  const s = await signIn(portal);
  assert.deepEqual(portal.calls.slice(0, 2).map((c) => [c.method, c.path, c.token]),
    [['GET', MGMT_STATUS_PATH, PARTICIPANT], ['POST', MGMT_ENTER_PATH, PARTICIPANT]]);
  const reads = portal.adminCalls();
  assert.deepEqual(reads.map((c) => c.path).sort(), Object.values(P).sort());
  assert.ok(reads.every((c) => c.method === 'GET' && c.token === ADMIN_1));
  assert.ok(portal.calls.every((c) => !c.url.includes(PARTICIPANT) && !c.url.includes(ADMIN_1)));
  assert.ok(Object.values(s.endpoints).every((e) => e.status === OK));
});

test('the page shows the status, role and sections in words, and never either token', async () => {
  const fresh = createSession({ domainKey: 'admissions', fetchImpl: fakePortal().fetchImpl });
  assert.match(words(fresh), /^Not signed in/);
  const s = await signIn(fakePortal());
  assert.match(words(s), /is a management user with the role "Product Experience" \(product_experience\), scoped to 2 sections: dashboard, program/);
  assert.match(words(s), /Admin session opened .*role product_experience, sections: dashboard, program/);
  assert.match(words(s), /Your sections cover every read on this tab/);
  assert.ok(!everything(s).includes(PARTICIPANT) && !everything(s).includes(ADMIN_1));
  assert.ok(!Object.keys(s).some((k) => /token/i.test(k) && k !== 'hasToken'));
});

test('a non-management account is said so in words, and the mint 403 body is shown exactly', async () => {
  const portal = fakePortal({ status: () => response(200, { is_mgmt: false, role: null, label: null, sections: [] }),
    enter: [response(403, { error: 'Not a management user' })] });
  const s = await signIn(portal, { quiet: true });
  assert.match(words(s), /is not a management user \(is_mgmt false\)/);
  assert.match(words(s), /answered HTTP 403 with this exact body, which you can send to the platform team: \{"error":"Not a management user"\}/);
  assert.equal(portal.adminCalls().length, 0);
  assert.ok(Object.values(s.endpoints).every((e) => e.status === NOT_LOADED));
});

test("a refused participant token stops at the status call with the portal's words, and nothing is minted", async () => {
  const portal = fakePortal({ status: () => response(401, { error: 'Authentication required' }) });
  const s = await signIn(portal, { quiet: true });
  assert.equal(portal.posts(), 0);
  assert.equal(s.access.status, ERROR);
  assert.match(words(s), /Sign-in stopped at GET \/api\/portal\/mgmt\/status\. .*HTTP 401 with: \{"error":"Authentication required"\}/);
});

test('a 401 on the admin reads mints a new admin token once, shared by every read, and retries with it', async () => {
  const portal = fakePortal({ enter: [minted(ADMIN_1), minted(ADMIN_2)],
    admin: (_p, token) => (token === ADMIN_2 ? allOk() : response(401, { error: 'Invalid or expired token' })) });
  const s = await signIn(portal, { quiet: true });
  assert.equal(portal.posts(), 2); // the first mint and exactly one re-mint, not one per panel
  assert.ok(Object.values(s.endpoints).every((e) => e.status === OK));
  assert.equal(portal.adminCalls().filter((c) => c.token === ADMIN_2).length, 4);
  assert.match(words(s), /a new admin token was minted once/);
});

test('a 401 that survives the re-mint shows the exact error words, with no second re-mint', async () => {
  const portal = fakePortal({ enter: [minted(ADMIN_1), minted(ADMIN_2)], admin: () => response(401, { error: 'Invalid or expired token' }) });
  const s = await signIn(portal, { quiet: true });
  assert.equal(portal.posts(), 2);
  for (const e of Object.values(s.endpoints)) {
    assert.equal(e.status, ERROR);
    assert.match(panelStatus([e]).message, /still answered HTTP 401 after a new admin token was minted, with: \{"error":"Invalid or expired token"\}/);
  }
});

test('a 401 whose re-mint is refused shows the mint\'s words on the panel', async () => {
  const portal = fakePortal({ enter: [minted(ADMIN_1), response(403, { error: 'Not a management user' })], admin: () => response(401, { error: 'Invalid or expired token' }) });
  const s = await signIn(portal, { quiet: true });
  assert.equal(portal.posts(), 2);
  assert.match(panelStatus([s.endpoints.mine]).message, /answered HTTP 401, and minting a new admin token failed: .*HTTP 403 with: \{"error":"Not a management user"\}/);
});

test("a 403 on an admin read is not re-minted and shows the portal's words", async () => {
  const portal = fakePortal({ admin: (p) => (p === P.coverage ? response(403, { error: 'Section not permitted' }) : allOk()) });
  const s = await signIn(portal, { quiet: true });
  assert.equal(portal.posts(), 1);
  assert.match(panelStatus([s.endpoints.coverage]).message, /HTTP 403 with: \{"error":"Section not permitted"\}/);
});

test('every read this tab makes needs dashboard, not program, and a missing dashboard is named before any 403', async () => {
  assert.deepEqual(Object.values(P).map(sectionFor), ['dashboard', 'dashboard', 'dashboard', 'dashboard']);
  assert.equal(sectionFor('/api/admin/agent-domains/admissions'), 'program'); // the unscoped route this tab no longer reads
  const ok = await signIn(fakePortal({ enter: [minted(ADMIN_1, ['dashboard'])] }));
  assert.match(words(ok), /Your sections cover every read on this tab/);
  assert.doesNotMatch(words(ok), /needs program/);
  const short = await signIn(fakePortal({ enter: [minted(ADMIN_1, ['program'])] }));
  assert.match(words(short), /Your sections do not include dashboard, so expect HTTP 403/);
});

test('a token the portal echoes in an error body is redacted, and the mint POST is never retried', async () => {
  const restore = silence();
  await assert.rejects(getJson({ baseUrl: 'https://p', token: ADMIN_1, path: P.mine, secrets: [PARTICIPANT],
    fetchImpl: async () => response(401, `bad token ${ADMIN_1} from ${PARTICIPANT}`) }),
  (err) => !err.message.includes(ADMIN_1) && !err.message.includes(PARTICIPANT) && /bad token \[redacted\] from \[redacted\]/.test(err.message));
  let n = 0;
  await assert.rejects(postJson({ baseUrl: 'https://p', token: PARTICIPANT, path: MGMT_ENTER_PATH, retryDelayMs: 1,
    fetchImpl: async () => { n++; return response(503, 'down'); } }), (err) => err.error_class === 'UpstreamUnavailable');
  restore();
  assert.equal(n, 1);
});

test('a mint answer without an admin_token is a ContractViolation that never prints the body', async () => {
  const s = await signIn(fakePortal({ enter: [response(200, { role: 'x', sections: [], note: PARTICIPANT })] }));
  assert.equal(s.access.error.error_class, 'ContractViolation');
  assert.ok(!everything(s).includes(PARTICIPANT));
});

// ── Both tokens stay in memory ──
test('signing in never writes to browser storage, and "Forget token" clears both tokens', async () => {
  const writes = [];
  const store = { setItem: (k, v) => writes.push([k, v]), getItem: () => null, removeItem: () => {} };
  globalThis.localStorage = store;
  globalThis.sessionStorage = store;
  try {
    const portal = fakePortal();
    const s = await signIn(portal);
    assert.equal(writes.length, 0);
    s.forget();
    assert.equal(s.hasToken, false);
    assert.equal(s.access.status, NOT_LOADED);
    assert.equal(s.access.entered, null);
    assert.ok(Object.values(s.endpoints).every((e) => e.status === NOT_LOADED));
    assert.ok(!everything(s).includes(ADMIN_1) && !everything(s).includes(PARTICIPANT));
  } finally {
    delete globalThis.localStorage;
    delete globalThis.sessionStorage;
  }
});

test('an admin read that answers after "Forget token" is dropped', async () => {
  const releases = [];
  const portal = fakePortal({ admin: () => new Promise((r) => { releases.push(() => r(response(200, { rows: [] }))); }) });
  const s = createSession({ domainKey: 'admissions', fetchImpl: portal.fetchImpl });
  const pending = s.connect('https://p', PARTICIPANT);
  for (let i = 0; i < 50 && releases.length < 4; i++) await new Promise((r) => setTimeout(r, 0));
  s.forget();
  assert.equal(releases.length, 4);
  releases.forEach((release) => release());
  await pending;
  assert.ok(Object.values(s.endpoints).every((e) => e.status === NOT_LOADED));
});

test('an admin token minted after "Forget token" is never used', async () => {
  let release;
  const held = new Promise((r) => { release = () => r(minted(ADMIN_1)); });
  const portal = fakePortal({ enter: [held] });
  const s = createSession({ domainKey: 'admissions', fetchImpl: portal.fetchImpl });
  const pending = s.connect('https://p', PARTICIPANT);
  for (let i = 0; i < 50 && portal.posts() === 0; i++) await new Promise((r) => setTimeout(r, 0));
  s.forget();
  release();
  await pending;
  assert.equal(portal.adminCalls().length, 0);
  assert.equal(s.access.status, NOT_LOADED);
  assert.ok(!everything(s).includes(ADMIN_1));
});

test('no Agent domain source touches browser storage or cookies', () => {
  const dirs = [join(repo, 'cc', 'agentDomain'), join(repo, 'cc', 'tabs')];
  for (const dir of dirs) {
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
      if (dir.endsWith('tabs') && f !== 'agentDomain.js') continue;
      // Code only: the comments that say "never written to localStorage" are allowed to say so.
      const code = readFileSync(join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      assert.doesNotMatch(code, /localStorage|sessionStorage|document\.cookie|indexedDB/, f);
    }
  }
});

test('sample responses are labelled as sample', () => {
  const e = sampleEndpoints('admissions');
  assert.match(e.mine.data.domains[0].agent_display_name, /^Sample/);
  for (const r of e.coverage.data.rows) assert.match(r.capability_name, /^Sample/);
  for (const r of e.governance.data.change_requests) assert.match(r.title, /^Sample/);
});

// ── Domain-scoped routes, the "not deployed yet" state, and panel 3 from agent-domains-mine ──
// A minimal DOM, just enough for dom.js's h() and table(), so the panels can be rendered and read.
class FakeNode {
  constructor(tag) { this.tag = tag; this.className = ''; this.attrs = {}; this.children = []; }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener() {}
  append(c) { this.children.push(c); }
  get textContent() { return this.children.map((c) => (c instanceof FakeNode ? c.textContent : c)).join(''); }
  all() { return [this, ...this.children.filter((c) => c instanceof FakeNode).flatMap((c) => c.all())]; }
  classes() { return this.all().flatMap((n) => n.className.split(' ').filter(Boolean)); }
}
globalThis.Node = FakeNode;
globalThis.document = { createElement: (tag) => new FakeNode(tag) };
const { ladderPanel, inventoryPanel, behaviourPanel } = await import('../agentDomain/panels.js');

const sample = sampleEndpoints('admissions');
const at = (key, value) => ({ ...sample, [key]: { path: P[key], ...value } });
const httpError = (key, status, body) => ({ status: ERROR, path: P[key],
  error: new ApiError(status === 404 ? 'HttpError' : 'AuthError', 'GET', P[key], `answered HTTP ${status} with: ${body}`, status, body) });
const undeployed = (key) => httpError(key, 404, '{"error":"Not found"}');

test('panels 2 and 4 read the domain-scoped routes, and panel 3 reads the new coverage route', () => {
  assert.equal(P.domain, '/api/admin/agent-domains-mine/admissions');
  assert.equal(P.coverage, '/api/admin/agent-domains-mine/admissions/coverage');
  const reads = (panel) => panel.all().find((n) => n.className === 'ad-source').textContent;
  assert.match(reads(inventoryPanel(sample, false)), /GET \/api\/admin\/agent-domains-mine\/admissions, GET \/api\/admin\/agent-domains-mine\/admissions\/coverage/);
  assert.match(reads(behaviourPanel(sample, false)), /GET \/api\/admin\/agent-domains-mine\/admissions\/coverage/);
  assert.match(reads(ladderPanel(sample, 'admissions', false)), /GET \/api\/admin\/agent-domains-mine, GET \/api\/admin\/agent-domains-mine\/admissions\/coverage/);
  for (const p of [ladderPanel, inventoryPanel, behaviourPanel]) assert.doesNotMatch(reads(p === ladderPanel ? p(sample, 'admissions', false) : p(sample, false)), /\/api\/admin\/agent-domains\//);
});

test('a domain-scoped route answering 404 says it is not deployed yet, unlike loading, empty and 403', () => {
  const notDeployed = panelStatus([undeployed('coverage')]);
  const forbidden = panelStatus([httpError('coverage', 403, '{"error":"Section not permitted"}')]);
  const loading = panelStatus([{ path: P.coverage, status: LOADING }]);
  const empty = emptyMessage({ path: P.coverage, httpStatus: 200 }, 'no capabilities');
  assert.equal(notDeployed.kind, 'not-deployed');
  assert.match(notDeployed.message, /^This route has not been deployed yet \(HTTP 404\)\. GET \/api\/admin\/agent-domains-mine\/admissions\/coverage/);
  assert.deepEqual([forbidden.kind, loading.kind], ['error', 'loading']);
  for (const other of [forbidden.message, loading.message, empty]) assert.doesNotMatch(other, /not been deployed/);
  // A 404 anywhere else is a real error, and a real error on a panel's other endpoint wins.
  assert.equal(panelStatus([httpError('mine', 404, '{}')]).kind, 'error');
  assert.equal(panelStatus([undeployed('domain'), httpError('coverage', 403, '{}')]).kind, 'error');
  // Rendered: its own class, not the loading, empty or error one.
  for (const panel of [inventoryPanel(at('coverage', undeployed('coverage')), false), behaviourPanel(at('coverage', undeployed('coverage')), false)]) {
    assert.ok(panel.classes().includes('ad-state-not-deployed'));
    assert.ok(!panel.classes().some((c) => ['ad-state-loading', 'ad-state-empty', 'ad-state-error'].includes(c)));
    assert.match(panel.textContent, /This route has not been deployed yet \(HTTP 404\)/);
  }
});

test('panel 3 renders from agent-domains-mine alone while coverage is not deployed, and marks no ceiling', () => {
  const panel = ladderPanel(at('coverage', undeployed('coverage')), 'admissions', false);
  const text = panel.textContent;
  for (const r of RUNGS) assert.ok(text.includes(r.meaning), r.stage);
  assert.equal(panel.all().filter((n) => n.tag === 'li').length, 10);
  assert.match(text, /Autonomy level.*observe \(the agent-level scale/);
  assert.match(text, /not a rung on the R0 to R9 ladder/);
  assert.match(text, /Tools granted0/);
  assert.match(text, /EnabledNo/);
  assert.match(text, /Ceilings can't be marked yet/);
  assert.match(text, /This route has not been deployed yet \(HTTP 404\)/);
  assert.ok(panel.classes().includes('ad-state-not-deployed'));
  assert.ok(!panel.classes().some((c) => c.startsWith('lc-')), 'no ladder cell, so no ceiling, is drawn');
  assert.doesNotMatch(text, /constrains (zero|\d+)/, 'the no_tool_grants count is not guessed');
});

test('panel 3 says ceilings cannot be marked while coverage loads, and marks them once it has', () => {
  const loading = ladderPanel(at('coverage', { status: LOADING }), 'admissions', false);
  assert.match(loading.textContent, /Ceilings can't be marked yet/);
  assert.ok(loading.classes().includes('ad-state-loading'));
  assert.match(loading.textContent, /observe \(the agent-level scale/); // the agent part does not wait
  const loaded = ladderPanel(sample, 'admissions', false);
  assert.ok(loaded.classes().includes('lc-ceiling'));
  assert.doesNotMatch(loaded.textContent, /Ceilings can't be marked yet/);
  assert.match(loaded.textContent, /no_tool_grants: The no_tool_grants rule currently constrains/);
});

test('panel 3 waits for agent-domains-mine itself, and says so', () => {
  const panel = ladderPanel(at('mine', { status: NOT_LOADED }), 'admissions', false);
  assert.ok(panel.classes().includes('ad-state-not-loaded'));
  assert.match(panel.textContent, /Not loaded yet\. .*GET \/api\/admin\/agent-domains-mine\./);
});
