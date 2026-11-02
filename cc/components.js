// Building blocks every tab shares: cards that drill down one level, and the
// tab/detail page frame. A tab supplies its cards and a detail() lookup; this
// module owns the links, the back button and the sample labelling.
import { h, dot } from './dom.js';

export const STATE_LABELS = {
  verified: 'Verified', submitted: 'Submitted', in_progress: 'In progress', not_started: 'Not started',
};
export const stateLabel = (s) => (s === null || s === undefined ? 'Not checked yet' : STATE_LABELS[s] ?? s);
export const show = (v) => (v === null || v === undefined || v === '' ? 'not in the file' : String(v));
export const storyHref = (id) => `#/project/${encodeURIComponent(`story-${id}`)}`;
export const storyLink = (id) => h('a', { href: storyHref(id) }, id);

export function sampleBadge(ctx) {
  return ctx.sample ? h('span', { class: 'sample-badge' }, 'Sample') : null;
}

export function card(ctx, tabKey, c) {
  return h('a', { class: 'card', href: `#/${tabKey}/${encodeURIComponent(c.id)}` },
    h('div', { class: 'card-head' }, h('h3', {}, c.title), sampleBadge(ctx)),
    h('p', { class: 'card-value' }, c.status ? dot(c.status, 'Unknown: not checked from here') : null, c.value),
    c.note ? h('p', { class: 'card-note' }, c.note) : null,
    h('span', { class: 'card-more' }, 'Open details →'));
}

// A card for a tab whose data does not exist yet. It still drills down, to a page
// saying what will be there and what has to happen first.
export function emptyCard(id, title, value, note, willShow, needsFirst) {
  return { id, title, value, note, empty: { willShow, needsFirst } };
}

function emptyDetail(c) {
  return h('div', {},
    h('p', {}, c.note),
    h('h3', {}, 'What will be here'), h('p', {}, c.empty.willShow),
    h('h3', {}, 'What has to happen first'), h('p', {}, c.empty.needsFirst));
}

// tab: { key, label, intro?: Node[], cards: card[], detail?: (id) => {title, body} | null, after?: Node }
export function cardTab(ctx, tab, rawDetailId) {
  if (rawDetailId) {
    const id = decodeURIComponent(rawDetailId);
    const fromCard = tab.cards.find((c) => c.id === id);
    const found = fromCard?.empty ? { title: fromCard.title, body: emptyDetail(fromCard) }
      : tab.detail?.(id) ?? null;
    const back = h('a', { class: 'back', href: `#/${tab.key}` }, `← ${tab.label}`);
    if (!found) return h('section', {}, back, h('p', {}, `Nothing in the data matches "${id}".`));
    return h('section', { class: 'detail' }, back,
      h('div', { class: 'card-head' }, h('h2', {}, found.title), sampleBadge(ctx)), found.body);
  }
  return h('section', {},
    h('h2', {}, tab.label),
    tab.intro ? h('div', { class: 'intro' }, tab.intro) : null,
    h('div', { class: 'cards' }, tab.cards.map((c) => card(ctx, tab.key, c))),
    tab.after ?? null);
}
