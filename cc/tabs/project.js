// Project management: a Gantt view of plan.releases and, under it, every story
// with its current and first-given due date. State comes from progress.json only.
// Detail routes: #/project/release-<key> and #/project/story-<id>.
import { h, table } from '../dom.js';
import { joinStories } from '../data.js';
import { daysBetween, describeDate, describeSlip } from '../time.js';
import { sampleBadge, show, stateLabel, storyLink } from '../components.js';

const releaseHref = (key) => `#/project/${encodeURIComponent(`release-${key}`)}`;

function chartRange(plan) {
  const s = plan.schedule ?? {};
  const dates = (plan.releases ?? []).flatMap((r) => [r.starts_on, r.ends_on])
    .concat([s.build_start, s.build_end, s.demo_day]).filter(Boolean).sort();
  return dates.length ? { from: dates[0], to: dates.at(-1) } : null;
}

function gantt(ctx) {
  const { plan } = ctx.data;
  const range = chartRange(plan);
  if (!range) return h('p', { class: 'empty' }, 'The plan gives no release dates, so there is nothing to chart yet.');
  const span = Math.max(1, daysBetween(range.from, range.to) + 1);
  const pct = (ymd) => (daysBetween(range.from, ymd) / span) * 100;
  const demo = plan.schedule?.demo_day;
  const rows = (plan.releases ?? []).map((r) => {
    const dated = r.starts_on && r.ends_on;
    const left = dated ? pct(r.starts_on) : 0;
    const width = dated ? Math.max(1.5, ((daysBetween(r.starts_on, r.ends_on) + 1) / span) * 100) : 0;
    return h('div', { class: 'gantt-row' },
      h('a', { class: 'gantt-label', href: releaseHref(r.key) }, `${r.key} · ${r.name ?? ''}`),
      h('div', { class: 'gantt-track' },
        dated ? h('a', { class: `gantt-bar${r.is_demo_target ? ' is-demo' : ''}`, href: releaseHref(r.key),
          style: `left:${left}%;width:${width}%`, title: `${r.starts_on} to ${r.ends_on}` }) : h('span', { class: 'muted' }, 'no dates'),
        demo ? h('span', { class: 'gantt-marker', style: `left:${pct(demo)}%`, title: `Demo day ${demo}` }) : null));
  });
  const todayNote = ctx.today > range.to ? `Today (${ctx.today}) is after the last date on this chart (${range.to}).`
    : ctx.today < range.from ? `Today (${ctx.today}) is before the first date on this chart.` : null;
  return h('div', { class: 'gantt' },
    h('p', { class: 'muted' }, `${range.from} to ${range.to}. The dashed line is demo day${demo ? ` (${demo})` : ''}. Bars that start and end on the same day are drawn at a minimum width.`),
    rows, todayNote ? h('p', {}, todayNote) : null);
}

function taskRows(ctx, stories) {
  const byId = new Map(joinStories(ctx.data.plan, ctx.data.progress).map((r) => [r.id, r]));
  return stories.map((s) => {
    const state = byId.get(s.id)?.state ?? null;
    const late = s.due_on && s.due_on < ctx.today && state !== 'verified';
    return [storyLink(s.id), s.title ?? '', show(s.release), show(s.due_on),
      s.due_on ? `${describeDate(s.due_on, ctx.today)}${late ? ' · past due' : ''}` : '',
      show(s.due_baseline_on), describeSlip(s.due_on, s.due_baseline_on), stateLabel(state)];
  });
}
const TASK_HEADERS = ['Story', 'Title', 'Release', 'Due', 'When', 'First given', 'Slippage', 'State'];

function releaseDetail(ctx, key) {
  const r = (ctx.data.plan.releases ?? []).find((x) => x.key === key);
  if (!r) return null;
  const stories = (ctx.data.plan.stories ?? []).filter((s) => (r.story_ids ?? []).includes(s.id));
  return { title: `${r.key} · ${r.name ?? ''}`, body: h('div', {},
    table(['Field', 'Value'], [['Goal', show(r.goal)], ['Demo', show(r.demo)], ['Starts', show(r.starts_on)],
      ['Ends', show(r.ends_on)], ['Demo target', r.is_demo_target ? 'Yes' : 'No']], ''),
    h('h3', {}, 'Stories'), table(TASK_HEADERS, taskRows(ctx, stories), 'This release has no stories.')) };
}

