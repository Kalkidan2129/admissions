// Answers questions about the data on this page, deterministically, by matching the
// question against known topics. Every answer cites the tab it came from. When no
// topic matches, it says it cannot answer rather than guessing. No model, no network.
import { joinStories } from './data.js';
import { describeDate } from './time.js';

const TABS = {
  overview: ['Overview', '#/overview'], outcomes: ['Outcomes', '#/outcomes'], users: ['Users and use case', '#/users'],
  guardrails: ['Guardrails', '#/guardrails'], systems: ['Systems', '#/systems'], project: ['Project management', '#/project'],
  agents: ['AI agents', '#/agents'], knowledge: ['Knowledge base', '#/knowledge'], datamodel: ['Data model', '#/datamodel'],
};
const cite = (key, href) => ({ label: TABS[key][0], href: href ?? TABS[key][1] });
export const CANNOT_ANSWER = 'I can\'t answer that from the data on this page.';
const IRREGULAR = { story: 'stories', entry: 'entries' };
const plural = (n, word) => `${n} ${n === 1 ? word : IRREGULAR[word] ?? `${word}s`}`;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A story can be named by its full id, its last segment, or a short form such as
// "research-4" (the first two parts of the last segment).
function storyNames(id) {
  const last = id.split('.').at(-1).toLowerCase();
  return [id.toLowerCase(), last, last.split('-').slice(0, 2).join('-')];
}
const mentions = (q, name) => new RegExp(`(^|[^a-z0-9_])${escapeRegExp(name)}($|[^a-z0-9_])`).test(q);

function storyAnswer(q, rows, plan) {
  const row = rows.find((r) => storyNames(r.id).some((name) => name.length > 3 && mentions(q, name)));
  if (!row) return null;
  const planned = (plan.stories ?? []).find((s) => s.id === row.id);
  const state = row.state ?? 'not checked yet';
  const criteria = row.criteriaPassed === null ? 'no verification run yet' : `${row.criteriaPassed} of ${row.criteriaTotal} criteria passed`;
  const due = planned?.due_on ? `, due ${planned.due_on}` : '';
  return { text: `${row.id}${row.title ? ` (${row.title})` : ''}: ${state.replace('_', ' ')}, ${criteria}${due}.`,
    cites: [row.inPlan ? cite('project', `#/project/${encodeURIComponent(`story-${row.id}`)}`) : cite('overview', '#/overview/stories')] };
}

const TOPICS = [
  [/point/, (d) => ({ text: `${d.progress.totals?.points_awarded ?? 'No'} points awarded.`, cites: [cite('overview', '#/overview/points')] })],
  [/criteri/, (d) => ({ text: `${d.progress.totals?.criteria_passed} of ${d.progress.totals?.criteria_total} acceptance criteria passed.`, cites: [cite('overview', '#/overview/criteria')] })],
  [/demo/, (d, today) => {
    const day = d.plan.schedule?.demo_day;
    return { text: day ? `Demo day is ${day} (${describeDate(day, today)}).` : 'The plan sets no demo day.', cites: [cite('overview', '#/overview/schedule')] };
  }],
  [/overdue|late|past due|slip|deadline|\bdue\b/, (d, today, rows) => {
    const state = new Map(rows.map((r) => [r.id, r.state]));
    const late = (d.plan.stories ?? []).filter((s) => s.due_on && s.due_on < today && state.get(s.id) !== 'verified');
    return { text: `${plural(late.length, 'story')} in the plan ${late.length === 1 ? 'is' : 'are'} past due and not verified.`, cites: [cite('project')] };
  }],
  [/release|\br\d\b/, (d, today, rows) => {
    const state = new Map(rows.map((r) => [r.id, r.state]));
    const parts = (d.plan.releases ?? []).map((r) => `${r.key} ${r.name ?? ''}: ${(r.story_ids ?? []).filter((id) => state.get(id) === 'verified').length} of ${(r.story_ids ?? []).length} verified`);
    return { text: parts.length ? `${parts.join('; ')}.` : 'The plan has no releases.', cites: [cite('project')] };
  }],
  [/verified|progress|how far|done|complete|status/, (d) => {
    const t = d.progress.totals ?? {};
    return { text: `${t.stories_verified} of ${t.stories_total} stories verified, ${t.stories_in_progress} in progress, ${t.stories_not_started} not started.`, cites: [cite('overview', '#/overview/stories')] };
  }],
  [/requirement|traceab/, (d) => ({ text: `The plan has ${plural((d.plan.requirements ?? []).length, 'requirement')}.`, cites: [cite('knowledge', '#/knowledge/requirements')] })],
  [/agent|owner|who owns/, (d) => {
    const n = (d.plan.agents ?? []).length;
    const owners = [...new Set((d.plan.stories ?? []).map((s) => s.owner_agent || 'Unassigned'))];
    return { text: n ? `The plan designs ${plural(n, 'agent')}. No runs are recorded.`
      : `The plan carries no scoped agent roster yet. Story owners: ${owners.join(', ') || 'none'}. No runs are recorded.`, cites: [cite('agents')] };
  }],
  [/system|integrat|connect/, (d) => {
    const s = d.plan.derived?.systems ?? [];
    return { text: s.length ? `The plan names ${s.join(', ')}. None is checked from here.` : 'The plan names no external system yet.', cites: [cite('systems')] };
  }],
  [/guardrail|\bsafe\b|never/, (d) => ({ text: `The plan has ${plural((d.plan.derived?.guardrails ?? []).length, 'guardrail')} (SAFE requirements).`, cites: [cite('guardrails')] })],
  [/measure|outcome|kpi|target|metric/, (d) => ({ text: `The plan has ${plural((d.plan.derived?.measures ?? []).length, 'measure')}, and no measured values.`, cites: [cite('outcomes')] })],
  [/role|user|who is (it|this) for/, (d) => {
    const r = d.plan.derived?.roles ?? [];
    return { text: r.length ? `Roles: ${r.join(', ')}.` : 'Your stories do not name a role yet.', cites: [cite('users')] };
  }],
  [/table|data model|schema|field/, () => ({ text: 'The Data model tab lists the records this page reads and their fields.', cites: [cite('datamodel')] })],
  [/note|decision|question|document/, (d) => ({ text: `The knowledge notes hold ${plural((d.notes?.entries ?? []).length, 'entry')}.`, cites: [cite('knowledge', '#/knowledge/notes')] })],
];

function titleSearch(q, plan) {
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
  if (!words.length) return null;
  const hits = (plan.stories ?? []).filter((s) => words.some((w) => (s.title ?? '').toLowerCase().includes(w)));
  if (!hits.length || hits.length > 5) return null;
  return { text: `Stories matching: ${hits.map((s) => `${s.id} (${s.title})`).join('; ')}.`, cites: [cite('project')] };
}

export function answer(question, data, today) {
  const q = String(question ?? '').toLowerCase().trim();
  if (!q) return { text: 'Ask a question about this project\'s data.', cites: [] };
  const rows = joinStories(data.plan, data.progress);
  const byStory = storyAnswer(q, rows, data.plan);
  if (byStory) return byStory;
  const topic = TOPICS.find(([pattern]) => pattern.test(q));
  if (topic) return topic[1](data, today, rows);
  return titleSearch(q, data.plan) ?? { text: CANNOT_ANSWER, cites: [] };
}
