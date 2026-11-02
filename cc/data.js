// The one place that knows where the Command Center's data lives.
// Every tab gets its data through loadRealData() (or sample.js in sample mode);
// no tab fetches a file or hard-codes plan content itself.
//
// Failure modes handled here:
//   - a file is missing or the server answers non-2xx  -> DataLoadError naming the file
//   - a file is not valid JSON                         -> DataLoadError naming the file
//   - the server never answers                         -> DataLoadError after FETCH_TIMEOUT_MS
// No retry: these are static files served beside the page. A failure means a file
// is not there or the local server is not running, and a retry cannot fix either.
// The error is shown on screen by app.js, never swallowed.

export const DATA_FILES = {
  plan: '.colaberry/plan.json',
  progress: '.colaberry/progress.json',
  manifest: '.colaberry/manifest.json',
};

// Your own notes for the Knowledge base. Optional: a missing file is an empty
// notes list, but a file that exists and cannot be read is still an error.
export const NOTES_FILE = 'knowledge/notes.json';

export const FETCH_TIMEOUT_MS = 10000;

export class DataLoadError extends Error {
  constructor(file, reason, status = null) {
    super(`Could not load ${file}: ${reason}`);
    this.name = 'DataLoadError';
    this.file = file;
    this.reason = reason;
    this.status = status;
  }
}

async function fetchJson(fetchImpl, path, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetchImpl(path, { cache: 'no-store', signal: controller.signal });
  } catch (err) {
    const reason = err.name === 'AbortError' ? `no answer after ${timeoutMs} ms` : err.message;
    throw new DataLoadError(path, reason);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) throw new DataLoadError(path, `the server answered HTTP ${response.status}`, response.status);
  try {
    return await response.json();
  } catch (err) {
    throw new DataLoadError(path, `it is not valid JSON (${err.message})`);
  }
}

// Reads the three files at runtime. `fetchImpl` is injectable so tests can run in Node.
export async function loadRealData(fetchImpl = fetch, timeoutMs = FETCH_TIMEOUT_MS) {
  const [plan, progress, manifest] = await Promise.all([
    fetchJson(fetchImpl, DATA_FILES.plan, timeoutMs),
    fetchJson(fetchImpl, DATA_FILES.progress, timeoutMs),
    fetchJson(fetchImpl, DATA_FILES.manifest, timeoutMs),
  ]);
  return { plan, progress, manifest, notes: await loadNotes(fetchImpl, timeoutMs) };
}

// { entries, error }: a 404 gives no entries and no error; any other failure is
// reported to the Knowledge base tab rather than blanking the whole page.
export async function loadNotes(fetchImpl = fetch, timeoutMs = FETCH_TIMEOUT_MS) {
  try {
    const file = await fetchJson(fetchImpl, NOTES_FILE, timeoutMs);
    return { entries: Array.isArray(file.entries) ? file.entries : [], error: null };
  } catch (err) {
    if (err instanceof DataLoadError && err.status === 404) return { entries: [], error: null };
    console.error('cc: notes load failed:', err);
    return { entries: [], error: err };
  }
}

// Joins progress stories to plan stories on id. Progress is the list of record
// (it can hold a story the plan does not, such as STORY-000). `state` is null when
// no verification run has happened: "not checked yet", never a zero.
export function joinStories(plan, progress) {
  const planById = new Map((plan.stories ?? []).map((s) => [s.id, s]));
  return (progress.stories ?? []).map((p) => {
    const planned = planById.get(p.id) ?? null;
    const v = p.verification ?? null;
    return {
      id: p.id,
      title: planned?.title ?? null,
      release: planned?.release ?? p.release ?? null,
      inPlan: planned !== null,
      dueOn: planned?.due_on ?? null,
      dueBaselineOn: planned?.due_baseline_on ?? null,
      state: v?.state ?? null,
      criteriaPassed: v ? v.criteria_passed : null,
      criteriaTotal: v ? v.criteria_total : null,
      pointsAwarded: v?.points_awarded ?? null,
      commitUrl: v?.commit_url ?? null,
    };
  });
}
