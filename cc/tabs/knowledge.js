// Knowledge base: requirements traced to stories (plan.requirements[].fulfilled_by
// joined to progress), every story, and your own notes from knowledge/notes.json,
// which you add to over the programme. Plus a chat panel that answers from this
// data only and cites the tab each answer came from.
import { h, table } from '../dom.js';
import { joinStories } from '../data.js';
import { answer } from '../kbAnswer.js';
import { cardTab, emptyCard, show, stateLabel, storyLink } from '../components.js';

const chatLog = []; // this page view only; kept across re-renders, not saved

function traceRows(ctx) {
  const byId = new Map(joinStories(ctx.data.plan, ctx.data.progress).map((r) => [r.id, r]));
  return (ctx.data.plan.requirements ?? []).map((r) => {
    const ids = r.fulfilled_by ?? [];
    const verified = ids.filter((id) => byId.get(id)?.state === 'verified').length;
    const coverage = ids.length === 0 ? (r.priority === 'must' ? 'GAP: a must with no story' : 'No story yet')
      : `${verified} of ${ids.length} verified`;
    return [r.id, r.statement, show(r.kind), show(r.priority), ids.length ? h('span', {}, ids.flatMap((id, i) => [i ? ', ' : '', storyLink(id)])) : 'none', coverage];
  });
}

function fileLink(ctx, path) {
  const repo = ctx.data.plan.project?.repo_url;
  return repo ? h('a', { href: `${repo}/blob/main/${path}` }, path) : path;
}

function notesBody(ctx) {
  const { entries = [], error = null } = ctx.data.notes ?? {};
  return h('div', {},
    h('p', {}, 'Your documents, decisions and open questions. Add to knowledge/notes.json as you go; this tab reads it each time the page loads.'),
    error ? h('p', { class: 'error' }, `knowledge/notes.json could not be read: ${error.message}`) : null,
    table(['Date', 'Kind', 'Title', 'Detail', 'File', 'Story'], entries.map((e) => [show(e.date), show(e.kind), show(e.title), e.text ?? '',
      e.path ? fileLink(ctx, e.path) : '', e.story ? (e.story === 'STORY-000' ? e.story : storyLink(e.story)) : '']),
    'No notes yet. Add the first entry to knowledge/notes.json.'));
}

function chatPanel(ctx) {
  const log = h('div', { class: 'chat-log', 'aria-live': 'polite' }, chatLog.map(chatEntry));
  const input = h('input', { type: 'text', name: 'q', 'aria-label': 'Ask about this project', placeholder: 'e.g. How many stories are verified? What is RESEARCH-4?' });
  const form = h('form', { class: 'chat-form', onsubmit: (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    const entry = { q, a: answer(q, ctx.data, ctx.today), sample: ctx.sample };
    chatLog.push(entry);
    log.append(chatEntry(entry));
    input.value = '';
  } }, input, h('button', { type: 'submit' }, 'Ask'));
  return h('section', { class: 'chat' },
    h('h3', {}, 'Ask about this project'),
    h('p', { class: 'muted' }, 'Answers come only from the data on this page, with the tab they came from. If the data cannot answer, it says so. Nothing is sent anywhere.'),
    log, form);
}

function chatEntry(e) {
  return h('div', { class: 'chat-entry' },
    h('p', { class: 'chat-q' }, h('strong', {}, 'You: '), e.q),
    h('p', { class: 'chat-a' }, h('strong', {}, e.sample ? 'Answer (sample data): ' : 'Answer: '), e.a.text,
      e.a.cites.length ? h('span', { class: 'muted' }, ' Source: ', e.a.cites.flatMap((c, i) => [i ? ', ' : '', h('a', { href: c.href }, c.label)])) : null));
}

export function renderKnowledge(ctx, detailId) {
  const { plan } = ctx.data;
  const reqs = plan.requirements ?? [];
  const gaps = reqs.filter((r) => r.priority === 'must' && (r.fulfilled_by ?? []).length === 0).length;
  const notes = ctx.data.notes?.entries ?? [];
  const stories = plan.stories ?? [];
  const cards = [
    reqs.length ? { id: 'requirements', title: 'Requirements and traceability', value: `${reqs.length} requirements`,
      note: gaps ? `${gaps} must requirement${gaps === 1 ? ' has' : 's have'} no story: a real gap.` : 'Every requirement, the stories that cover it, and whether they are verified.' }
      : emptyCard('requirements', 'Requirements and traceability', '0 requirements in the plan', 'Your plan has no requirements yet, so there is nothing to trace.',
        'Every requirement, the stories that fulfil it, and whether those stories are verified. A must requirement with no story is shown as a gap.',
        'Requirements have to be added to the plan in the portal and synced.'),
    { id: 'stories', title: 'Stories', value: `${stories.length} in the plan`, note: 'Every story with its narrative and acceptance criteria.' },
    { id: 'notes', title: 'Notes and decisions', value: `${notes.length} entr${notes.length === 1 ? 'y' : 'ies'}`, note: 'Documents, decisions and questions from knowledge/notes.json.' },
  ];
  return cardTab(ctx, {
    key: 'knowledge', label: 'Knowledge base',
    intro: [h('p', {}, 'Everything the project knows about itself. It grows for the whole programme.')],
    cards,
    detail: (id) => {
      if (id === 'requirements') return { title: 'Requirements and traceability', body: table(['Requirement', 'Statement', 'Kind', 'Priority', 'Fulfilled by', 'Coverage'], traceRows(ctx), 'No requirements.') };
      if (id === 'stories') {
        const byId = new Map(joinStories(plan, ctx.data.progress).map((r) => [r.id, r]));
        return { title: 'Stories', body: table(['Story', 'Title', 'Release', 'Criteria', 'State'], stories.map((s) => [storyLink(s.id), s.title ?? '', show(s.release),
          String((s.acceptance ?? []).length), stateLabel(byId.get(s.id)?.state ?? null)]), 'The plan has no stories yet.') };
      }
      if (id === 'notes') return { title: 'Notes and decisions', body: notesBody(ctx) };
      return null;
    },
    after: chatPanel(ctx),
  }, detailId);
}
