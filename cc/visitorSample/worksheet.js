// By-hand worksheet for admissions.CAP.page_event_admissions_enrichment.L1-BY-HAND, in plain code.
//
// The builder classifies visitors BY HAND. This module never suggests, pre-fills or computes a
// tag: every tag and reason starts as an empty string and only ever holds what was typed.
//
// It works on the Visitor sample's ONE pull (no second pull, no new route, nothing written to the
// portal). The first WORKSHEET_SIZE sampled visitors, with the same V-labels as the results
// table, are shown on screen with each returned event's page_path, page_title and timestamp and
// the interests the route returned. None of that goes into the download.
//
// The download (run-log-entries.json, gitignored) holds only the V-labels, the typed tags and
// reasons, event counts and the timer. Typed text is the one way a path, title or id could get in,
// so leakFindings() checks every typed field against what the pull returned and the download is
// refused while any field contains one.

import { formatCentral, todayCentral } from '../time.js';

export const WORKSHEET_STORY_ID = 'admissions.CAP.page_event_admissions_enrichment.L1-BY-HAND';
export const WORKSHEET_SIZE = 10;
export const RUN_LOG_FILE = 'run-log-entries.json';
// Returned strings shorter than this are not checked for in typed text: a page_path of "/" would
// otherwise refuse every reason containing a slash.
export const MIN_LEAK_CHARS = 4;

/** The first WORKSHEET_SIZE rows of an evaluation (see model.js evaluate), for showing on screen. */
export function worksheetRows(evaluation) {
  if (!evaluation?.ok) return [];
  return evaluation.rows.slice(0, WORKSHEET_SIZE).map((r) => ({
    label: r.label,
    events: r.events.map((e) => ({ page_path: e.page_path, page_title: e.page_title, timestamp: e.timestamp })),
    interests: [...r.summary.tags],
    eventsReturned: r.summary.eventsReturned,
    pageEventCount: r.summary.pageEventCount,
  }));
}

/** Every returned string that must never reach a download: page paths, page titles and anon ids. */
export function forbiddenStrings(evaluation) {
  if (!evaluation?.ok) return [];
  const out = new Set();
  for (const r of evaluation.rows) {
    for (const e of r.events) {
      if (typeof e.page_path === 'string') out.add(e.page_path);
      if (typeof e.page_title === 'string') out.add(e.page_title);
    }
  }
  for (const id of evaluation.anonIds ?? []) out.add(id);
  return [...out].filter((s) => s.trim().length >= MIN_LEAK_CHARS);
}

const elapsedMinutes = (start, end) => Math.round(((end.getTime() - start.getTime()) / 60000) * 10) / 10;

/**
 * The timer: one start and one stop. `now` is injected so tests control the clock.
 * Start is refused once started; Stop is refused unless running.
 */
export function createTimer({ now = () => new Date() } = {}) {
  let startedAt = null;
  let stoppedAt = null;
  return {
    get running() { return startedAt !== null && stoppedAt === null; },
    get startedAt() { return startedAt; },
    get stoppedAt() { return stoppedAt; },
    start() { if (startedAt) return false; startedAt = now(); return true; },
    stop() { if (!startedAt || stoppedAt) return false; stoppedAt = now(); return true; },
    /** What the run log records. Times in Central, plus ISO for exact arithmetic. */
    record() {
      return {
        date_central: startedAt ? todayCentral(startedAt) : null,
        started_central: startedAt ? formatCentral(startedAt) : null,
        stopped_central: stoppedAt ? formatCentral(stoppedAt) : null,
        started_at: startedAt ? startedAt.toISOString() : null,
        stopped_at: stoppedAt ? stoppedAt.toISOString() : null,
        elapsed_minutes: startedAt && stoppedAt ? elapsedMinutes(startedAt, stoppedAt) : null,
        state: !startedAt ? 'not started' : stoppedAt ? 'stopped' : 'running',
      };
    },
  };
}

/** The worksheet's typed entries, keyed by V-label. Every field starts empty. */
export function createWorksheet(labels, { now } = {}) {
  const entries = new Map(labels.map((l) => [l, { tags: '', reason: '' }]));
  const timer = createTimer({ now });
  const set = (label, field, value) => {
    const e = entries.get(label);
    if (e) e[field] = String(value ?? '');
  };
  return {
    timer,
    entry: (label) => ({ ...entries.get(label) }),
    setTags: (label, v) => set(label, 'tags', v),
    setReason: (label, v) => set(label, 'reason', v),
    get labels() { return [...entries.keys()]; },
  };
}

/** Typed fields that contain a returned path, title or id, by V-label and field (never the string itself). */
export function leakFindings(worksheet, forbidden) {
  const found = [];
  for (const label of worksheet.labels) {
    const e = worksheet.entry(label);
    for (const field of ['tags', 'reason']) {
      if (forbidden.some((s) => e[field].includes(s))) found.push({ label, field });
    }
  }
  return found;
}

/**
 * run-log-entries.json. Only V-labels, typed tags and reasons, event counts and the timer.
 * Typed tags are split on commas exactly as typed (trimmed, empty pieces dropped); the raw text is
 * kept too. Throws if any typed field contains a returned path, title or id.
 */
export function runLogFile(worksheet, rows, forbidden) {
  const leaks = leakFindings(worksheet, forbidden);
  if (leaks.length) {
    throw new Error(`Not saved: ${leaks.map((l) => `${l.label} ${l.field}`).join(', ')} contains a page path, page title or id from the pull.`);
  }
  const counts = new Map(rows.map((r) => [r.label, r]));
  return {
    story: WORKSHEET_STORY_ID,
    timer: worksheet.timer.record(),
    visitors: worksheet.labels.map((label) => {
      const e = worksheet.entry(label);
      const r = counts.get(label);
      return {
        visitor: label,
        tags_typed: e.tags.trim(),
        tags: e.tags.split(',').map((t) => t.trim()).filter(Boolean),
        reason: e.reason.trim(),
        events_returned: r?.eventsReturned ?? null,
        page_event_count: r?.pageEventCount ?? null,
      };
    }),
  };
}
