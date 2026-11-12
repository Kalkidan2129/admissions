// Visitor sample: evidence for admissions.CAP.page_event_admissions_enrichment, read-only.
// One pull of the anonymised admissions signals route, with the admin token the Agent domain
// tab minted (held in session.js memory; this file never sees it). Summaries and checks are plain
// code in visitorSample/model.js. Nothing is written anywhere, and no sample data is kept beyond
// this page's memory, except the anonymous results table the builder chooses to download.
import { h, table } from '../dom.js';
import { formatCentral } from '../time.js';
import { sharedSession } from '../agentDomain/sharedSession.js';
import { OK } from '../agentDomain/session.js';
import { createPuller } from '../visitorSample/pull.js';
import {
  STORY_ID, SAMPLE_SIZE, SAMPLE_RULE, SIGNALS_PATH, NO_TITLE, totalsLine, resultsFile,
} from '../visitorSample/model.js';

const CRITERION = '20 sampled visitor summaries match the underlying page events with zero fabricated page titles.';
let puller = null;

function pullerFor(s, rerender) {
  if (!puller) puller = createPuller({ read: (path) => s.readOnce(path), onChange: () => rerender() });
  return puller;
}

function download(evaluation, pulledAt) {
  const file = resultsFile(evaluation, pulledAt, formatCentral(pulledAt));
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
  const a = h('a', { href: url, download: 'sample-results.json' });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const when = (iso) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? formatCentral(d) : 'no timestamp returned';
};

function visitorDetail(r) {
  return h('details', { class: 'vs-visitor' },
    h('summary', {}, `${r.label}: summary and the ${r.summary.eventsReturned} events it was built from`),
    h('p', {}, h('strong', {}, 'Interest tags: '), r.summary.tags.length ? r.summary.tags.join(', ') : 'none returned'),
    h('p', {}, h('strong', {}, 'Page titles viewed: '), r.summary.titles.join(' · ')),
    r.summary.partial ? h('p', { class: 'ad-state vs-note' },
      `Partial: the route holds ${r.summary.pageEventCount} events for this visitor and returned ${r.summary.eventsReturned}. The summary claims only the returned ones.`) : null,
    table(['Event', 'page_title as returned', 'When (Central)'],
      r.events.map((e) => [e.event_type, e.page_title === null ? `${NO_TITLE}: null in the response` : e.page_title, when(e.timestamp)]), 'No events returned.'));
}

