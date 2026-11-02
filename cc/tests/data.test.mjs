// Run with: node --test cc/tests/data.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadRealData, joinStories, DataLoadError, DATA_FILES } from '../data.js';
import { dataAge, describeDate, releasePosition, formatCentral } from '../time.js';

const okFetch = (files) => async (path) => ({
  ok: path in files,
  status: path in files ? 200 : 404,
  json: async () => (typeof files[path] === 'string' ? JSON.parse(files[path]) : files[path]),
});
const FILES = {
  [DATA_FILES.plan]: { stories: [{ id: 'S-1', title: 'One', release: 'r0' }] },
  [DATA_FILES.progress]: { totals: {}, stories: [{ id: 'S-1', verification: null }, { id: 'STORY-000' }] },
  [DATA_FILES.manifest]: { generated_at: '2026-11-01T22:27:17.075Z' },
};

test('loads all three files', async () => {
  const data = await loadRealData(okFetch(FILES));
  assert.equal(data.plan.stories[0].id, 'S-1');
  assert.equal(data.manifest.generated_at, '2026-11-01T22:27:17.075Z');
});

test('a missing file fails loudly and names the file', async () => {
  const { [DATA_FILES.manifest]: _, ...rest } = FILES;
  await assert.rejects(loadRealData(okFetch(rest)), (err) =>
    err instanceof DataLoadError && err.file === DATA_FILES.manifest && /404/.test(err.message));
});

test('a file that is not JSON fails loudly', async () => {
  await assert.rejects(loadRealData(okFetch({ ...FILES, [DATA_FILES.plan]: '{not json' })),
    (err) => err instanceof DataLoadError && err.file === DATA_FILES.plan);
});

test('a server that never answers times out', async () => {
  const hang = (_path, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
  });
  await assert.rejects(loadRealData(hang, 20), (err) => err instanceof DataLoadError && /no answer/.test(err.message));
});

test('join keeps progress-only stories and reports no verification as null, not zero', () => {
  const rows = joinStories(FILES[DATA_FILES.plan], FILES[DATA_FILES.progress]);
  assert.deepEqual(rows.map((r) => r.id), ['S-1', 'STORY-000']);
  assert.equal(rows[0].title, 'One');
  assert.equal(rows[0].state, null);
  assert.equal(rows[0].criteriaPassed, null);
  assert.equal(rows[1].inPlan, false);
});

test('deleting a story from the files removes it from the join', () => {
  const rows = joinStories({ stories: [] }, { stories: [] });
  assert.equal(rows.length, 0);
});

test('data age: fresh, aging, stale and unknown', () => {
  const now = new Date('2026-11-10T00:00:00Z');
  assert.equal(dataAge('2026-11-09T20:00:00Z', now).level, 'fresh');
  assert.equal(dataAge('2026-11-06T00:00:00Z', now).level, 'aging');
  assert.equal(dataAge('2026-11-03T00:00:00Z', now).level, 'aging'); // exactly 7 days is not over a week
  assert.equal(dataAge('2026-11-02T23:00:00Z', now).level, 'stale');
  assert.equal(dataAge(undefined, now).level, 'unknown');
  assert.equal(dataAge('not a date', now).level, 'unknown');
});

test('formats in Central time with the zone written out', () => {
  assert.equal(formatCentral(new Date('2026-11-01T22:27:17.075Z')), '1 November 2026, 4:27 PM CST');
  assert.equal(formatCentral(new Date('2026-10-23T06:01:34Z')), '23 October 2026, 1:01 AM CDT');
});

test('release position and relative dates', () => {
  const releases = [{ key: 'r0', starts_on: '2026-09-20', ends_on: '2026-09-20' }];
  assert.equal(releasePosition(releases, '2026-11-01').kind, 'after');
  assert.equal(releasePosition(releases, '2026-09-20').release.key, 'r0');
  assert.equal(releasePosition([], '2026-11-01').kind, 'undated');
  assert.equal(describeDate('2026-09-27', '2026-11-01'), '35 days ago');
  assert.equal(describeDate('2026-11-01', '2026-11-01'), 'today');
});
