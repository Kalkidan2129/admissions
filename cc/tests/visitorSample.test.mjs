// Run with: node --test cc/tests/visitorSample.test.mjs
// The rules the Visitor sample tab must keep for admissions.CAP.page_event_admissions_enrichment:
// summaries built only from a visitor's own returned events, "(no title)" never filled from the
// path, zero-event visitors skipped, partial visitors marked, invented titles caught, one pull and
// no second, no join across pulls, and a download with no ids, paths, titles or tags.
// No real network calls: every response below is made up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NO_TITLE, SAMPLE_SIZE, SIGNALS_PATH, MAX_LIMIT, signalsPath, buildSummary, checkSummary, evaluate, resultsFile, selectSample,
  responseProblems, visitorProblems, totalsLine,
} from '../visitorSample/model.js';
import { createPuller } from '../visitorSample/pull.js';
import { createSession } from '../agentDomain/session.js';
import { MGMT_STATUS_PATH, MGMT_ENTER_PATH } from '../agentDomain/api.js';

const ev = (title, path = '/pricing', type = 'pageview') => ({ event_type: type, page_path: path, page_title: title, timestamp: '2026-11-09T20:00:00.000Z' });
const visitor = (id, events, extra = {}) => ({ anon_id: id, interests: ['pricing'], visitor_type: 'new', page_events: events, page_event_count: events.length, ...extra });
const body = (visitors) => ({ domain_key: 'admissions', visitors, returned: visitors.length, matching: visitors.length,
  not_recorded: ['ip_address', 'user_agent'], disclosure: 'Made-up disclosure for a test.' });
const silence = () => { const orig = console.error; console.error = () => {}; return () => { console.error = orig; }; };

test('the route path is the one the platform merged in PR 3779, with limit=20 and events_per_visitor=20', () => {
  assert.equal(SIGNALS_PATH, '/api/admin/agent-domains-mine/admissions/admissions-signals?limit=20&events_per_visitor=20');
});

test('a limit above 20 is never allowed', () => {
  for (const [limit, events] of [[21, 20], [20, 21], [100, 200], [0, 20], [20, 0], [1.5, 20], ['20', 20]]) {
    assert.throws(() => signalsPath(limit, events), RangeError, `${limit}, ${events}`);
  }
  assert.equal(MAX_LIMIT, 20);
  assert.equal(signalsPath(20, 20), SIGNALS_PATH);
});

test('fewer than 20 of the 20 returned have events: reported plainly, and not pulled again with a bigger limit', async () => {
  const vs = [];
  for (let i = 0; i < 20; i++) vs.push(i % 4 === 0 ? visitor(`z${i}`, []) : visitor(`v${i}`, [ev(`Page ${i}`)]));
  const paths = [];
  const p = createPuller({ read: async (path) => { paths.push(path); return { status: 200, body: body(vs) }; } });
  await p.pull();
  await p.pull();
  assert.deepEqual(paths, [SIGNALS_PATH]); // one call, limit=20, never a bigger one
  const r = p.state.evaluation;
  assert.equal(r.totals.sampled, 15);
  assert.equal(r.sample.skippedNoEvents, 5);
  assert.equal(r.sample.short, true);
  assert.equal(totalsLine(r.totals), '15 of 15 match · 0 fabricated titles (only 15 sampled; the criterion asks for 20)');
});

test('a matching summary passes', () => {
  const v = visitor('a1', [ev('Pricing'), ev('Enroll now', '/enroll'), ev('Pricing')], { interests: ['pricing', 'enrollment'] });
  const s = buildSummary(v);
  assert.deepEqual(s.tags, ['pricing', 'enrollment']);
  assert.deepEqual(s.titles, ['Pricing', 'Enroll now']);
  assert.deepEqual(checkSummary(s, v), { fabricatedTitles: 0, unknownTags: 0, result: 'Match' });
});

test('an invented title is caught as fabricated', () => {
  const v = visitor('a1', [ev('Pricing')]);
  const s = { ...buildSummary(v), titles: ['Pricing', 'Data Analytics Bootcamp'] };
  assert.deepEqual(checkSummary(s, v), { fabricatedTitles: 1, unknownTags: 0, result: 'Mismatch' });
  // A tag the route did not return is a mismatch too.
  assert.equal(checkSummary({ ...buildSummary(v), tags: ['pricing', 'enterprise'] }, v).result, 'Mismatch');
});

