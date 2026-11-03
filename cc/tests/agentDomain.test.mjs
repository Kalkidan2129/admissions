// Run with: node --test cc/tests/agentDomain.test.mjs
// The rules the Agent domain tab must keep: token in memory only, not-loaded distinct from
// returned-nothing, effectiveAuthority() parity with the platform, the no_tool_grants count in
// words, the owner's ladder wording, tool requests that grant nothing, and draft shown as draft.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { effectiveAuthority, RUNGS } from '../agentDomain/authority.js';
import { getJson, ApiError, normaliseBaseUrl, ENDPOINT_PATHS } from '../agentDomain/api.js';
import { createSession, NOT_LOADED, LOADING, OK, ERROR } from '../agentDomain/session.js';
import {
  panelStatus, emptyMessage, employeeView, authorityRows, noToolGrantsSummary, ladderCell,
  governanceView, gapsView, validationLabel, TOOL_REQUEST_DISCLOSURE,
} from '../agentDomain/model.js';
import { sampleEndpoints } from '../agentDomain/fixtures.js';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const TOKEN = 'tok-SECRET-123';
const P = ENDPOINT_PATHS('admissions');
const silence = () => { const orig = console.error; console.error = () => {}; return () => { console.error = orig; }; };
const response = (status, body, json = true) => ({ status, ok: status >= 200 && status < 300,
  json: async () => { if (!json) throw new SyntaxError('Unexpected token <'); return body; } });

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
  const failed = panelStatus([s(ERROR, { error: new ApiError('AuthError', P.coverage, 'was refused') })]);
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

// ── The token stays in memory ──
test('connecting never writes to browser storage, and forgetting returns every panel to not loaded', async () => {
  const writes = [];
  const store = { setItem: (k, v) => writes.push([k, v]), getItem: () => null, removeItem: () => {} };
  globalThis.localStorage = store;
  globalThis.sessionStorage = store;
  try {
    const s = createSession({ domainKey: 'admissions', fetchImpl: async () => response(200, { rows: [], domains: [], change_requests: [] }) });
    assert.ok(Object.values(s.endpoints).every((e) => e.status === NOT_LOADED));
    await s.connect('https://p', TOKEN);
    assert.ok(Object.values(s.endpoints).every((e) => e.status === OK));
    assert.equal(writes.length, 0);
    assert.ok(!JSON.stringify(s.endpoints).includes(TOKEN));
    assert.ok(!Object.keys(s).some((k) => /token/i.test(k) && k !== 'hasToken'));
    s.forget();
    assert.equal(s.hasToken, false);
    assert.ok(Object.values(s.endpoints).every((e) => e.status === NOT_LOADED));
  } finally {
    delete globalThis.localStorage;
    delete globalThis.sessionStorage;
  }
});

test('a response that arrives after "Forget token" is dropped', async () => {
  const releases = [];
  const s = createSession({ domainKey: 'admissions', fetchImpl: () => new Promise((r) => { releases.push(() => r(response(200, { rows: [] }))); }) });
  const pending = s.connect('https://p', TOKEN);
  await new Promise((r) => setTimeout(r, 0)); // let all four requests start
  s.forget();
  assert.equal(releases.length, 4);
  releases.forEach((release) => release());
  await pending;
  assert.ok(Object.values(s.endpoints).every((e) => e.status === NOT_LOADED));
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
