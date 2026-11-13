// DOM for "File a change request". The rules live in changeRequest.js; this file lays them out.
// Typing updates the counts and the buttons in place (no redraw, so the field keeps focus); Review
// and File it redraw the tab. The admin token stays in session.js: this file never sees it.
import { h } from '../dom.js';
import { OK } from './session.js';
import { createFiling, FINAL_NOTE, TITLE_MAX, DESCRIPTION_MAX } from './changeRequest.js';

let filing = null;
let redraw = () => {};

function filingFor(s) {
  if (!filing) {
    filing = createFiling({
      file: (body) => s.fileChangeRequest(body),
      reread: () => s.rereadGovernance(),
      onChange: () => redraw(),
    });
  }
  return filing;
}

const countText = (c) => `${c.count} of ${c.max} characters${c.error ? `: ${c.error}` : ''}`;

function outcomeView(f) {
  if (f.phase === 'sending') return h('p', { class: 'ad-state ad-state-loading', role: 'status' }, 'Sending one POST…');
  if (f.phase === 'checking' && !f.outcome) return h('p', { class: 'ad-state ad-state-loading', role: 'status' }, 'No answer. Re-reading the governance panel…');
  const o = f.outcome;
  if (!o) return null;
  if (o.kind === 'filed') {
    return h('div', { class: 'ad-state ad-state-ok', role: 'status' },
      h('p', {}, `The portal answered HTTP ${o.httpStatus}.`),
      h('p', {}, 'Request id: ', h('code', {}, o.id ?? 'not in the response')),
      h('p', {}, 'Status: ', h('code', {}, o.status ?? 'not in the response')),
      h('p', { class: 'muted' }, 'The governance panel above was read again to show it.'));
  }
  if (o.kind === 'refused') {
    return h('div', { class: 'ad-state ad-state-error', role: 'alert' },
      h('p', {}, `The portal answered HTTP ${o.httpStatus} with:`), h('pre', { class: 'cr-body' }, o.words));
  }
  if (o.kind === 'unknown') {
    return h('div', { class: 'ad-state ad-state-error', role: 'alert' }, h('p', {}, h('strong', {}, o.words)), h('p', { class: 'muted' }, o.detail));
  }
  return h('div', { class: 'ad-state ad-state-error', role: 'alert' }, h('p', {}, o.words));
}

export function filePanel(s, sample, rerender) {
  redraw = rerender;
  const head = [
    h('header', { class: 'ad-panel-head' }, h('h3', { id: 'ad-p7' }, '7. File a change request'), sample ? h('span', { class: 'sample-badge' }, 'Sample') : null),
    h('p', { class: 'ad-question' }, '"what do I want a human to decide?"'),
    h('p', { class: 'ad-source' }, 'Writes: ', h('code', {}, `POST ${s.paths.governance}`), ', once. Then reads: ', h('code', {}, `GET ${s.paths.governance}`)),
  ];
  const wrap = (...body) => h('section', { class: 'ad-panel ad-ok cr-panel', 'aria-labelledby': 'ad-p7' }, ...head, ...body);
  if (sample) return wrap(h('p', { class: 'ad-state ad-state-sample' }, 'Sample mode: filing is off. Switch to Real and sign in to file a request.'));

  const f = filingFor(s);
  const signedIn = s.access.status === OK;
  const titleCount = h('span', { class: 'cr-count', 'aria-live': 'polite' });
  const descCount = h('span', { class: 'cr-count', 'aria-live': 'polite' });
  const reviewBtn = h('button', { type: 'button', onclick: () => f.review() }, 'Review');
  const fileBtn = h('button', { type: 'button', class: 'cr-file', onclick: () => { f.fileIt(); } }, 'File it');
  const reviewBox = f.reviewed ? h('div', { class: 'cr-review' },
    h('p', {}, 'This exact JSON body will be sent:'),
    h('pre', { class: 'cr-body' }, JSON.stringify(f.reviewed, null, 2)),
    h('p', { class: 'cr-final' }, FINAL_NOTE)) : null;

  const refresh = () => {
    const c = f.check;
    titleCount.textContent = countText(c.title);
    descCount.textContent = countText(c.description);
    titleCount.classList.toggle('cr-over', Boolean(c.title.error) && f.title !== '');
    descCount.classList.toggle('cr-over', Boolean(c.description.error));
    reviewBtn.disabled = !f.canReview;
    fileBtn.disabled = !(signedIn && f.canFile);
    if (reviewBox && !f.reviewed) reviewBox.remove();
  };
  const title = h('input', { type: 'text', value: f.title, readonly: f.sent, 'aria-label': 'Title',
    oninput: (ev) => { f.setTitle(ev.target.value); refresh(); } });
  const description = h('textarea', { rows: '5', readonly: f.sent, 'aria-label': 'Description',
    oninput: (ev) => { f.setDescription(ev.target.value); refresh(); } }, f.description);
  refresh();

  return wrap(
    signedIn ? null : h('p', { class: 'ad-state ad-state-not-loaded' }, 'Sign in above first. File it stays off until you are signed in.'),
    h('p', { class: 'muted' }, `The body is always kind "change" and domain_key "admissions", with your title (at most ${TITLE_MAX} characters, with at least one letter) and description (at most ${DESCRIPTION_MAX}). Spaces at either end are trimmed, as the portal does.`),
    h('label', { class: 'cr-field' }, 'Title ', title, titleCount),
    h('label', { class: 'cr-field' }, 'Description ', description, descCount),
    h('div', { class: 'cr-actions' }, reviewBtn, fileBtn),
    reviewBox,
    outcomeView(f));
}
