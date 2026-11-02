// Run with: node --test cc/tests/tabs.test.mjs
// Pure helpers behind the tabs and the Knowledge base chat, tested against the
// sample data shape and against an empty plan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleData } from '../sample.js';
import { answer, CANNOT_ANSWER } from '../kbAnswer.js';
import { describeSlip } from '../time.js';
import { storiesForRole } from '../tabs/users.js';
import { guardrailStatus } from '../tabs/guardrails.js';
import { ownerGroups } from '../tabs/agents.js';
import { fieldsOf } from '../tabs/datamodel.js';
import { joinStories } from '../data.js';

const data = sampleData(new Date('2030-01-20T12:00:00Z'));
const empty = { plan: { stories: [], releases: [] }, progress: { totals: {}, stories: [] }, manifest: {}, notes: { entries: [] } };

test('chat answers a story question and cites Project management', () => {
  const a = answer('what is SAMPLE-3?', data, '2030-01-20');
  assert.match(a.text, /SAMPLE-3 \(Sample story: reviewer queue\): in progress, 1 of 3 criteria passed/);
  assert.equal(a.cites[0].label, 'Project management');
});

test('chat recognises a story by its short name, and not by a longer one', () => {
  const d = {
    plan: { stories: [{ id: 'p.RESEARCH-1-A', title: 'One' }, { id: 'p.RESEARCH-10-B', title: 'Ten' }] },
    progress: { stories: [{ id: 'p.RESEARCH-1-A' }, { id: 'p.RESEARCH-10-B' }] },
  };
  assert.match(answer('What is RESEARCH-10?', d, '2030-01-20').text, /^p\.RESEARCH-10-B/);
  assert.match(answer('what is research-1?', d, '2030-01-20').text, /^p\.RESEARCH-1-A/);
});

test('chat answers totals from progress.totals and cites Overview', () => {
  const a = answer('How many stories are verified?', data, '2030-01-20');
  assert.equal(a.text, '2 of 4 stories verified, 1 in progress, 1 not started.');
  assert.equal(a.cites[0].label, 'Overview');
});

test('chat says it cannot answer instead of guessing', () => {
  assert.equal(answer('what is the weather in Dallas', data, '2030-01-20').text, CANNOT_ANSWER);
  assert.equal(answer('', data, '2030-01-20').cites.length, 0);
});

test('chat on an empty plan reports zero honestly', () => {
  assert.equal(answer('which systems are connected?', empty, '2030-01-20').text, 'The plan names no external system yet.');
  assert.match(answer('any guardrails?', empty, '2030-01-20').text, /0 guardrails/);
});

test('past-due count ignores verified stories', () => {
  // SAMPLE-1 (due 2030-01-17) is verified; nothing else is due before 2030-01-25 except SAMPLE-2 (verified).
  assert.match(answer('what is overdue?', data, '2030-01-25').text, /^0 stories/);
  assert.match(answer('what is overdue?', data, '2030-02-10').text, /^1 story/);
});

test('slippage is measured from the first date given', () => {
  assert.equal(describeSlip('2030-01-24', '2030-01-20'), 'moved 4 days later');
  assert.equal(describeSlip('2026-09-20', '2026-10-20'), 'moved 30 days earlier');
  assert.equal(describeSlip('2030-01-17', '2030-01-17'), 'on its first date');
  assert.equal(describeSlip(null, '2030-01-17'), 'no baseline in the plan');
});

test('roles match only the "As a <role>" form', () => {
  assert.deepEqual(storiesForRole(data.plan.stories, 'sample reviewer').map((s) => s.id), ['SAMPLE-2', 'SAMPLE-3', 'SAMPLE-4']);
  assert.equal(storiesForRole([{ narrative: 'Mentions a sample reviewer in passing.' }], 'sample reviewer').length, 0);
});

test('a guardrail is kept only when every enforcing story is verified', () => {
  const byId = new Map(joinStories(data.plan, data.progress).map((s) => [s.id, s]));
  const g = data.plan.derived.guardrails[0];
  assert.equal(guardrailStatus(g, data.plan.requirements, byId).kept, false); // SAMPLE-4 not checked yet
  assert.equal(guardrailStatus({ id: 'NOPE' }, data.plan.requirements, byId).rows.length, 0);
});

test('owners with no owner_agent are grouped as Unassigned', () => {
  const groups = ownerGroups([{ id: 'a', owner_agent: '' }, { id: 'b' }, { id: 'c', owner_agent: 'x' }]);
  assert.deepEqual(groups.map((g) => [g.owner, g.ids.length]), [['Unassigned', 2], ['x', 1]]);
});

test('data model fields are read from the records, not typed out', () => {
  assert.deepEqual(fieldsOf([{ id: 'a', n: 1 }, { id: 'b', n: null, _hidden: 1 }]), [['id', 'string'], ['n', 'number or null']]);
  assert.deepEqual(fieldsOf([]), []);
});
