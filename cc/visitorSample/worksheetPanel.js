// DOM for the by-hand worksheet. The rules live in worksheet.js; this file lays them out.
// Typing never redraws (so a field keeps focus); the timer buttons redraw the tab.
import { h, table } from '../dom.js';
import { formatCentral } from '../time.js';
import { NO_TITLE } from './model.js';
import {
  WORKSHEET_STORY_ID, WORKSHEET_SIZE, RUN_LOG_FILE, worksheetRows, forbiddenStrings, createWorksheet, leakFindings, runLogFile,
} from './worksheet.js';

let sheet = null;
let sheetFor = null;

function worksheetFor(evaluation, rows) {
  if (sheetFor !== evaluation) {
    sheet = createWorksheet(rows.map((r) => r.label));
    sheetFor = evaluation;
  }
  return sheet;
}

const when = (iso) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? formatCentral(d) : 'no timestamp returned';
};

function save(file) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
  const a = h('a', { href: url, download: RUN_LOG_FILE });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function timerView(t, rerender) {
  const r = t.record();
  const line = r.state === 'not started' ? 'Not started.'
    : r.state === 'running' ? `Running since ${r.started_central}.`
      : `${r.date_central}: ${r.started_central} to ${r.stopped_central}, ${r.elapsed_minutes} minutes.`;
  return h('div', { class: 'ws-timer' },
    h('div', { class: 'cr-actions' },
      h('button', { type: 'button', disabled: r.state !== 'not started', onclick: () => { t.start(); rerender(); } }, 'Start timer'),
      h('button', { type: 'button', disabled: r.state !== 'running', onclick: () => { t.stop(); rerender(); } }, 'Stop timer')),
    h('p', { role: 'status' }, h('strong', {}, 'Timer: '), line));
}

function visitorBlock(ws, r, onType) {
  const e = ws.entry(r.label);
  const tags = h('input', { type: 'text', value: e.tags, 'aria-label': `${r.label} tags`,
    oninput: (ev) => { ws.setTags(r.label, ev.target.value); onType(); } });
  const reason = h('textarea', { rows: '3', 'aria-label': `${r.label} reason`,
    oninput: (ev) => { ws.setReason(r.label, ev.target.value); onType(); } }, e.reason);
  return h('section', { class: 'ws-visitor', 'aria-label': r.label },
    h('h4', {}, `${r.label}: ${r.eventsReturned} events returned (page_event_count ${r.pageEventCount})`),
    h('p', {}, h('strong', {}, 'Interests the route returned: '), r.interests.length ? r.interests.join(', ') : 'none returned'),
    table(['page_path', 'page_title', 'When (Central)'],
      r.events.map((ev) => [ev.page_path, ev.page_title === null ? `${NO_TITLE}: null in the response` : ev.page_title, when(ev.timestamp)]),
      'No events returned.'),
    h('label', { class: 'cr-field' }, 'Your tag(s), comma separated ', tags),
    h('label', { class: 'cr-field' }, 'Your reason ', reason));
}

export function worksheetPanel(evaluation, rerender) {
  const rows = worksheetRows(evaluation);
  const head = [
    h('h3', { id: 'ws-head' }, 'By-hand worksheet'),
    h('p', {}, `For ${WORKSHEET_STORY_ID}. The first ${WORKSHEET_SIZE} sampled visitors from the same pull, V01 to V${String(WORKSHEET_SIZE).padStart(2, '0')}. You classify each one by hand: nothing is suggested, pre-filled or computed.`),
  ];
  if (!rows.length) return h('section', { class: 'ws-panel', 'aria-labelledby': 'ws-head' }, head, h('p', { class: 'empty' }, 'No sampled visitors, so there is nothing to classify.'));

  const ws = worksheetFor(evaluation, rows);
  const forbidden = forbiddenStrings(evaluation);
  const warn = h('p', { class: 'ad-state vs-note', role: 'alert', hidden: true });
  const dl = h('button', { type: 'button' }, 'Download run log entries');
  const refresh = () => {
    const leaks = leakFindings(ws, forbidden);
    dl.disabled = leaks.length > 0;
    warn.hidden = leaks.length === 0;
    warn.textContent = leaks.length
      ? `Download is off: ${leaks.map((l) => `${l.label} ${l.field}`).join(', ')} contains a page path, page title or id from the pull. Reword it to describe the page without copying it.`
      : '';
  };
  dl.addEventListener('click', () => {
    try { save(runLogFile(ws, rows, forbidden)); } catch (err) {
      console.error(JSON.stringify({ level: 'error', service: 'command-center', event: 'run_log_download_refused',
        outcome: 'failure', error_class: 'ValidationError', context: { message: err.message } }));
      refresh();
    }
  });
  refresh();

  return h('section', { class: 'ws-panel', 'aria-labelledby': 'ws-head' }, head,
    h('p', { class: 'muted' }, 'Paths, titles and timestamps are shown here only, in this page\'s memory. Nothing is sent to the portal.'),
    timerView(ws.timer, rerender),
    rows.map((r) => visitorBlock(ws, r, refresh)),
    warn,
    h('div', { class: 'cr-actions' }, dl),
    h('p', { class: 'muted' }, `${RUN_LOG_FILE} holds only the V-labels, the tags and reasons you typed, event counts and the timer. No page paths, page titles or ids.`));
}
