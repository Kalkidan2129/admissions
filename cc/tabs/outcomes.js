// Outcomes: the numbers this has to move, from plan.derived.measures.
// The plan holds each measure's statement, never a measured value, so no card
// shows a value: that comes from the running system once it reports.
import { h } from '../dom.js';
import { cardTab, emptyCard } from '../components.js';

export function renderOutcomes(ctx, detailId) {
  const measures = ctx.data.plan.derived?.measures ?? [];
  const cards = measures.length > 0
    ? measures.map((m) => ({ id: m.id, title: m.id, value: 'No measurement yet', status: 'unknown', note: m.statement }))
    : [emptyCard('no-measures', 'No measures yet', '0 measures in the plan',
      'Your plan carries no numeric target yet.',
      'One card per measure in plan.derived.measures: what the system has to move, and, once your system reports it, the measured value next to the target.',
      'A requirement that states a measurable target has to be added to the plan in the portal and synced. Nothing here will invent a target to fill the space.')];
  return cardTab(ctx, {
    key: 'outcomes', label: 'Outcomes',
    intro: [h('p', {}, 'The numbers this system has to move. The plan records what you committed to, not a measurement.')],
    cards,
    detail: (id) => {
      const m = measures.find((x) => x.id === id);
      if (!m) return null;
      return { title: m.id, body: h('div', {},
        h('p', {}, m.statement),
        h('h3', {}, 'Current value'),
        h('p', { class: 'empty' }, 'No measurement recorded. The plan holds the target, not the value; the value comes from your running system once it reports.')) };
    },
  }, detailId);
}
