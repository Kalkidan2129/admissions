// AI agents: one card per plan.agents[] entry. When the plan has no scoped roster,
// stories are grouped by plan.stories[].owner_agent instead, and the tab says these
// are owners, not agents. No file records a run, so nothing shows a success rate.
import { h, table } from '../dom.js';
import { joinStories } from '../data.js';
import { cardTab, show, stateLabel, storyLink } from '../components.js';

const NO_RUNS = 'No runs recorded';
const list = (items, emptyText) => ((items ?? []).length
  ? h('ul', {}, items.map((i) => h('li', {}, typeof i === 'string' ? i : JSON.stringify(i))))
  : h('span', { class: 'muted' }, emptyText));

export function ownerGroups(stories) {
  const groups = new Map();
  for (const s of stories) {
    const owner = s.owner_agent || 'Unassigned';
    if (!groups.has(owner)) groups.set(owner, []);
    groups.get(owner).push(s.id);
  }
  return [...groups].map(([owner, ids]) => ({ id: `owner-${owner}`, owner, ids }));
}

function ownedTable(ctx, ids) {
  const byId = new Map(joinStories(ctx.data.plan, ctx.data.progress).map((r) => [r.id, r]));
  return table(['Story', 'Title', 'State'], ids.map((id) => [storyLink(id), byId.get(id)?.title ?? '', stateLabel(byId.get(id)?.state ?? null)]),
    'Owns no stories.');
}

function agentDetail(ctx, a) {
  return h('div', {},
    h('p', {}, show(a.purpose)),
    table(['Field', 'Value'], [
      ['Trigger', `${show(a.trigger_type)}: ${show(a.trigger)}`], ['Autonomy level', show(a.autonomy_level)],
      ['Inputs', list(a.inputs, 'none listed')], ['Outputs', list(a.outputs, 'none listed')],
      ['Approval gates', list(a.approval_gates, 'none listed')], ['Escalation rules', list(a.escalation_rules, 'none listed')],
      ['Skills', list(a.skills, 'No skills registered yet')], ['Runs', NO_RUNS],
    ], ''),
    h('h3', {}, 'Stories it owns'), ownedTable(ctx, a.owns ?? []));
}

export function renderAgents(ctx, detailId) {
  const agents = ctx.data.plan.agents ?? [];
  if (agents.length > 0) {
    const counts = ctx.data.plan.derived?.counts?.agents_by_autonomy ?? {};
    const breakdown = Object.entries(counts).map(([level, n]) => `${level}: ${n}`).join(', ');
    return cardTab(ctx, {
      key: 'agents', label: 'AI agents',
      intro: [h('p', {}, `${agents.length} agents designed in the plan${breakdown ? ` (by autonomy: ${breakdown})` : ''}. This is the design; no file records a run.`)],
      cards: agents.map((a) => ({ id: a.id, title: a.name ?? a.id, value: show(a.autonomy_level),
        note: `${a.purpose ?? ''} ${NO_RUNS}. ${(a.skills ?? []).length ? `${a.skills.length} skills.` : 'No skills registered yet.'}` })),
      detail: (id) => { const a = agents.find((x) => x.id === id); return a ? { title: a.name ?? a.id, body: agentDetail(ctx, a) } : null; },
    }, detailId);
  }
  const groups = ownerGroups(ctx.data.plan.stories ?? []);
  return cardTab(ctx, {
    key: 'agents', label: 'AI agents',
    intro: [h('p', {}, 'Your plan does not carry a scoped agent roster yet, so this tab groups stories by who owns them. These are owners, not scoped AI agents.')],
    cards: groups.length ? groups.map((g) => ({ id: g.id, title: g.owner, value: `Owns ${g.ids.length} stor${g.ids.length === 1 ? 'y' : 'ies'}`,
      note: `An owner, not a scoped AI agent. ${NO_RUNS}. No skills registered yet.` }))
      : [{ id: 'no-owners', title: 'No stories yet', value: '0 stories in the plan', note: 'Nothing to group.',
        empty: { willShow: 'One card per owner, or per agent once the plan carries a roster.', needsFirst: 'Stories in the plan.' } }],
    detail: (id) => {
      const g = groups.find((x) => x.id === id);
      return g ? { title: g.owner, body: h('div', {},
        h('p', {}, `${g.owner} is how the plan records the owner of these stories. It is not a scoped AI agent. ${NO_RUNS}. No skills registered yet.`),
        ownedTable(ctx, g.ids)) } : null;
    },
  }, detailId);
}
