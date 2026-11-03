// DOM for the six panels. Every decision about what to say lives in model.js; this file only
// lays it out. Each panel names the endpoint(s) it read in its header.
import { h, table } from '../dom.js';
import { formatCentral } from '../time.js';
import { RUNGS, LADDER_SOURCE, AUTHORITY_SOURCE, UNREACHABLE_BY_FACT } from './authority.js';
import {
  get, panelStatus, emptyMessage, validationLabel, employeeView, authorityRows, noToolGrantsSummary,
  ladderCell, governanceView, gapsView, NOT_RETURNED, TOOL_REQUEST_DISCLOSURE,
} from './model.js';

const when = (iso) => (iso ? formatCentral(new Date(iso)) : '');
const missing = (field) => h('span', { class: 'not-returned', title: NOT_RETURNED[field] }, 'not returned');

function frame(n, title, question, states, body, sample) {
  const status = panelStatus(states);
  const loaded = states.map((s) => s.loadedAt).filter(Boolean).sort().at(-1);
  return h('section', { class: `ad-panel ad-${status.kind}`, 'aria-labelledby': `ad-p${n}` },
    h('header', { class: 'ad-panel-head' },
      h('h3', { id: `ad-p${n}` }, `${n}. ${title}`),
      sample ? h('span', { class: 'sample-badge' }, 'Sample') : null),
    h('p', { class: 'ad-question' }, `"${question}"`),
    h('p', { class: 'ad-source' }, 'Reads: ', states.flatMap((s, i) => [i ? ', ' : '', h('code', {}, get(s.path))]),
      loaded ? ` · loaded ${formatCentral(loaded)}${sample ? ' (sample response, made up)' : ''}` : ''),
    status.kind === 'ok' ? body() : h('p', { class: `ad-state ad-state-${status.kind}`, role: 'status' }, status.message));
}

const stateBox = (kind, text) => h('p', { class: `ad-state ad-state-${kind}`, role: 'status' }, text);

export function employeePanel(e, domainKey, sample) {
  return frame(1, 'Your employee', 'does it exist, and what is it allowed to do?', [e.mine], () => {
    const v = employeeView(e.mine, domainKey);
    if (v.kind !== 'ok') return stateBox(v.kind, v.message);
    return table(['Field', 'Value'], v.fields.map(([k, val]) => [k, k === 'Autonomy level last set' && v.setAt ? when(v.setAt) : val]), '');
  }, sample);
}

export function inventoryPanel(e, sample) {
  return frame(2, 'Your capability inventory', 'what am I actually building?', [e.domain, e.coverage], () => {
    const rows = e.coverage.data?.rows ?? [];
    const d = e.domain.data ?? {};
    const facts = [['Accountable human', d.accountable_human ?? 'not in the response'],
      ['Research recorded', d.researched_at ?? 'not in the response'],
      ['Capability coverage', e.coverage.data?.summary?.headline ?? 'not in the response']];
    return h('div', {},
      table(['From the domain endpoint', 'Value'], facts, ''),
      h('p', { class: 'muted' }, 'In the order the endpoint returned them, which is the order research recorded them. Columns marked "not returned" are asked for by the brief but absent from both endpoints at platform commit 92d103b.'),
      rows.length === 0 ? stateBox('empty', emptyMessage(e.coverage, 'no capabilities'))
        : table(['Capability', 'classification', 'implementation_state', 'requirement_validation_state', 'starting_autonomy', 'max_permitted_autonomy', 'human_decision'],
          rows.map((r) => [r.capability_name ?? r.capability_id, missing('classification'), r.current_state ?? 'not in the response',
            h('span', { class: r.validation_state === 'draft' ? 'draft-tag' : '' }, validationLabel(r.validation_state)),
            missing('starting_autonomy'), r.target_autonomy ?? 'not in the response', missing('human_decision')]), ''));
  }, sample);
}