test('a missing page_title shows "(no title)" and is never filled in from page_path', () => {
  const v = visitor('a1', [ev(null, '/program/data-analytics'), ev('Pricing')]);
  const s = buildSummary(v);
  assert.deepEqual(s.titles, [NO_TITLE, 'Pricing']);
  assert.ok(!s.titles.some((t) => /program|data-analytics|analytics/i.test(t)));
  assert.equal(checkSummary(s, v).result, 'Match');
  // "(no title)" is only honest where an event really has no title.
  const titled = visitor('a2', [ev('Pricing')]);
  assert.equal(checkSummary({ ...buildSummary(titled), titles: ['Pricing', NO_TITLE] }, titled).fabricatedTitles, 1);
});

test('visitors with zero events are skipped and counted, and the first 20 in order are kept', () => {
  const vs = [];
  for (let i = 0; i < 30; i++) vs.push(i % 3 === 0 ? visitor(`z${i}`, []) : visitor(`v${i}`, [ev(`Page ${i}`)]));
  const s = selectSample(vs);
  assert.equal(s.chosen.length, SAMPLE_SIZE);
  assert.ok(s.chosen.every((v) => v.page_event_count >= 1));
  assert.deepEqual(s.chosen.slice(0, 3).map((v) => v.anon_id), ['v1', 'v2', 'v4']); // order returned
  assert.equal(s.skippedNoEvents, 10); // positions 1, 4, ..., 28 come before the 20th kept visitor
  assert.equal(s.notReached, 0);
  assert.equal(s.short, false);
});

test('fewer than 20 visitors with events is reported as short, not padded', () => {
  const r = evaluate(body([visitor('a', [ev('One')]), visitor('b', []), visitor('c', [ev('Two')])]));
  assert.equal(r.totals.sampled, 2);
  assert.equal(r.sample.short, true);
  assert.equal(r.sample.skippedNoEvents, 1);
  assert.equal(totalsLine(r.totals), '2 of 2 match · 0 fabricated titles (only 2 sampled; the criterion asks for 20)');
});

test('a visitor with more events than were returned is marked partial and claims only those', () => {
  const v = visitor('a1', [ev('Pricing')], { page_event_count: 250 });
  const s = buildSummary(v);
  assert.equal(s.partial, true);
  assert.equal(s.eventsReturned, 1);
  assert.equal(s.pageEventCount, 250);
  assert.deepEqual(s.titles, ['Pricing']);
  assert.equal(buildSummary(visitor('a2', [ev('Pricing')])).partial, false);
});

test('no second pull happens: a finished pull is reused and concurrent clicks share one call', async () => {
  let calls = 0;
  let release;
  const gate = new Promise((r) => { release = r; });
  const read = async (path) => { calls++; assert.equal(path, SIGNALS_PATH); await gate; return { status: 200, body: body([visitor('a', [ev('One')])]) }; };
  const p = createPuller({ read, now: () => new Date('2026-11-11T18:00:00Z') });
  const first = p.pull();
  const second = p.pull(); // clicked again while in flight
  release();
  await Promise.all([first, second]);
  await p.pull(); // clicked again after it finished
  assert.equal(calls, 1);
  assert.equal(p.state.status, 'done');
  assert.equal(p.state.pulledAt.toISOString(), '2026-11-11T18:00:00.000Z');
});

test('a failed pull samples nothing and shows the error, and may be tried again', async () => {
  let calls = 0;
  const p = createPuller({ read: async () => { calls++; if (calls === 1) throw new Error('AuthError: GET … answered HTTP 403 with: {"error":"x"}'); return { status: 200, body: body([]) }; } });
  await p.pull();
  assert.equal(p.state.status, 'error');
  assert.match(p.state.error.message, /HTTP 403/);
  await p.pull();
  await p.pull();
  assert.equal(calls, 2); // one retry by hand, then fixed
});

test('visitors are never joined across pulls, or by anon_id within one', () => {
  // The same anon_id in two pulls, with different events: each summary uses only its own pull.
  const a = evaluate(body([visitor('same', [ev('Pricing')])]));
  const b = evaluate(body([visitor('same', [ev('Enroll now')])]));
  assert.deepEqual(a.rows[0].summary.titles, ['Pricing']);
  assert.deepEqual(b.rows[0].summary.titles, ['Enroll now']);
  // A title from the other pull is fabricated for this one.
  assert.equal(checkSummary({ ...a.rows[0].summary, titles: ['Enroll now'] }, { interests: ['pricing'], page_events: [ev('Pricing')] }).fabricatedTitles, 1);
  // Two visitors sharing an anon_id in one response keep their own events.
  const one = evaluate(body([visitor('dup', [ev('One')]), visitor('dup', [ev('Two')])]));
  assert.deepEqual(one.rows.map((r) => r.summary.titles), [['One'], ['Two']]);
});

