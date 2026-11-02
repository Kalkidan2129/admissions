// Overview: the thirty-second screen. Every value comes from the loaded files:
// plan.project, plan.schedule, plan.releases and progress.totals (already summed,
// so never recomputed here). Each card drills down one level to #/overview/<id>.
import { h, dot, table } from '../dom.js';
import { joinStories } from '../data.js';
import { describeDate, releasePosition } from '../time.js';
import { cardTab, show, stateLabel, storyLink } from '../components.js';

export function positionSentence(plan, today) {
  const pos = releasePosition(plan.releases, today);
  if (pos.kind === 'within') return `Today falls in release ${pos.release.key}, ${pos.release.name}.`;
  if (pos.kind === 'after') return `Every release window in the plan ended on or before ${pos.lastEnd}, so today is in no release window.`;
  if (pos.kind === 'before') return `The first release window starts on ${pos.firstStart}.`;
  if (pos.kind === 'between') return 'Today falls between two release windows.';
  return 'The plan gives no release dates yet.';
}

function cards(ctx) {
  const { plan, progress } = ctx.data;
  const t = progress.totals ?? {};
  const s = plan.schedule ?? {};
  const releases = plan.releases ?? [];
  return [
    { id: 'project', title: 'What this is', value: plan.project?.name ?? 'Not named in the plan',
      note: plan.project?.descriptor ?? 'No descriptor in the plan.' },
    { id: 'stories', title: 'Stories verified', value: `${show(t.stories_verified)} of ${show(t.stories_total)}`,
      note: `${show(t.stories_in_progress)} in progress, ${show(t.stories_submitted)} submitted, ${show(t.stories_not_started)} not started` },
    { id: 'criteria', title: 'Acceptance criteria passed', value: `${show(t.criteria_passed)} of ${show(t.criteria_total)}`,
      note: 'As counted by the platform from your pushed commits.' },
    { id: 'points', title: 'Points awarded', value: show(t.points_awarded),
      note: 'Awarded by the platform when a story verifies.' },
    { id: 'schedule', title: 'Where you are in the plan', value: `${releases.length} release${releases.length === 1 ? '' : 's'}`,
      note: `${positionSentence(plan, ctx.today)} Demo day ${s.demo_day ? `${s.demo_day} (${describeDate(s.demo_day, ctx.today)})` : 'is not set'}.` },
    { id: 'live', title: 'What is live', value: 'Not checked from here', status: 'unknown',
      note: 'These files cannot tell whether anything is running. Open for why.' },
  ];
}

const DETAILS = {
  project(ctx) {
    const p = ctx.data.plan.project ?? {};
    return table(['Field', 'Value'], [
      ['Name', show(p.name)],
      ['What it does', show(p.descriptor)],
      ['Repository', p.repo_url ? h('a', { href: p.repo_url }, p.repo_url) : 'not in the file'],
      ['Plan version', show(p.plan_version)],
      ['Plan file schema version', show(ctx.data.plan.schema_version)],
    ], '');
  },
  stories(ctx, rows) {
    return h('div', {},
      h('p', {}, 'Every story in progress.json, with the state the platform recorded. "Not checked yet" means no verification run has happened for that story.'),
      table(['Story', 'Title', 'Release', 'State', 'Evidence'], rows.map((r) => [
        r.inPlan ? storyLink(r.id) : r.id, r.title ?? (r.inPlan ? '' : 'Not in plan.json'), show(r.release),
        stateLabel(r.state), r.commitUrl ? h('a', { href: r.commitUrl }, 'commit') : '',
      ]), 'progress.json lists no stories.'));
  },
  criteria(ctx, rows) {
    return h('div', {},
      h('p', {}, 'Criteria passed per story, as recorded in each story\'s verification block.'),
      table(['Story', 'State', 'Criteria passed'], rows.map((r) => [
        r.inPlan ? storyLink(r.id) : r.id, stateLabel(r.state),
        r.criteriaPassed === null ? 'Not checked yet' : `${r.criteriaPassed} of ${r.criteriaTotal}`,
      ]), 'progress.json lists no stories.'));
  },
  points(ctx, rows) {
    const awarded = rows.filter((r) => r.pointsAwarded !== null);
    return h('div', {},
      h('p', {}, `${awarded.length} of ${rows.length} stories have points awarded. The rest have none recorded yet.`),
      table(['Story', 'Title', 'Points'], awarded.map((r) => [storyLink(r.id), r.title ?? '', String(r.pointsAwarded)]),
        'No story has points awarded yet.'));
  },
  schedule(ctx, rows) {
    const { plan } = ctx.data;
    const s = plan.schedule ?? {};
    const byId = new Map(rows.map((r) => [r.id, r]));
    const releaseRows = (plan.releases ?? []).map((r) => {
      const ids = r.story_ids ?? [];
      const done = ids.filter((id) => byId.get(id)?.state === 'verified').length;
      return [h('a', { href: `#/project/release-${encodeURIComponent(r.key)}` }, r.key), r.name ?? '',
        show(r.starts_on), show(r.ends_on), `${done} of ${ids.length} verified`, r.is_demo_target ? 'Yes' : 'No'];
    });
    const prepRows = (s.prep ?? []).map((p) => [p.key, p.title, show(p.due_on),
      p.due_on ? describeDate(p.due_on, ctx.today) : '']);
    return h('div', {},
      h('p', {}, positionSentence(plan, ctx.today)),
      table(['Field', 'Date'], [
        ['Build starts', show(s.build_start)], ['Build ends', show(s.build_end)],
        ['Demo day', s.demo_day ? `${s.demo_day} (${describeDate(s.demo_day, ctx.today)})` : 'not in the file'],
        ['Release you demo', show(s.demo_release_key)],
      ], ''),
      h('h3', {}, 'Releases'),
      table(['Key', 'Name', 'Starts', 'Ends', 'Stories', 'Demo target'], releaseRows, 'The plan has no releases yet.'),
      h('h3', {}, 'Preparation tasks'),
      table(['Key', 'Task', 'Due', 'When'], prepRows, 'The plan lists no preparation tasks.'));
  },
  live(ctx) {
    const systems = ctx.data.plan.derived?.systems ?? [];
    return h('div', {},
      h('p', {}, 'Nothing in plan.json, progress.json or manifest.json records whether anything is running, so every indicator here is grey. A verified story means its acceptance criteria were confirmed against a commit. It does not mean anything is deployed or live.'),
      h('p', {}, 'The data on this page is as of the stamp in the header, not live.'),
      h('h3', {}, 'Systems named in the plan'),
      systems.length === 0
        ? h('p', { class: 'empty' }, 'Your plan names no external system yet.')
        : h('ul', { class: 'status-list' }, systems.map((name) => h('li', {},
          dot('unknown', 'Unknown'), ` ${name}: not checked from here. Last checked: never, from this page.`))));
  },
};

export function renderOverview(ctx, detailId) {
  const all = cards(ctx);
  return cardTab(ctx, {
    key: 'overview', label: 'Overview', cards: all,
    detail: (id) => {
      const c = all.find((x) => x.id === id);
      return c ? { title: c.title, body: DETAILS[id](ctx, joinStories(ctx.data.plan, ctx.data.progress)) } : null;
    },
  }, detailId);
}
