// Dates and ages, always shown in Central time.

export const TIME_ZONE = 'America/Chicago';
export const FRESH_WITHIN_HOURS = 24;
export const STALE_AFTER_DAYS = 7;

const HOUR_MS = 3600 * 1000;
const DAY_MS = 24 * HOUR_MS;

// How old the data in manifest.generated_at is.
// level: 'fresh' (under a day), 'aging' (a day to a week), 'stale' (over a week),
// or 'unknown' when the stamp is missing or unreadable.
export function dataAge(generatedAt, now = new Date()) {
  const at = generatedAt ? new Date(generatedAt) : null;
  if (!at || Number.isNaN(at.getTime())) return { level: 'unknown', at: null, ms: null };
  const ms = Math.max(0, now.getTime() - at.getTime());
  let level = 'aging';
  if (ms < FRESH_WITHIN_HOURS * HOUR_MS) level = 'fresh';
  else if (ms > STALE_AFTER_DAYS * DAY_MS) level = 'stale';
  return { level, at, ms };
}

export function relativeAge(ms) {
  if (ms < HOUR_MS) return 'less than an hour ago';
  if (ms < DAY_MS) {
    const h = Math.floor(ms / HOUR_MS);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.floor(ms / DAY_MS);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

// "1 November 2026, 4:27 PM CST"
export function formatCentral(date) {
  const day = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: TIME_ZONE,
  }).format(date);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: TIME_ZONE,
  }).format(date);
  return `${day}, ${time}`;
}

// Today's calendar date in Central, as YYYY-MM-DD, to compare with plan dates.
export function todayCentral(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
}

// Whole days from date a to date b (both YYYY-MM-DD). Positive when b is later.
export function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}

// "in 3 days", "today", "34 days ago"
export function describeDate(ymd, today) {
  const d = daysBetween(today, ymd);
  if (d === 0) return 'today';
  const n = Math.abs(d);
  const unit = `${n} day${n === 1 ? '' : 's'}`;
  return d > 0 ? `in ${unit}` : `${unit} ago`;
}

// How far a story's current due date has moved from the date it was first given.
export function describeSlip(dueOn, baselineOn) {
  if (!dueOn || !baselineOn) return 'no baseline in the plan';
  const d = daysBetween(baselineOn, dueOn);
  if (d === 0) return 'on its first date';
  const n = Math.abs(d);
  return `moved ${n} day${n === 1 ? '' : 's'} ${d > 0 ? 'later' : 'earlier'}`;
}

// Where `today` sits against the release windows in the plan.
// kind: 'within' (release is the first window containing today), 'before', 'after',
// 'between' or 'undated' (no release carries both dates).
export function releasePosition(releases, today) {
  const dated = (releases ?? []).filter((r) => r.starts_on && r.ends_on);
  if (dated.length === 0) return { kind: 'undated', release: null };
  const current = dated.find((r) => r.starts_on <= today && today <= r.ends_on);
  if (current) return { kind: 'within', release: current };
  const lastEnd = dated.map((r) => r.ends_on).sort().at(-1);
  const firstStart = dated.map((r) => r.starts_on).sort()[0];
  if (today > lastEnd) return { kind: 'after', release: null, lastEnd };
  if (today < firstStart) return { kind: 'before', release: null, firstStart };
  return { kind: 'between', release: null };
}