test('a missing field is shown by name and nothing is filled in', () => {
  assert.deepEqual(responseProblems({ visitors: [], returned: 0, matching: 0, not_recorded: [] }), ['disclosure (a sentence)']);
  assert.equal(evaluate({ visitors: [] }).ok, false);
  const noTitleKey = { anon_id: 'a', interests: [], page_event_count: 1, page_events: [{ event_type: 'pageview', page_path: '/x', timestamp: null }] };
  assert.deepEqual(visitorProblems(noTitleKey), ['page_events[1].page_title']);
  const r = evaluate(body([noTitleKey, visitor('b', [ev('Two')])]));
  assert.deepEqual(r.sample.malformed, [{ position: 1, problems: ['page_events[1].page_title'] }]);
  assert.equal(r.totals.sampled, 1);
});

test('the download holds the table, totals, pull time, limits and skipped count, and no ids, paths, titles or tags', () => {
  const vs = [visitor('anon-SECRET-1', [ev('Secret Title One', '/secret-path-one')], { interests: ['secret-tag'] }), visitor('anon-SECRET-2', [])];
  const r = evaluate(body(vs));
  const file = resultsFile(r, new Date('2026-11-11T18:00:00Z'), '12:00 PM CST on 2026-11-11');
  assert.deepEqual(Object.keys(file).sort(), ['events_per_visitor', 'limit', 'pulled_at', 'pulled_at_central', 'rows', 'skipped_no_events', 'story', 'totals']);
  assert.equal(file.limit, 20);
  assert.equal(file.events_per_visitor, 20);
  assert.equal(file.skipped_no_events, 1);
  assert.deepEqual(file.rows, [{ visitor: 'V01', events_returned: 1, page_event_count: 1, partial: false, titles_in_summary: 1, fabricated_titles: 0, result: 'Match' }]);
  const text = JSON.stringify(file);
  for (const leak of ['anon-SECRET', 'Secret Title', 'secret-path', 'secret-tag', 'anon_id', 'page_path', 'page_title']) assert.ok(!text.includes(leak), leak);
});

// ── session.readOnce: same token, one call, no retry, token never shown ──
const ADMIN = 'admin-SECRET-xyz';
const PARTICIPANT = 'participant-SECRET-abc';
const res = (status, b) => ({ status, ok: status >= 200 && status < 300, json: async () => b, text: async () => JSON.stringify(b) });

function portal(signals) {
  const seen = [];
  const fetchImpl = async (url, init) => {
    const path = url.replace('https://portal.test', '');
    seen.push({ path, auth: init.headers.Authorization });
    if (path === MGMT_STATUS_PATH) return res(200, { is_mgmt: true, role: 'lead_intake', sections: ['dashboard'] });
    if (path === MGMT_ENTER_PATH) return res(200, { admin_token: ADMIN, role: 'lead_intake', sections: ['dashboard'] });
    if (path === SIGNALS_PATH) return signals();
    return res(200, {});
  };
  return { seen, fetchImpl };
}

test('the pull uses the minted admin token once, with no retry, and never shows it', async () => {
  const restore = silence();
  try {
    const { seen, fetchImpl } = portal(() => res(503, { error: `down, token was ${ADMIN}` }));
    const s = createSession({ domainKey: 'admissions', fetchImpl });
    await s.connect('https://portal.test', PARTICIPANT);
    const p = createPuller({ read: (path) => s.readOnce(path) });
    await p.pull();
    const calls = seen.filter((c) => c.path === SIGNALS_PATH);
    assert.equal(calls.length, 1); // a 503 is not retried for this read
    assert.equal(calls[0].auth, `Bearer ${ADMIN}`);
    assert.equal(p.state.status, 'error');
    assert.match(p.state.error.message, /HTTP 503/);
    assert.ok(!p.state.error.message.includes(ADMIN) && !p.state.error.message.includes(PARTICIPANT));
    assert.ok(!JSON.stringify({ access: s.access, endpoints: s.endpoints }).includes(ADMIN));
  } finally { restore(); }
});

test('the pull is refused before sign-in, without calling the portal', async () => {
  const { seen, fetchImpl } = portal(() => res(200, body([])));
  const s = createSession({ domainKey: 'admissions', fetchImpl });
  await assert.rejects(s.readOnce(SIGNALS_PATH), /sign in on the Agent domain tab first/);
  assert.equal(seen.length, 0);
});
