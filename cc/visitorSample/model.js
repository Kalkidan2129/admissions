// Visitor sample for admissions.CAP.page_event_admissions_enrichment, in plain code (no AI).
// Criterion: "20 sampled visitor summaries match the underlying page events with zero
// fabricated page titles."
//
// Everything here works on ONE response from ONE pull. Visitors are matched to events only
// through the nesting the route returns (each visitor carries its own page_events); anon_id is
// never used as a join key, here or across pulls. It is read only to check it is present.
//
// Route read at platform commit 3d443b8: agentDomainRoutes.ts:566-600 (the route, defaults, the
// not_recorded list and the disclosure) and admissionsSignalsReader.ts:71-84 (the visitor and
// event shapes; page_title is null when the event recorded none).

export const STORY_ID = 'admissions.CAP.page_event_admissions_enrichment';
export const SAMPLE_SIZE = 20;
// The platform team measured the route and approved limit=35 and events_per_visitor=20
// (2026-11-12), after a limit=100 pull failed. These are the only two values this tab sends:
// MAX_LIMIT and MAX_EVENTS_PER_VISITOR are ceilings it can never exceed.
export const MAX_LIMIT = 35;
export const MAX_EVENTS_PER_VISITOR = 20;
export const LIMIT = 35;
export const EVENTS_PER_VISITOR = 20;

/** The route path for a pull. Refuses anything but the two approved values, limit=35 and events_per_visitor=20. */
export function signalsPath(limit, eventsPerVisitor) {
  for (const [name, n, only] of [['limit', limit, MAX_LIMIT], ['events_per_visitor', eventsPerVisitor, MAX_EVENTS_PER_VISITOR]]) {
    if (n !== only) throw new RangeError(`${name} must be exactly ${only}, the value the platform team approved; ${n} was refused.`);
  }
  return `/api/admin/agent-domains-mine/admissions/admissions-signals?limit=${limit}&events_per_visitor=${eventsPerVisitor}`;
}

export const SIGNALS_PATH = signalsPath(LIMIT, EVENTS_PER_VISITOR);
export const NO_TITLE = '(no title)';
export const SAMPLE_RULE = `One pull of GET ${SIGNALS_PATH}. From that single response, the visitors whose page_event_count `
  + `is at least 1, in the order the route returned them, up to ${SAMPLE_SIZE}. Visitors with no events are skipped and counted. `
  + `If fewer than ${SAMPLE_SIZE} have events, the sample is reported as it is: nothing is pulled again, and never with a limit `
  + `above ${MAX_LIMIT} or events_per_visitor above ${MAX_EVENTS_PER_VISITOR}. A visitor with more events than the ${EVENTS_PER_VISITOR} returned is marked partial.`;

const isString = (v) => typeof v === 'string';
const isStringArray = (v) => Array.isArray(v) && v.every(isString);
const isCount = (v) => Number.isInteger(v) && v >= 0;

/**
 * The top-level fields this tab needs. Returns the names of any that are missing or the wrong
 * type; an empty list means the response can be sampled.
 */
export function responseProblems(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return ['the body is not a JSON object'];
  const problems = [];
  if (!Array.isArray(body.visitors)) problems.push('visitors (a list)');
  if (!isCount(body.returned)) problems.push('returned (a count)');
  if (!isCount(body.matching)) problems.push('matching (a count)');
  if (!isStringArray(body.not_recorded)) problems.push('not_recorded (a list of field names)');
  if (!isString(body.disclosure)) problems.push('disclosure (a sentence)');
  return problems;
}

/** Missing or wrongly typed fields on one visitor and its events, named as the route names them. */
export function visitorProblems(v) {
  if (!v || typeof v !== 'object') return ['the visitor is not an object'];
  const problems = [];
  if (!isString(v.anon_id) || !v.anon_id) problems.push('anon_id');
  if (!isStringArray(v.interests)) problems.push('interests');
  if (!isCount(v.page_event_count)) problems.push('page_event_count');
  if (!Array.isArray(v.page_events)) problems.push('page_events');
  else {
    v.page_events.forEach((e, i) => {
      const n = i + 1;
      if (!e || typeof e !== 'object') { problems.push(`page_events[${n}]`); return; }
      if (!isString(e.event_type)) problems.push(`page_events[${n}].event_type`);
      if (!isString(e.page_path)) problems.push(`page_events[${n}].page_path`);
      // Present and either a string or null; absent is a missing field, not "no title".
      if (!('page_title' in e) || !(e.page_title === null || isString(e.page_title))) problems.push(`page_events[${n}].page_title`);
      if (!('timestamp' in e) || !(e.timestamp === null || isString(e.timestamp))) problems.push(`page_events[${n}].timestamp`);
    });
  }
  return problems;
}

