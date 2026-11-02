// Data model: (1) the records behind every tab on this page, with their fields read
// from the loaded files rather than typed out here; (2) your domain's tables, which
// are derived from plan.requirements and shown for review before any table exists.
import { h, table } from '../dom.js';
import { cardTab, emptyCard } from '../components.js';

// Where each record lives in the files, and how they join. This is structure, not
// content: the fields and counts are read from the data at runtime.
const RECORDS = [
  { id: 'release', name: 'Release', file: 'plan.json', get: (d) => d.plan.releases, key: 'key' },
  { id: 'story', name: 'Story (plan)', file: 'plan.json', get: (d) => d.plan.stories, key: 'id' },
  { id: 'requirement', name: 'Requirement', file: 'plan.json', get: (d) => d.plan.requirements, key: 'id' },
  { id: 'agent', name: 'Agent', file: 'plan.json', get: (d) => d.plan.agents, key: 'id' },
  { id: 'story-progress', name: 'Story progress', file: 'progress.json', get: (d) => d.progress.stories, key: 'id' },
  { id: 'criterion', name: 'Criterion', file: 'progress.json', get: (d) => (d.progress.stories ?? []).flatMap((s) => s.criteria ?? []), key: null },
  { id: 'verification', name: 'Verification', file: 'progress.json', get: (d) => (d.progress.stories ?? []).map((s) => s.verification).filter(Boolean), key: null },
  { id: 'manifest', name: 'Manifest', file: 'manifest.json', get: (d) => (d.manifest ? [d.manifest] : []), key: null },
];
const RELATIONSHIPS = [
  ['Story (plan)', 'release', 'Release', 'key'],
  ['Release', 'story_ids[]', 'Story (plan)', 'id'],
  ['Requirement', 'fulfilled_by[]', 'Story (plan)', 'id'],
  ['Story (plan)', 'fulfills[]', 'Requirement', 'id'],
  ['Agent', 'owns[]', 'Story (plan)', 'id'],
  ['Story progress', 'id', 'Story (plan)', 'id'],
  ['Criterion', '(belongs to)', 'Story progress', 'criteria[]'],
  ['Verification', '(belongs to)', 'Story progress', 'verification'],
];

const typeOf = (v) => (Array.isArray(v) ? 'list' : v === null ? 'null' : typeof v);

export function fieldsOf(items) {
  const fields = new Map();
  for (const item of items ?? []) {
    for (const [k, v] of Object.entries(item ?? {})) {
      if (k.startsWith('_')) continue;
      const types = fields.get(k) ?? new Set();
      types.add(typeOf(v));
      fields.set(k, types);
    }
  }
  return [...fields].map(([name, types]) => [name, [...types].join(' or ')]);
}

export function renderDataModel(ctx, detailId) {
  const reqs = ctx.data.plan.requirements ?? [];
  const clusters = [...new Set(reqs.map((r) => r.cluster || 'Unclustered'))];
  const recordCards = RECORDS.map((r) => {
    const n = (r.get(ctx.data) ?? []).length;
    return { id: r.id, title: r.name, value: `${n} record${n === 1 ? '' : 's'}`, note: `Read from .colaberry/${r.file}.` };
  });
  const domainCards = clusters.length
    ? clusters.map((c) => ({ id: `cluster-${c}`, title: c, value: `${reqs.filter((r) => (r.cluster || 'Unclustered') === c).length} requirements`,
      note: 'Proposed tables: not drafted yet. They are reviewed with you before any table is created.' }))
    : [emptyCard('domain', 'Your domain\'s tables', '0 requirements to derive from',
      'Your plan has no requirements yet, so there is nothing to derive domain tables from.',
      'A proposed model: what each requirement has to store, named in your domain\'s terms (an agreement, not the vendor that signs it), with fields and relationships.',
      'Requirements in the plan. The model is then drafted here and shown to you for review before any table is created.')];
  return cardTab(ctx, {
    key: 'datamodel', label: 'Data model',
    intro: [h('p', {}, 'The records behind every tab on this page, with fields read from the files themselves, and the place your domain\'s own tables will be proposed.')],
    cards: [...recordCards, ...domainCards],
    after: h('div', {}, h('h3', {}, 'How the records join'),
      table(['From', 'Field', 'To', 'Field'], RELATIONSHIPS, '')),
    detail: (id) => {
      const rec = RECORDS.find((r) => r.id === id);
      if (rec) {
        const items = rec.get(ctx.data) ?? [];
        const joins = RELATIONSHIPS.filter(([from, , to]) => from === rec.name || to === rec.name);
        return { title: rec.name, body: h('div', {},
          h('p', {}, `${items.length} record${items.length === 1 ? '' : 's'} in .colaberry/${rec.file}${rec.key ? `, keyed by ${rec.key}` : ''}.`),
          h('h3', {}, 'Fields seen in the data'),
          table(['Field', 'Type'], fieldsOf(items), 'No records yet, so no fields can be read from the data.'),
          h('h3', {}, 'Joins'), table(['From', 'Field', 'To', 'Field'], joins, 'None.')) };
      }
      if (id.startsWith('cluster-')) {
        const c = id.slice(8);
        const rows = reqs.filter((r) => (r.cluster || 'Unclustered') === c).map((r) => [r.id, r.kind ?? '', r.statement]);
        return rows.length ? { title: c, body: h('div', {},
          h('p', {}, 'The requirements a table for this capability would have to serve. No table is proposed yet; that is a review step with you.'),
          table(['Requirement', 'Kind', 'Statement'], rows, '')) } : null;
      }
      return null;
    },
  }, detailId);
}