function results(st) {
  const ev = st.evaluation;
  const pulled = `Pulled at ${formatCentral(st.pulledAt)} (HTTP ${st.httpStatus}). One pull per page load: this sample is fixed and is not pulled again.`;
  if (!ev.ok) {
    return h('div', {},
      h('p', { class: 'muted' }, pulled),
      h('p', { class: 'ad-state ad-state-error', role: 'alert' },
        `The route answered, but these fields are missing or the wrong type, so no sample was taken: ${ev.problems.join('; ')}. Nothing has been filled in.`));
  }
  const { sample, totals, route } = ev;
  return h('div', {},
    h('p', { class: 'vs-totals', role: 'status' }, totalsLine(totals)),
    h('p', { class: 'muted' }, pulled),
    sample.short ? h('p', { class: 'ad-state vs-note', role: 'status' },
      `Only ${totals.sampled} of the ${route.visitorsInBody} visitors in this response have at least one page event, fewer than ${SAMPLE_SIZE}. The sample is reported as it is.`) : null,
    h('ul', {},
      h('li', {}, `Visitors in the response: ${route.visitorsInBody} (the route's "returned": ${route.returned}; "matching", its count of admissions memory rows: ${route.matching}).`),
      h('li', {}, `Skipped for having no page events: ${sample.skippedNoEvents}.`),
      h('li', {}, `Skipped for a missing field: ${sample.malformed.length}${sample.malformed.length ? ` (${sample.malformed.map((m) => `position ${m.position}: ${m.problems.join(', ')}`).join('; ')})` : ''}.`),
      h('li', {}, `Not reached after the sample filled: ${sample.notReached}.`)),
    h('h3', {}, 'What the route says about itself, as returned'),
    h('blockquote', {}, route.disclosure),
    h('p', {}, h('strong', {}, 'not_recorded: '), route.notRecorded.length ? route.notRecorded.join(', ') : '(an empty list)'),
    h('h3', {}, 'Results'),
    table(['Visitor', 'Events returned', 'page_event_count', 'Partial', 'Titles in summary', 'Fabricated titles', 'Result'],
      ev.rows.map((r) => [r.label, r.summary.eventsReturned, r.summary.pageEventCount, r.summary.partial ? 'partial' : '',
        r.summary.titles.length, r.check.fabricatedTitles,
        h('span', { class: r.check.result === 'Match' ? 'vs-match' : 'vs-mismatch' }, r.check.result)]),
      'No visitor in this response has a page event, so there is nothing to sample.'),
    ev.rows.length ? h('button', { type: 'button', onclick: () => download(ev, st.pulledAt) }, 'Download results') : null,
    h('p', { class: 'muted' }, 'The download holds only this table, the totals, the pull time, the limits used and the skipped count. No anonymous ids, page paths, page titles or tags.'),
    h('h3', {}, 'Each summary, beside the events it came from'),
    h('p', { class: 'muted' }, 'Shown here for checking by eye; held in this page only. Page paths are not shown.'),
    ev.rows.map(visitorDetail));
}

export function renderVisitorSample(ctx) {
  const head = [
    h('h2', {}, 'Visitor sample'),
    h('p', {}, `Evidence for ${STORY_ID}. Done means: "${CRITERION}"`),
    h('p', { class: 'muted' }, `Read-only. Summaries are built and checked by plain code, not by AI. ${SAMPLE_RULE}`),
  ];
  if (ctx.sample) {
    return h('section', {}, head, h('p', { class: 'ad-state ad-state-sample' },
      'This tab has no sample mode: it shows only what the live route returns. Switch to Real to use it.'));
  }
  const domainKey = ctx.data.plan.project?.name;
  if (domainKey !== 'admissions') {
    return h('section', {}, head, h('p', { class: 'ad-state ad-state-error' }, `The route serves only the admissions domain, and plan.json names "${domainKey ?? 'no project'}".`));
  }
  const s = sharedSession(domainKey, ctx.rerender);
  const p = pullerFor(s, ctx.rerender);
  const st = p.state;
  const signedIn = s.access.status === OK;
  const canPull = signedIn && (st.status === 'idle' || st.status === 'error');

  return h('section', { class: 'visitor-sample' }, head,
    signedIn ? h('p', { class: 'ad-state ad-state-ok' }, 'Signed in. The pull uses the admin token minted on the Agent domain tab, held in this page\'s memory only.')
      : h('p', { class: 'ad-state ad-state-not-loaded' }, 'Not signed in. Sign in on the ', h('a', { href: '#/agentdomain' }, 'Agent domain'), ' tab first; this tab uses the same admin token and never asks for it.'),
    h('p', {}, h('code', {}, `GET ${SIGNALS_PATH}`)),
    h('button', { type: 'button', disabled: !canPull, onclick: () => { p.pull(); } },
      st.status === 'done' ? 'Pulled' : st.status === 'error' ? `Try the pull again (nothing was sampled)` : `Pull ${SAMPLE_SIZE} visitors`),
    st.status === 'loading' ? h('p', { class: 'ad-state ad-state-loading', role: 'status' }, 'Pulling…') : null,
    st.status === 'error' ? h('p', { class: 'ad-state ad-state-error', role: 'alert' },
      `The pull failed at ${formatCentral(st.at)} and nothing was sampled. ${st.error.message}`) : null,
    st.status === 'done' ? results(st) : null);
}
