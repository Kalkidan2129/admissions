// Run with: node --test cc/tests/domainKey.test.mjs
// The domain KEY builds every portal path and matches panel 1; the display NAME is for headings
// only. On 13 November the platform renamed plan.json's project.name from "admissions" to
// "Admissions & Applicant Experience", and paths built from it got HTTP 400. These tests use
// that new name, so a renamed display name can never break the paths again. No real network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DOMAIN_KEY, domainOf } from '../agentDomain/domain.js';
import { ENDPOINT_PATHS, MGMT_STATUS_PATH, MGMT_ENTER_PATH } from '../agentDomain/api.js';
import { createSession } from '../agentDomain/session.js';
import { employeeView } from '../agentDomain/model.js';
import { sampleEndpoints } from '../agentDomain/fixtures.js';
import { buildBody } from '../agentDomain/changeRequest.js';
import { SIGNALS_PATH } from '../visitorSample/model.js';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const RENAMED = { project: { name: 'Admissions & Applicant Experience' } };
const response = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body, text: async () => JSON.stringify(body) });

test('the key is "admissions" and still equals agent-domain.json domain_key', () => {
  assert.equal(DOMAIN_KEY, 'admissions');
  const synced = JSON.parse(readFileSync(join(repo, '.colaberry', 'agent-domain.json'), 'utf8'));
  assert.equal(synced.domain_key, DOMAIN_KEY);
});

test('with the new display name, the key stays "admissions" and the name is kept for headings', () => {
  assert.deepEqual(domainOf(RENAMED), { key: 'admissions', displayName: 'Admissions & Applicant Experience' });
  assert.deepEqual(domainOf({ project: { name: 'Anything Else' } }).key, 'admissions');
  assert.deepEqual(domainOf({}), { key: 'admissions', displayName: 'admissions' });
  assert.deepEqual(domainOf(null), { key: 'admissions', displayName: 'admissions' });
});

test('every API path is built from the key, never from the display name', () => {
  const p = ENDPOINT_PATHS(domainOf(RENAMED).key);
  assert.deepEqual(p, {
    mine: '/api/admin/agent-domains-mine',
    domain: '/api/admin/agent-domains-mine/admissions',
    coverage: '/api/admin/agent-domains-mine/admissions/coverage',
    governance: '/api/admin/agent-domain-change-requests-mine',
  });
  assert.doesNotMatch(JSON.stringify(p), /Applicant|%20|%26/);
});

test('signed in with the new display name, every portal call goes to an "admissions" path', async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(new URL(url).pathname);
    const path = new URL(url).pathname;
    if (path === MGMT_STATUS_PATH) return response(200, { is_mgmt: true, role: 'r', sections: ['dashboard'] });
    if (path === MGMT_ENTER_PATH) return response(200, { admin_token: 'admin-SECRET', role: 'r', sections: ['dashboard'] });
    return response(200, { rows: [], domains: [], change_requests: [] });
  };
  const s = createSession({ domainKey: domainOf(RENAMED).key, fetchImpl });
  await s.connect('https://p', 'participant-SECRET');
  assert.ok(urls.includes('/api/admin/agent-domains-mine/admissions'));
  assert.ok(urls.includes('/api/admin/agent-domains-mine/admissions/coverage'));
  assert.ok(urls.every((u) => !/Applicant|%20|%26/.test(u)), urls.join(' '));
  assert.ok(Object.values(s.endpoints).every((e) => e.status === 'ok'));
});

test('panel 1 matches the row on the key, not the display name', () => {
  const mine = { status: 'ok', httpStatus: 200, data: { domains: [{ domain_key: 'admissions', agent_id: 'a-1', agent_tools_granted: [] }] } };
  assert.equal(employeeView(mine, domainOf(RENAMED).key).kind, 'ok');
  // What the bug did: matching on the display name finds nothing.
  assert.equal(employeeView(mine, RENAMED.project.name).kind, 'empty');
  // Sample mode, built from the key, also matches.
  assert.equal(employeeView(sampleEndpoints(domainOf(RENAMED).key).mine, DOMAIN_KEY).kind, 'ok');
});

test('the Visitor sample route and the change-request body both use "admissions"', () => {
  assert.match(SIGNALS_PATH, /^\/api\/admin\/agent-domains-mine\/admissions\/admissions-signals\?/);
  assert.equal(buildBody('A title', '').domain_key, 'admissions');
});

test('no tab builds a path or a session from plan.json project.name', () => {
  // project.name may appear only where it is shown as a name: the page header, the overview card,
  // and domain.js itself, which turns it into a display name.
  const allowed = new Set(['app.js', 'overview.js', 'domain.js']);
  const dirs = ['', 'tabs', 'agentDomain', 'visitorSample'].map((d) => join(repo, 'cc', d));
  for (const dir of dirs) {
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
      const code = readFileSync(join(dir, f), 'utf8').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
      if (!allowed.has(f)) assert.doesNotMatch(code, /project\??\.name/, f);
    }
  }
  for (const f of ['agentDomain.js', 'visitorSample.js']) {
    const code = readFileSync(join(repo, 'cc', 'tabs', f), 'utf8');
    assert.match(code, /sharedSession\((domainKey|DOMAIN_KEY),/, f);
  }
  assert.match(readFileSync(join(repo, 'cc', 'tabs', 'agentDomain.js'), 'utf8'), /const \{ key: domainKey, displayName \} = domainOf\(ctx\.data\.plan\)/);
});
