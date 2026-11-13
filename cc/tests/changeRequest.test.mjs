// Run with: node --test cc/tests/changeRequest.test.mjs
// Filing a change request, the Command Center's first write. No real network: every call goes to
// a fake portal that records it. The rules: the body is exactly kind, domain_key, title and
// description; the limits are enforced; nothing is sent without Review; one press is one POST and
// File it stays off after any answer; the portal's words are shown as returned; a network error
// allows no second POST; editing after Review turns File it off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../agentDomain/session.js';
import { ENDPOINT_PATHS, MGMT_STATUS_PATH, MGMT_ENTER_PATH } from '../agentDomain/api.js';
import {
  createFiling, checkFields, buildBody, UNKNOWN_NOTE, FINAL_NOTE, TITLE_MAX, DESCRIPTION_MAX,
} from '../agentDomain/changeRequest.js';

const PARTICIPANT = 'participant-SECRET-456';
const ADMIN = 'admin-SECRET-first';
const CR_PATH = ENDPOINT_PATHS('admissions').governance;
const silence = () => { const orig = console.error; console.error = () => {}; return () => { console.error = orig; }; };
const response = (status, body) => ({ status, ok: status >= 200 && status < 300,
  json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) });

// A fake portal. `post` answers POST change-requests-mine; every call is recorded in order.
function fakePortal(post = () => response(201, { id: 'cr-1', status: 'submitted' })) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const path = new URL(url).pathname;
    calls.push({ path, method: init.method, auth: init.headers.Authorization, contentType: init.headers['Content-Type'] ?? null,
      body: init.body ?? null });
    if (path === MGMT_STATUS_PATH) return response(200, { is_mgmt: true, role: 'r', sections: ['dashboard'] });
    if (path === MGMT_ENTER_PATH) return response(200, { admin_token: ADMIN, role: 'r', sections: ['dashboard'] });
    if (path === CR_PATH && init.method === 'POST') return post(init);
    return response(200, { rows: [], domains: [], change_requests: [] });
  };
  const filePosts = () => calls.filter((c) => c.path === CR_PATH && c.method === 'POST');
  const govReads = () => calls.filter((c) => c.path === CR_PATH && c.method === 'GET');
  return { calls, fetchImpl, filePosts, govReads };
}
async function signedIn(portal) {
  const s = createSession({ domainKey: 'admissions', fetchImpl: portal.fetchImpl });
  await s.connect('https://p', PARTICIPANT);
  return s;
}
const filingFor = (s) => createFiling({ file: (b) => s.fileChangeRequest(b), reread: () => s.rereadGovernance() });
const ready = (f, title = 'Add a weekly admissions summary', description = 'Placeholder detail.') => {
  f.setTitle(title); f.setDescription(description); assert.equal(f.review(), true);
};

test('the body has exactly kind, domain_key, title and description', async () => {
  assert.deepEqual(Object.keys(buildBody('t', 'd')), ['kind', 'domain_key', 'title', 'description']);
  assert.deepEqual(buildBody('  A title  ', ' detail '), { kind: 'change', domain_key: 'admissions', title: 'A title', description: 'detail' });
  const portal = fakePortal();
  const f = filingFor(await signedIn(portal));
  ready(f);
  await f.fileIt();
  const [post] = portal.filePosts();
  assert.equal(post.contentType, 'application/json');
  assert.equal(post.auth, `Bearer ${ADMIN}`);
  const sent = JSON.parse(post.body);
  assert.deepEqual(Object.keys(sent).sort(), ['description', 'domain_key', 'kind', 'title']);
  assert.deepEqual(sent, { kind: 'change', domain_key: 'admissions', title: 'Add a weekly admissions summary', description: 'Placeholder detail.' });
});

test('the limits are enforced: title 1 to 140 with a letter, description at most 4000', () => {
  assert.equal(checkFields('', '').title.error, 'A title is required.');
  assert.equal(checkFields('   ', '').title.error, 'A title is required.');
  assert.equal(checkFields('12345 !!', '').title.error, 'A title needs at least one letter.');
  assert.equal(checkFields('a'.repeat(TITLE_MAX), '').ok, true);
  assert.equal(checkFields('a'.repeat(TITLE_MAX + 1), '').title.error, 'A title can be at most 140 characters.');
  assert.equal(checkFields(`  ${'a'.repeat(TITLE_MAX)}  `, '').ok, true, 'counted after trimming, as the portal does');
  assert.equal(checkFields('Title', 'd'.repeat(DESCRIPTION_MAX)).ok, true);
  assert.equal(checkFields('Title', 'd'.repeat(DESCRIPTION_MAX + 1)).description.error, 'A description can be at most 4000 characters.');
  assert.equal(checkFields('Título', '').ok, true, 'any letter counts, not only A to Z');
  assert.deepEqual(checkFields('abc', 'de').title.count, 3);
  const f = createFiling({ file: async () => assert.fail('must not send'), reread: async () => {} });
  f.setTitle('a'.repeat(TITLE_MAX + 1));
  assert.equal(f.canReview, false);
  assert.equal(f.review(), false);
  assert.equal(f.canFile, false);
});