function storyDetail(ctx, id) {
  const s = (ctx.data.plan.stories ?? []).find((x) => x.id === id);
  if (!s) return null;
  const p = (ctx.data.progress.stories ?? []).find((x) => x.id === id);
  const v = p?.verification ?? null;
  const claims = new Map((p?.criteria ?? []).map((c) => [c.text, c.passed]));
  const criteriaRows = (s.acceptance ?? []).map((text) => [text,
    claims.has(text) ? (claims.get(text) ? 'Ticked in progress.json' : 'Not ticked') : 'Not in progress.json']);
  return { title: s.title ?? s.id, body: h('div', {},
    table(['Field', 'Value'], [
      ['Story id', s.id], ['Release', s.release ? h('a', { href: releaseHref(s.release) }, s.release) : 'not in the file'],
      ['State', stateLabel(v?.state ?? null)],
      ['Criteria passed (platform)', v ? `${v.criteria_passed} of ${v.criteria_total}` : 'Not checked yet'],
      ['Points', show(v?.points_awarded)],
      ['Verified by commit', v?.commit_url ? h('a', { href: v.commit_url }, v.commit_sha?.slice(0, 7) ?? 'commit') : 'none yet'],
      ['Due', s.due_on ? `${s.due_on} (${describeDate(s.due_on, ctx.today)})` : 'not in the file'],
      ['First given', show(s.due_baseline_on)], ['Slippage', describeSlip(s.due_on, s.due_baseline_on)],
      ['Owner', s.owner_agent || 'Unassigned'],
    ], ''),
    h('h3', {}, 'Narrative'), h('p', { class: 'prose' }, s.narrative || 'No narrative in the plan.'),
    h('h3', {}, 'Acceptance criteria'), table(['Criterion', 'Your claim'], criteriaRows, 'The plan lists no criteria.'),
    h('h3', {}, 'Failure paths'),
    (s.failure_paths ?? []).length ? h('ul', {}, s.failure_paths.map((f) => h('li', {}, f))) : h('p', { class: 'empty' }, 'None listed in the plan.'),
    s.task_guidance ? h('details', {}, h('summary', {}, 'Full build guidance'), h('p', { class: 'prose' }, s.task_guidance)) : null) };
}

export function renderProject(ctx, rawDetailId) {
  if (rawDetailId) {
    const id = decodeURIComponent(rawDetailId);
    const found = id.startsWith('release-') ? releaseDetail(ctx, id.slice(8))
      : id.startsWith('story-') ? storyDetail(ctx, id.slice(6)) : null;
    const back = h('a', { class: 'back', href: '#/project' }, '← Project management');
    if (!found) return h('section', {}, back, h('p', {}, `Nothing in the plan matches "${id}".`));
    return h('section', { class: 'detail' }, back,
      h('div', { class: 'card-head' }, h('h2', {}, found.title), sampleBadge(ctx)), found.body);
  }
  const stories = ctx.data.plan.stories ?? [];
  const planIds = new Set(stories.map((s) => s.id));
  const extra = (ctx.data.progress.stories ?? []).filter((s) => !planIds.has(s.id)).map((s) => s.id);
  return h('section', {},
    h('div', { class: 'card-head' }, h('h2', {}, 'Project management'), sampleBadge(ctx)),
    h('h3', {}, 'Releases'), gantt(ctx),
    h('h3', {}, `Tasks (${stories.length})`),
    h('p', { class: 'muted' }, '"First given" is the date the story was first due; it never moves. The gap between it and the current due date is slippage. Click a story to open it.'),
    table(TASK_HEADERS, taskRows(ctx, stories), 'The plan has no stories yet.'),
    extra.length ? h('p', { class: 'muted' }, `Also in progress.json but not in the plan: ${extra.join(', ')}.`) : null);
}