/**
 * Walks the response in order and keeps the first SAMPLE_SIZE visitors with at least one event.
 * `skippedNoEvents` counts visitors passed over for having none before the sample filled;
 * `malformed` lists visitors passed over because a field was missing (by position, never by id);
 * `notReached` is how many came after the sample filled and were not looked at.
 */
export function selectSample(visitors, size = SAMPLE_SIZE) {
  const chosen = [];
  const malformed = [];
  let skippedNoEvents = 0;
  let i = 0;
  for (; i < visitors.length && chosen.length < size; i++) {
    const problems = visitorProblems(visitors[i]);
    if (problems.length) { malformed.push({ position: i + 1, problems }); continue; }
    if (visitors[i].page_event_count < 1) { skippedNoEvents++; continue; }
    chosen.push(visitors[i]);
  }
  return { chosen, skippedNoEvents, malformed, notReached: visitors.length - i, short: chosen.length < size };
}

/**
 * The summary: the visitor's interest tags, and the distinct page titles of its own returned
 * events in the order returned. An event without a title contributes NO_TITLE; a title is never
 * made from page_path. `partial` means the route holds more events than it returned, so the
 * summary claims only the returned ones.
 */
export function buildSummary(v) {
  const titles = [];
  for (const e of v.page_events) {
    const t = e.page_title === null ? NO_TITLE : e.page_title;
    if (!titles.includes(t)) titles.push(t);
  }
  return {
    tags: [...v.interests],
    titles,
    eventsReturned: v.page_events.length,
    pageEventCount: v.page_event_count,
    partial: v.page_event_count > v.page_events.length,
  };
}

/**
 * Checks a summary against the visitor's own returned events, independently of how the summary
 * was built: every title must be a page_title of one of those events (NO_TITLE only where an event
 * has none), and every tag must be one the route returned for that visitor.
 */
export function checkSummary(summary, v) {
  const real = new Set(v.page_events.filter((e) => e.page_title !== null).map((e) => e.page_title));
  const hasUntitled = v.page_events.some((e) => e.page_title === null);
  const fabricatedTitles = summary.titles.filter((t) => !(real.has(t) || (t === NO_TITLE && hasUntitled)));
  const unknownTags = summary.tags.filter((t) => !v.interests.includes(t));
  return {
    fabricatedTitles: fabricatedTitles.length,
    unknownTags: unknownTags.length,
    result: fabricatedTitles.length === 0 && unknownTags.length === 0 ? 'Match' : 'Mismatch',
  };
}

const label = (n) => `V${String(n).padStart(2, '0')}`;

/** Everything the tab shows, from one response body. Throws nothing; problems are returned. */
export function evaluate(body) {
  const problems = responseProblems(body);
  if (problems.length) return { ok: false, problems };
  const sample = selectSample(body.visitors);
  const rows = sample.chosen.map((v, i) => {
    const summary = buildSummary(v);
    const check = checkSummary(summary, v);
    return { label: label(i + 1), summary, check, events: v.page_events };
  });
  const matches = rows.filter((r) => r.check.result === 'Match').length;
  const fabricated = rows.reduce((n, r) => n + r.check.fabricatedTitles, 0);
  return {
    ok: true,
    rows,
    sample,
    totals: { matches, sampled: rows.length, fabricatedTitles: fabricated },
    route: { returned: body.returned, matching: body.matching, visitorsInBody: body.visitors.length,
      notRecorded: body.not_recorded, disclosure: body.disclosure },
  };
}

// A short sample says so in the line itself, so "15 of 15" is never read as the 20 the criterion asks for.
export const totalsLine = (t) => `${t.matches} of ${t.sampled} match · ${t.fabricatedTitles} fabricated titles`
  + (t.sampled < SAMPLE_SIZE ? ` (only ${t.sampled} sampled; the criterion asks for ${SAMPLE_SIZE})` : '');

/**
 * sample-results.json: the V01-V20 table, the totals, the pull time, the limits used and the
 * skipped count. No anon_id, no page path, no page title, no tag.
 */
export function resultsFile(evaluation, pulledAt, pulledAtCentral) {
  return {
    story: STORY_ID,
    pulled_at: pulledAt.toISOString(),
    pulled_at_central: pulledAtCentral,
    limit: LIMIT,
    events_per_visitor: EVENTS_PER_VISITOR,
    skipped_no_events: evaluation.sample.skippedNoEvents,
    totals: {
      matches: evaluation.totals.matches,
      sampled: evaluation.totals.sampled,
      target: SAMPLE_SIZE,
      fabricated_titles: evaluation.totals.fabricatedTitles,
      line: totalsLine(evaluation.totals),
    },
    rows: evaluation.rows.map((r) => ({
      visitor: r.label,
      events_returned: r.summary.eventsReturned,
      page_event_count: r.summary.pageEventCount,
      partial: r.summary.partial,
      titles_in_summary: r.summary.titles.length,
      fabricated_titles: r.check.fabricatedTitles,
      result: r.check.result,
    })),
  };
}
