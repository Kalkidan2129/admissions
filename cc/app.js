// Shell: header ("Data as of" stamp, sample/real switch), tab bar and hash routing.
// Routes are #/<tab> and #/<tab>/<detail>. Tab labels are page structure; every
// value shown inside a tab comes from the loaded data.
import { h } from './dom.js';
import { loadRealData } from './data.js';
import { sampleData } from './sample.js';
import { dataAge, formatCentral, relativeAge, todayCentral } from './time.js';
import { renderOverview } from './tabs/overview.js';
import { renderOutcomes } from './tabs/outcomes.js';
import { renderUsers } from './tabs/users.js';
import { renderGuardrails } from './tabs/guardrails.js';
import { renderSystems } from './tabs/systems.js';
import { renderProject } from './tabs/project.js';
import { renderAgents } from './tabs/agents.js';
import { renderKnowledge } from './tabs/knowledge.js';
import { renderDataModel } from './tabs/datamodel.js';
import { renderAgentDomain } from './tabs/agentDomain.js';

const TABS = [
  { key: 'overview', label: 'Overview', render: renderOverview },
  { key: 'outcomes', label: 'Outcomes', render: renderOutcomes },
  { key: 'users', label: 'Users and use case', render: renderUsers },
  { key: 'guardrails', label: 'Guardrails', render: renderGuardrails },
  { key: 'systems', label: 'Systems', render: renderSystems },
  { key: 'project', label: 'Project management', render: renderProject },
  { key: 'agents', label: 'AI agents', render: renderAgents },
  { key: 'knowledge', label: 'Knowledge base', render: renderKnowledge },
  { key: 'datamodel', label: 'Data model', render: renderDataModel },
  { key: 'agentdomain', label: 'Agent domain', render: renderAgentDomain },
];

const MODE_KEY = 'cc-mode';
const state = { mode: 'real', real: null, error: null };

// The remembered mode is a convenience only; the page works without storage.
function readMode() {
  try { return localStorage.getItem(MODE_KEY) === 'sample' ? 'sample' : 'real'; }
  catch (err) { console.warn('cc: mode not remembered, storage unavailable:', err.message); return 'real'; }
}
function saveMode(mode) {
  try { localStorage.setItem(MODE_KEY, mode); }
  catch (err) { console.warn('cc: mode not remembered, storage unavailable:', err.message); }
}

function route() {
  const [tab = 'overview', ...rest] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { tab: TABS.some((t) => t.key === tab) ? tab : 'overview', detail: rest.length ? rest.join('/') : null };
}

function stamp(manifest, sample) {
  const age = dataAge(manifest?.generated_at);
  if (age.level === 'unknown') {
    return h('p', { class: 'stamp stamp-stale', role: 'status' },
      'Data age unknown: manifest.json has no readable generated_at. Sync from the portal to refresh.');
  }
  const text = `${sample ? 'Sample data as of' : 'Data as of'} ${formatCentral(age.at)} (${relativeAge(age.ms)})`;
  if (age.level === 'stale') {
    return h('p', { class: 'stamp stamp-stale', role: 'status' },
      h('strong', {}, 'Warning: this data is over a week old. '), `${text}. Sync from the portal to refresh.`);
  }
  return h('p', { class: `stamp stamp-${age.level}` }, text,
    age.level === 'aging' ? '. Sync from the portal if you expect newer data.' : '');
}

function modeSwitch() {
  const button = (mode, label) => h('button', {
    type: 'button', 'aria-pressed': String(state.mode === mode),
    onclick: () => { state.mode = mode; saveMode(mode); render(); },
  }, label);
  return h('div', { class: 'mode-switch', role: 'group', 'aria-label': 'Data mode' },
    button('real', 'Real'), button('sample', 'Sample'));
}

function errorView(err) {
  return h('section', { class: 'error', role: 'alert' },
    h('h2', {}, 'The Command Center could not load its data'),
    h('p', {}, err.message),
    h('p', {}, 'If you opened index.html straight from the file system, the browser blocks these reads. Start a local web server in the repo folder (python -m http.server 8000) and open http://localhost:8000/ instead.'));
}

function render() {
  const { tab, detail } = route();
  const sample = state.mode === 'sample';
  const data = sample ? sampleData() : state.real;
  const root = document.getElementById('app');

  const header = h('header', { class: 'top' },
    h('div', { class: 'brand' },
      h('h1', {}, data?.plan?.project?.name ? `${data.plan.project.name} · Command Center` : 'Command Center'),
      data ? stamp(data.manifest, sample) : null),
    modeSwitch());
  const banner = sample ? h('div', { class: 'sample-banner', role: 'status' },
    h('strong', {}, 'SAMPLE DATA. '), 'Everything on this screen is made up to show the layout. It is not your project. Switch to Real before you demo.') : null;
  const nav = h('nav', { class: 'tabs', 'aria-label': 'Command Center tabs' },
    TABS.map((t) => h('a', { href: `#/${t.key}`, 'aria-current': t.key === tab ? 'page' : null }, t.label)));

  let body;
  if (!sample && state.error) body = errorView(state.error);
  else if (!data) body = h('p', {}, 'Loading .colaberry files…');
  else {
    const current = TABS.find((t) => t.key === tab);
    const ctx = { data, sample, today: todayCentral(), rerender: render };
    body = current.render(ctx, detail);
  }

  root.replaceChildren(header, banner ?? '', nav, h('main', { class: sample ? 'is-sample' : '' }, body));
  document.title = `${TABS.find((t) => t.key === tab).label} · Command Center`;
}

async function start() {
  state.mode = readMode();
  window.addEventListener('hashchange', render);
  render();
  try {
    state.real = await loadRealData();
  } catch (err) {
    console.error('cc: data load failed:', err);
    state.error = err;
  }
  render();
}

start();