export function ladderPanel(e, domainKey, sample) {
  return frame(3, 'The autonomy ladder', 'where is this going?', [e.coverage, e.mine], () => {
    const employee = employeeView(e.mine, domainKey);
    const tools = employee.kind === 'ok' ? employee.tools : [];
    const rows = authorityRows(e.coverage.data?.rows ?? [], tools);
    const summary = noToolGrantsSummary(rows);
    return h('div', {},
      h('ol', { class: 'rungs', start: '0' }, RUNGS.map((r) => h('li', {}, h('code', {}, r.stage), ` ${r.meaning}`,
        r.stage === UNREACHABLE_BY_FACT ? h('strong', {}, ' Unreachable by fact: coordinated handoff between agents does not exist in this platform.') : ''))),
      h('p', { class: 'muted' }, `Wording: ${LADDER_SOURCE}. The employee's autonomy level in panel 1 is a different scale and is not marked on this ladder.`),
      h('p', { class: 'ad-rule' }, h('strong', {}, 'no_tool_grants: '), summary.sentence),
      h('p', { class: 'muted' }, `Authority shown is what ${AUTHORITY_SOURCE} returns, with the approved level from the coverage endpoint's effective_authority (recorded approvals only), the agent's granted tools from panel 1, environment sandbox, and human_decision taken as true because no endpoint returns it. The reason for each ceiling is not returned by either endpoint.`),
      rows.length === 0 ? stateBox('empty', emptyMessage(e.coverage, 'no capabilities')) : h('div', { class: 'table-wrap' }, h('table', { class: 'ladder' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Capability'), h('th', {}, 'Effective authority'), RUNGS.map((r) => h('th', { title: r.meaning }, r.stage.replace('autonomy:', ''))))),
        h('tbody', {}, rows.map((row) => h('tr', {},
          h('td', {}, row.name ?? row.id),
          h('td', {}, row.effective ?? `none (${row.reasons.join(', ')})`),
          RUNGS.map((r) => {
            const tags = ladderCell(r.stage, row);
            const label = tags.includes('ceiling') ? 'ceiling' : tags.includes('unreachable-fact') ? 'n/a' : tags.includes('unreachable') ? '×' : '';
            return h('td', { class: tags.map((t) => `lc-${t}`).join(' '), title: tags.join(', ') }, tags.includes('effective') ? `● ${label}` : label);
          })))))),
      h('p', { class: 'muted' }, 'Legend: "ceiling" is the capability\'s max_permitted_autonomy; × is above that ceiling and unreachable for that capability, not future work; R8 is unreachable for every capability; ● marks effective authority.'));
  }, sample);
}

export function behaviourPanel(e, sample) {
  return frame(4, 'Per-rung behaviour', 'what does the next rung require of me?', [e.coverage], () => h('div', {},
    stateBox('not-sourced', `${get(e.coverage.path)} and ${get(e.domain.path)} do not return release_behaviour[] at platform commit 92d103b, so there is no per-rung behaviour to render here. It is left blank rather than filled with an example.`),
    h('ol', { class: 'rungs', start: '0' }, RUNGS.map((r) => h('li', {}, h('code', {}, r.stage), ' ', h('span', { class: 'not-returned' }, 'no behaviours returned'))))), sample);
}

export function governancePanel(e, sample) {
  return frame(5, 'Your governance queue', 'what am I waiting on a human for?', [e.governance], () => {
    const v = governanceView(e.governance.data?.change_requests ?? []);
    const t = (rows, what) => (rows.length === 0 ? stateBox('empty', emptyMessage(e.governance, `no ${what}`))
      : table(['Title', 'Status', 'Proposed by', 'Proposed', 'Decided by', 'Decided', 'Declined reason'],
        rows.map((r) => [r.title, r.status, r.proposedBy, when(r.proposedAt), r.decidedBy, when(r.decidedAt), r.declinedReason ?? '']), ''));
    return h('div', {},
      h('h4', {}, 'Change requests'), t(v.changes, 'change requests'),
      h('h4', {}, 'Tool requests'), h('p', { class: 'ad-rule' }, TOOL_REQUEST_DISCLOSURE), t(v.tools, 'tool requests'));
  }, sample);
}

export function gapsPanel(e, domainKey, sample) {
  const mineView = e.mine.status === 'ok' ? employeeView(e.mine, domainKey) : null;
  // This panel always renders: its static gaps are true whether or not anything has loaded.
  return h('section', { class: 'ad-panel ad-ok', 'aria-labelledby': 'ad-p6' },
    h('header', { class: 'ad-panel-head' }, h('h3', { id: 'ad-p6' }, '6. What is not available'), sample ? h('span', { class: 'sample-badge' }, 'Sample') : null),
    h('p', { class: 'ad-question' }, '"what would I be lying about?"'),
    h('p', { class: 'ad-source' }, 'Reads: ', h('code', {}, get(e.coverage.path)), ', ', h('code', {}, get(e.mine.path)), ', and the facts named beside each line'),
    h('ul', { class: 'gaps' }, gapsView(e.coverage, mineView).map((g) => h('li', {}, g.text, h('span', { class: 'muted' }, ` Source: ${g.source}.`)))));
}
