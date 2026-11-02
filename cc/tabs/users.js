// Users and use case: roles from plan.derived.roles, each drilling down to the
// story sentences ("As a <role>, I want …") it was taken from.
import { h, table } from '../dom.js';
import { cardTab, emptyCard, storyLink } from '../components.js';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function storiesForRole(stories, role) {
  const pattern = new RegExp(`\\bAs an? ${escapeRegExp(role)}\\b`, 'i');
  return stories.filter((s) => pattern.test(s.narrative ?? ''));
}

function firstSentence(text) {
  const line = (text ?? '').split('\n').find((l) => l.trim()) ?? '';
  return line.length > 240 ? `${line.slice(0, 240)}…` : line;
}

export function renderUsers(ctx, detailId) {
  const roles = ctx.data.plan.derived?.roles ?? [];
  const stories = ctx.data.plan.stories ?? [];
  const cards = roles.length > 0
    ? roles.map((role) => {
      const n = storiesForRole(stories, role).length;
      return { id: role, title: 'Role', value: role, note: `${n} stor${n === 1 ? 'y is' : 'ies are'} written for this role.` };
    })
    : [emptyCard('no-roles', 'Roles not named yet', '0 roles in the plan',
      'Roles in your plan: not yet named in your stories.',
      'One card per role, taken from stories written "As a <role>, I want …", each opening the sentences it came from.',
      'Stories have to name who they are for in that form. Your stories do not yet, so no role could be extracted, and none is guessed here.')];
  return cardTab(ctx, {
    key: 'users', label: 'Users and use case',
    intro: [h('p', {}, 'Who this is for and what they are trying to get done, taken from your own stories.')],
    cards,
    detail: (role) => {
      if (!roles.includes(role)) return null;
      const rows = storiesForRole(stories, role).map((s) => [storyLink(s.id), s.title, firstSentence(s.narrative)]);
      return { title: role, body: table(['Story', 'Title', 'Narrative'], rows, 'No story narrative names this role in the "As a …" form.') };
    },
  }, detailId);
}
