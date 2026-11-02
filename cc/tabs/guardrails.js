// Guardrails: what must never happen, from plan.derived.guardrails. Whether one is
// enforced is followed through plan.requirements[].fulfilled_by to the stories and
// their verification state in progress.json.
import { h, table } from '../dom.js';
import { joinStories } from '../data.js';
import { cardTab, emptyCard, stateLabel, storyLink } from '../components.js';

export function guardrailStatus(guardrail, requirements, storyById) {
  const req = requirements.find((r) => r.id === guardrail.id);
  const ids = req?.fulfilled_by ?? [];
  const rows = ids.map((id) => ({ id, state: storyById.get(id)?.state ?? null }));
  const kept = rows.length > 0 && rows.every((r) => r.state === 'verified');
  return { rows, kept };
}

export function renderGuardrails(ctx, detailId) {
  const { plan, progress } = ctx.data;
  const guardrails = plan.derived?.guardrails ?? [];
  const requirements = plan.requirements ?? [];
  const storyById = new Map(joinStories(plan, progress).map((s) => [s.id, s]));
  const cards = guardrails.length > 0
    ? guardrails.map((g) => {
      const { rows, kept } = guardrailStatus(g, requirements, storyById);
      let value = 'A promise you have made and not yet kept';
      if (rows.length === 0) value = 'No story enforces this yet';
      else if (kept) value = 'Enforced by verified stories';
      return { id: g.id, title: g.id, value, note: g.statement };
    })
    : [emptyCard('no-guardrails', 'No guardrails yet', '0 SAFE requirements in the plan',
      'Your plan has no requirement typed SAFE yet. That usually means a promise made in the interview was recorded as a normal feature. Raise it with your instructor: this is worth fixing early.',
      'One card per SAFE requirement, saying in plain words whether the stories that enforce it are verified.',
      'A requirement typed SAFE has to be added to the plan in the portal and synced.')];
  return cardTab(ctx, {
    key: 'guardrails', label: 'Guardrails',
    intro: [h('p', {}, 'What must never happen. A guardrail whose stories are not verified is a promise you have made and not yet kept.')],
    cards,
    detail: (id) => {
      const g = guardrails.find((x) => x.id === id);
      if (!g) return null;
      const { rows } = guardrailStatus(g, requirements, storyById);
      return { title: g.id, body: h('div', {}, h('p', {}, g.statement), h('h3', {}, 'Stories that enforce it'),
        table(['Story', 'State'], rows.map((r) => [storyLink(r.id), stateLabel(r.state)]),
          'No story in the plan fulfils this requirement yet.')) };
    },
  }, detailId);
}
