// Agent domain: the six STORY-000 panels, read live from the portal's /api/admin endpoints with
// the admin token the builder types into this page. The token is held in session.js memory only.
// In Sample mode the panels show the made-up responses in agentDomain/fixtures.js instead.
import { h } from '../dom.js';
import { createSession } from '../agentDomain/session.js';
import { normaliseBaseUrl } from '../agentDomain/api.js';
import { sampleEndpoints } from '../agentDomain/fixtures.js';
import { PLATFORM_COMMIT } from '../agentDomain/authority.js';
import {
  employeePanel, inventoryPanel, ladderPanel, behaviourPanel, governancePanel, gapsPanel,
} from '../agentDomain/panels.js';

let session = null;
let rerender = () => {};
let formError = null;

function sessionFor(domainKey) {
  if (!session) {
    session = createSession({ domainKey });
    session.subscribe(() => rerender());
  }
  return session;
}

function connectForm(s) {
  const base = h('input', { type: 'url', name: 'portal', required: true, placeholder: 'https://…', value: s.baseUrl ?? '',
    autocomplete: 'url', 'aria-label': 'Portal base URL' });
  const token = h('input', { type: 'password', name: 'token', required: true, autocomplete: 'off', spellcheck: 'false',
    'aria-label': 'Admin token', placeholder: s.hasToken ? 'Held in memory. Paste again to replace.' : 'Admin token' });
  // method="dialog" and preventDefault: the browser must never turn this form into a URL.
  const form = h('form', { class: 'ad-connect', method: 'dialog', onsubmit: (ev) => {
    ev.preventDefault();
    let url;
    try { url = normaliseBaseUrl(base.value); } catch (err) { formError = err.message; rerender(); return; }
    const value = token.value.trim();
    token.value = '';
    if (!value) { formError = 'Enter your admin token.'; rerender(); return; }
    formError = null;
    s.connect(url, value).catch((err) => { formError = err.message; rerender(); });
  } },
  h('label', {}, 'Portal base URL ', base),
  h('label', {}, 'Admin token ', token),
  h('button', { type: 'submit' }, s.hasToken ? 'Reload' : 'Load'),
  s.hasToken ? h('button', { type: 'button', class: 'secondary', onclick: () => s.forget() }, 'Forget token') : null);
  return h('div', { class: 'ad-connect-box' }, form,
    formError ? h('p', { class: 'ad-state ad-state-error', role: 'alert' }, formError) : null,
    h('p', { class: 'muted' }, s.hasToken
      ? 'Token held in this page\'s memory only. It is not saved anywhere; reloading the page or "Forget token" drops it.'
      : 'The token is kept in this page\'s memory only: never saved to a file, the browser\'s storage or a commit, and never put in the address bar.'));
}

export function renderAgentDomain(ctx) {
  rerender = ctx.rerender;
  const domainKey = ctx.data.plan.project?.name;
  if (!domainKey) return h('section', {}, h('h2', {}, 'Agent domain'), h('p', { class: 'empty' }, 'plan.json names no project, so there is no domain to read.'));
  const s = sessionFor(domainKey);
  const e = ctx.sample ? sampleEndpoints(domainKey) : s.endpoints;
  return h('section', { class: 'agent-domain' },
    h('h2', {}, `Agent domain: ${domainKey}`),
    h('p', { class: 'muted' }, `Six panels read live from the portal. Unlike the other tabs, nothing here comes from the .colaberry files, so the "Data as of" stamp in the header does not apply; each panel shows when it loaded. Platform rules read at commit ${PLATFORM_COMMIT}.`),
    ctx.sample ? h('p', { class: 'ad-state ad-state-sample' }, 'Sample mode: these are made-up endpoint responses. Switch to Real to load your own.') : connectForm(s),
    h('div', { class: 'ad-panels' },
      employeePanel(e, domainKey, ctx.sample), inventoryPanel(e, ctx.sample), ladderPanel(e, domainKey, ctx.sample),
      behaviourPanel(e, ctx.sample), governancePanel(e, ctx.sample), gapsPanel(e, domainKey, ctx.sample)));
}
