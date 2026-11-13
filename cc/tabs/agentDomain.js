// Agent domain: the six STORY-000 panels, read live from the portal's /api/admin endpoints, and
// panel 7, which files a change request (the Command Center's one write besides sign-in).
// The builder pastes a participant token; session.js exchanges it for an admin token through
// /api/portal/mgmt/status and /enter. Both tokens are held in session.js memory only.
// In Sample mode the panels show the made-up responses in agentDomain/fixtures.js instead.
import { h } from '../dom.js';
import { sharedSession } from '../agentDomain/sharedSession.js';
import { normaliseBaseUrl, DEFAULT_PORTAL } from '../agentDomain/api.js';
import { accessView } from '../agentDomain/access.js';
import { sampleEndpoints } from '../agentDomain/fixtures.js';
import { filePanel } from '../agentDomain/filePanel.js';
import { PLATFORM_COMMIT } from '../agentDomain/authority.js';
import {
  employeePanel, inventoryPanel, ladderPanel, behaviourPanel, governancePanel, gapsPanel,
} from '../agentDomain/panels.js';

let rerender = () => {};
let formError = null;

function connectForm(s) {
  const base = h('input', { type: 'url', name: 'portal', required: true, placeholder: DEFAULT_PORTAL, value: s.baseUrl ?? DEFAULT_PORTAL,
    autocomplete: 'url', 'aria-label': 'Portal base URL' });
  const token = h('input', { type: 'password', name: 'token', required: true, autocomplete: 'off', spellcheck: 'false',
    'aria-label': 'Participant token', placeholder: s.hasToken ? 'Held in memory. Paste again to replace.' : 'Paste your participant_token' });
  // method="dialog" and preventDefault: the browser must never turn this form into a URL.
  const form = h('form', { class: 'ad-connect', method: 'dialog', onsubmit: (ev) => {
    ev.preventDefault();
    let url;
    try { url = normaliseBaseUrl(base.value); } catch (err) { formError = err.message; rerender(); return; }
    const value = token.value.trim();
    token.value = '';
    if (!value) { formError = 'Enter your participant token.'; rerender(); return; }
    formError = null;
    s.connect(url, value).catch((err) => { formError = err.message; rerender(); });
  } },
  h('label', {}, 'Portal base URL ', base),
  h('label', {}, 'Participant token ', token),
  h('button', { type: 'submit' }, s.hasToken ? 'Reload' : 'Load'),
  s.hasToken ? h('button', { type: 'button', class: 'secondary', onclick: () => s.forget() }, 'Forget token') : null);
  const signIn = accessView(s.access, s.paths);
  return h('div', { class: 'ad-connect-box' }, form,
    formError ? h('p', { class: 'ad-state ad-state-error', role: 'alert' }, formError) : null,
    h('div', { class: `ad-state ad-state-${signIn.kind} ad-access`, role: 'status' }, signIn.lines.map((line) => h('p', {}, line))),
    h('p', { class: 'muted' }, s.hasToken
      ? `Your participant token and the admin token minted from it are held in this page's memory only. Neither is saved anywhere; reloading the page or "Forget token" drops both.`
      : `The participant token, and the admin token the portal mints from it, are kept in this page's memory only: never saved to a file, the browser's storage, a cookie or a commit, and never put in the address bar or an error message.`));
}

export function renderAgentDomain(ctx) {
  rerender = ctx.rerender;
  const domainKey = ctx.data.plan.project?.name;
  if (!domainKey) return h('section', {}, h('h2', {}, 'Agent domain'), h('p', { class: 'empty' }, 'plan.json names no project, so there is no domain to read.'));
  const s = sharedSession(domainKey, ctx.rerender);
  const e = ctx.sample ? sampleEndpoints(domainKey) : s.endpoints;
  return h('section', { class: 'agent-domain' },
    h('h2', {}, `Agent domain: ${domainKey}`),
    h('p', { class: 'muted' }, `Six panels read live from the portal; panel 7 files a change request, only when you press File it. Unlike the other tabs, nothing here comes from the .colaberry files, so the "Data as of" stamp in the header does not apply; each panel shows when it loaded. Platform rules read at commit ${PLATFORM_COMMIT}.`),
    ctx.sample ? h('p', { class: 'ad-state ad-state-sample' }, 'Sample mode: these are made-up endpoint responses. Switch to Real to load your own.') : connectForm(s),
    h('div', { class: 'ad-panels' },
      employeePanel(e, domainKey, ctx.sample), inventoryPanel(e, ctx.sample), ladderPanel(e, domainKey, ctx.sample),
      behaviourPanel(e, ctx.sample), governancePanel(e, ctx.sample), gapsPanel(e, domainKey, ctx.sample),
      filePanel(s, ctx.sample, ctx.rerender)));
}