test('nothing is sent without Review', async () => {
  const portal = fakePortal();
  const f = filingFor(await signedIn(portal));
  f.setTitle('A valid title');
  assert.equal(f.canFile, false);
  assert.deepEqual(await f.fileIt(), { called: false });
  assert.equal(portal.filePosts().length, 0);
});

test('Review shows the exact body, and the final note is the one asked for', () => {
  const f = createFiling({ file: async () => {}, reread: async () => {} });
  ready(f, ' Title ', ' Desc ');
  assert.deepEqual(f.reviewed, { kind: 'change', domain_key: 'admissions', title: 'Title', description: 'Desc' });
  assert.equal(FINAL_NOTE, "Once filed, this can't be edited or withdrawn.");
});

test('only one POST: File it stays off after a 201, which shows the id and status as returned, then re-reads governance', async () => {
  const portal = fakePortal(() => response(201, { id: 'cr-42', status: 'submitted', title: 'x' }));
  const f = filingFor(await signedIn(portal));
  const readsBefore = portal.govReads().length;
  ready(f);
  assert.equal(f.canFile, true);
  const [a, b] = await Promise.all([f.fileIt(), f.fileIt()]); // a double click
  assert.deepEqual([a.called, b.called], [true, false]);
  assert.equal(await f.fileIt().then((r) => r.called), false);
  assert.equal(portal.filePosts().length, 1);
  assert.deepEqual(f.outcome, { kind: 'filed', httpStatus: 201, id: 'cr-42', status: 'submitted' });
  assert.equal(f.canFile, false);
  assert.equal(f.review(), false, 'no second Review once sent');
  assert.equal(portal.govReads().length, readsBefore + 1);
  const postAt = portal.calls.indexOf(portal.filePosts()[0]);
  assert.ok(portal.calls.indexOf(portal.govReads().at(-1)) > postAt, 'the governance re-read comes after the POST');
});

test('errors are shown as returned: 400, 403 and 409 give the portal\'s exact words, and no second POST', async () => {
  const bodies = {
    400: '{"error":"Invalid input","issues":[{"path":["title"],"message":"A title needs at least one letter."}]}',
    403: '{"error":"That domain is not yours."}',
    409: '{"error":"Refused","issues":[{"rule":"no_recorded_proposer"}]}',
  };
  const restore = silence();
  try {
    for (const [code, text] of Object.entries(bodies)) {
      const portal = fakePortal(() => response(Number(code), text));
      const f = filingFor(await signedIn(portal));
      ready(f);
      await f.fileIt();
      assert.deepEqual(f.outcome, { kind: 'refused', httpStatus: Number(code), words: text }, code);
      assert.equal(f.canFile, false, code);
      await f.fileIt();
      assert.equal(portal.filePosts().length, 1, code);
      assert.doesNotMatch(JSON.stringify(f.outcome), /SECRET/, code);
    }
  } finally { restore(); }
});

test('a network error allows no second POST, re-reads governance first, then says it is unknown', async () => {
  const portal = fakePortal(() => { throw new TypeError('Failed to fetch'); });
  const s = await signedIn(portal);
  const seen = [];
  const f = createFiling({ file: (b) => s.fileChangeRequest(b),
    reread: async () => { seen.push(f.outcome); await s.rereadGovernance(); } });
  const readsBefore = portal.govReads().length;
  ready(f);
  const restore = silence();
  try { await f.fileIt(); } finally { restore(); }
  assert.deepEqual(seen, [null], 'the governance list is re-read before the result is shown');
  assert.equal(portal.govReads().length, readsBefore + 1);
  assert.equal(f.outcome.kind, 'unknown');
  assert.equal(f.outcome.words, UNKNOWN_NOTE);
  assert.equal(UNKNOWN_NOTE, 'Unknown whether it was filed: check the governance panel');
  assert.equal(f.canFile, false);
  assert.deepEqual(await f.fileIt(), { called: false });
  assert.equal(portal.filePosts().length, 1);
});

test('editing after Review turns File it off until Review again', () => {
  const f = createFiling({ file: async () => ({ status: 201, body: {} }), reread: async () => {} });
  ready(f);
  assert.equal(f.canFile, true);
  f.setTitle('Add a weekly admissions summary.');
  assert.equal(f.canFile, false);
  assert.equal(f.reviewed, null);
  assert.equal(f.review(), true);
  assert.equal(f.canFile, true);
  f.setDescription('Changed.');
  assert.equal(f.canFile, false);
  f.setDescription('Changed.'); // the same value again is not an edit, and does not re-enable
  assert.equal(f.canFile, false);
});

test('signed out, File it sends nothing and can be tried again once signed in', async () => {
  const portal = fakePortal();
  const s = createSession({ domainKey: 'admissions', fetchImpl: portal.fetchImpl });
  const f = filingFor(s);
  ready(f);
  await f.fileIt();
  assert.equal(f.outcome.kind, 'not-sent');
  assert.equal(portal.calls.length, 0);
  assert.equal(f.canFile, true);
});
