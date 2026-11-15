// Run with: node --test cc/tests/worksheet.test.mjs
// The by-hand worksheet for admissions.CAP.page_event_admissions_enrichment.L1-BY-HAND: nothing
// pre-filled, a download with no paths, titles or ids, and a timer that records elapsed time.
// No real network: every response below is made up, and nothing here calls fetch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { evaluate, SIGNALS_PATH } from '../visitorSample/model.js';
import {
  WORKSHEET_SIZE, RUN_LOG_FILE, worksheetRows, forbiddenStrings, createWorksheet, createTimer, leakFindings, runLogFile,
} from '../visitorSample/worksheet.js';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');

// A minimal DOM, enough for dom.js and the panel (which sets textContent, hidden and disabled).
class FakeNode {
  constructor(tag) { this.tag = tag; this.className = ''; this.attrs = {}; this.children = []; this.listeners = {}; }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(k, f) { this.listeners[k] = f; }
  append(c) { this.children.push(c); }
  get textContent() { return this.children.map((c) => (c instanceof FakeNode ? c.textContent : c)).join(''); }
  set textContent(v) { this.children = [String(v)]; }
  all() { return [this, ...this.children.filter((c) => c instanceof FakeNode).flatMap((c) => c.all())]; }
}
globalThis.Node = FakeNode;
globalThis.document = { createElement: (tag) => new FakeNode(tag) };
const { worksheetPanel } = await import('../visitorSample/worksheetPanel.js');

const ev = (path, title) => ({ event_type: 'pageview', page_path: path, page_title: title, timestamp: '2026-11-09T20:00:00.000Z' });
const visitor = (i) => ({ anon_id: `anon-id-${i}`, interests: ['pricing', 'curriculum'], visitor_type: 'new',
  page_events: [ev(`/pricing/plan-${i}`, `Pricing Plan ${i}`), ev('/program', null)], page_event_count: 2 });
const body = (n) => ({ domain_key: 'admissions', visitors: Array.from({ length: n }, (_, i) => visitor(i + 1)),
  returned: n, matching: n, not_recorded: ['ip_address'], disclosure: 'Made-up disclosure for a test.' });

test('nothing is pre-filled: every tag and reason starts empty, though the route returned interests', () => {
  const evaluation = evaluate(body(14));
  const rows = worksheetRows(evaluation);
  assert.equal(rows.length, WORKSHEET_SIZE);
  assert.deepEqual(rows.map((r) => r.label), ['V01', 'V02', 'V03', 'V04', 'V05', 'V06', 'V07', 'V08', 'V09', 'V10']);
  const ws = createWorksheet(rows.map((r) => r.label));
  for (const l of ws.labels) assert.deepEqual(ws.entry(l), { tags: '', reason: '' });

  const panel = worksheetPanel(evaluation, () => {});
  const inputs = panel.all().filter((n) => n.tag === 'input');
  const areas = panel.all().filter((n) => n.tag === 'textarea');
  assert.equal(inputs.length, 10);
  assert.equal(areas.length, 10);
  for (const i of inputs) assert.equal(i.attrs.value ?? '', '');
  for (const a of areas) assert.equal(a.textContent, '');
  for (const n of panel.all()) assert.equal(n.attrs.placeholder, undefined, 'no placeholder hints at a tag');
  // On screen: each event's path, title and time, and the interests as returned.
  const text = panel.textContent;
  assert.match(text, /\/pricing\/plan-1/);
  assert.match(text, /Pricing Plan 10/);
  assert.match(text, /\(no title\): null in the response/);
  assert.match(text, /Interests the route returned: pricing, curriculum/);
  assert.match(text, /9 November 2026, 2:00 PM CST/);
  assert.doesNotMatch(text, /V11/);
  assert.doesNotMatch(text, /anon-id-/);
});

