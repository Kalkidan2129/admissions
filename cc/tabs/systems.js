// Systems: names from plan.derived.systems. Nothing in this repo can reach them,
// so every indicator is grey, "not checked from here", until the running system
// reports otherwise. A name in a JSON file never turns a dot green.
import { h, dot, table } from '../dom.js';
import { cardTab, emptyCard, show } from '../components.js';

const NOT_CHECKED = 'Not checked from here';

export function renderSystems(ctx, detailId) {
  const systems = ctx.data.plan.derived?.systems ?? [];
  const requirements = ctx.data.plan.requirements ?? [];
  const cards = systems.length > 0
    ? systems.map((name) => ({ id: name, title: name, value: NOT_CHECKED, status: 'unknown',
      note: 'Last checked: never, from this page.' }))
    : [emptyCard('no-systems', 'No systems named yet', '0 systems in the plan',
      'Your plan names no external system yet.',
      'One card per external system the plan names, each with a grey status dot and a last-checked time.',
      'A requirement naming the system has to be in the plan. A dot only changes colour when your own running system reports the connection.')];
  return cardTab(ctx, {
    key: 'systems', label: 'Systems',
    intro: [h('p', {}, 'What this connects to. The files only know the names; whether a connection works is a fact about your running system, so every dot stays grey.')],
    cards,
    detail: (name) => {
      if (!systems.includes(name)) return null;
      const mentions = requirements.filter((r) => (r.statement ?? '').toLowerCase().includes(name.toLowerCase()));
      return { title: name, body: h('div', {},
        h('p', { class: 'status-line' }, dot('unknown', 'Unknown'), ` ${NOT_CHECKED}. Last checked: never, from this page.`),
        h('h3', {}, 'Requirements that name it'),
        table(['Requirement', 'Kind', 'Statement'], mentions.map((r) => [r.id, show(r.kind), r.statement]),
          'No requirement statement names this system.')) };
    },
  }, detailId);
}