test('the download holds only V-labels, typed tags and reasons, event counts and the timer: no paths, titles or ids', () => {
  const evaluation = evaluate(body(12));
  const rows = worksheetRows(evaluation);
  let t = new Date('2026-11-14T16:00:00Z');
  const ws = createWorksheet(rows.map((r) => r.label), { now: () => t });
  ws.timer.start();
  ws.setTags('V01', ' pricing , enrollment ,');
  ws.setReason('V01', 'Looked at the plan page twice.');
  t = new Date('2026-11-14T16:30:00Z');
  ws.timer.stop();

  const file = runLogFile(ws, rows, forbiddenStrings(evaluation));
  const json = JSON.stringify(file);
  for (const v of body(12).visitors) {
    assert.ok(!json.includes(v.anon_id), v.anon_id);
    for (const e of v.page_events) {
      assert.ok(!json.includes(e.page_path), e.page_path);
      if (e.page_title) assert.ok(!json.includes(e.page_title), e.page_title);
    }
  }
  assert.deepEqual(Object.keys(file), ['story', 'timer', 'visitors']);
  assert.equal(file.visitors.length, 10);
  assert.deepEqual(Object.keys(file.visitors[0]), ['visitor', 'tags_typed', 'tags', 'reason', 'events_returned', 'page_event_count']);
  assert.deepEqual(file.visitors[0], { visitor: 'V01', tags_typed: 'pricing , enrollment ,', tags: ['pricing', 'enrollment'],
    reason: 'Looked at the plan page twice.', events_returned: 2, page_event_count: 2 });
  // A visitor nobody classified stays empty in the file, never filled from the route's interests.
  assert.deepEqual(file.visitors[1], { visitor: 'V02', tags_typed: '', tags: [], reason: '', events_returned: 2, page_event_count: 2 });
  assert.equal(RUN_LOG_FILE, 'run-log-entries.json');
});

test('a typed path, title or id refuses the download and names the field, not the text', () => {
  const evaluation = evaluate(body(10));
  const rows = worksheetRows(evaluation);
  const forbidden = forbiddenStrings(evaluation);
  const ws = createWorksheet(rows.map((r) => r.label));
  ws.setReason('V02', 'Went to /pricing/plan-2 then left');
  ws.setTags('V05', 'Pricing Plan 5');
  ws.setReason('V07', 'same person as anon-id-3?');
  assert.deepEqual(leakFindings(ws, forbidden), [
    { label: 'V02', field: 'reason' }, { label: 'V05', field: 'tags' }, { label: 'V07', field: 'reason' }]);
  assert.throws(() => runLogFile(ws, rows, forbidden), (err) => {
    assert.match(err.message, /V02 reason, V05 tags, V07 reason/);
    assert.ok(!err.message.includes('/pricing/plan-2') && !err.message.includes('anon-id-3'));
    return true;
  });
  // Short strings such as "/" are not checked, so a slash in a reason is fine.
  ws.setReason('V02', 'a/b');
  ws.setTags('V05', 'pricing');
  ws.setReason('V07', '');
  assert.deepEqual(leakFindings(ws, forbiddenStrings({ ok: true, rows: [{ events: [ev('/', 'Hi')] }], anonIds: [] })), []);
  assert.doesNotThrow(() => runLogFile(ws, rows, forbidden));
});

test('the timer records the date, start, end and elapsed minutes, in Central', () => {
  let t = new Date('2026-11-14T15:05:00Z');
  const timer = createTimer({ now: () => t });
  assert.equal(timer.stop(), false, 'cannot stop before starting');
  assert.deepEqual(timer.record(), { date_central: null, started_central: null, stopped_central: null,
    started_at: null, stopped_at: null, elapsed_minutes: null, state: 'not started' });
  assert.equal(timer.start(), true);
  t = new Date('2026-11-14T15:20:00Z');
  assert.equal(timer.start(), false, 'a second start does not reset it');
  assert.equal(timer.record().state, 'running');
  assert.equal(timer.record().elapsed_minutes, null);
  t = new Date('2026-11-14T15:52:30Z');
  assert.equal(timer.stop(), true);
  assert.equal(timer.stop(), false);
  assert.deepEqual(timer.record(), {
    date_central: '2026-11-14', started_central: '14 November 2026, 9:05 AM CST', stopped_central: '14 November 2026, 9:52 AM CST',
    started_at: '2026-11-14T15:05:00.000Z', stopped_at: '2026-11-14T15:52:30.000Z', elapsed_minutes: 47.5, state: 'stopped' });
  // The date is the Central date: 11:30 PM CST on the 13th is still the 13th.
  const late = createTimer({ now: () => new Date('2026-11-14T05:30:00Z') });
  late.start();
  assert.equal(late.record().date_central, '2026-11-13');
});

test('no new route and no write: the worksheet reads only the one pull, and its file is gitignored', () => {
  for (const f of ['worksheet.js', 'worksheetPanel.js']) {
    const code = readFileSync(join(repo, 'cc', 'visitorSample', f), 'utf8');
    assert.doesNotMatch(code, /fetch\(|readOnce|\/api\/|localStorage|sessionStorage|indexedDB/, f);
  }
  assert.equal(SIGNALS_PATH, '/api/admin/agent-domains-mine/admissions/admissions-signals?limit=35&events_per_visitor=20');
  const ignored = readFileSync(join(repo, '.gitignore'), 'utf8').split(/\r?\n/);
  assert.ok(ignored.includes('run-log-entries.json'));
});
