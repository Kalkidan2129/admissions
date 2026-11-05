// What the sign-in box says: the mgmt status and the minted session's role and sections, in words.
// It is built from session.access, which never holds a token, so nothing here can print one.
import { NOT_LOADED, LOADING, ERROR } from './session.js';
import { MGMT_STATUS_PATH, MGMT_ENTER_PATH } from './api.js';

// Which admin section each read needs. Shown beside your sections so a 403 on a panel can be read;
// the portal stays the one that decides. All four reads this tab makes need dashboard: -mine and
// change-requests-mine per mgmtSectionGate.ts:126,138 at platform commit a82f731, and the two
// domain-scoped routes under -mine per the platform team. Only the unscoped
// /api/admin/agent-domains/... reads, which this tab no longer makes, need program.
export const SECTION_SOURCE = 'mgmtSectionGate.ts:126,138 at platform commit a82f731, and the platform team for the two domain-scoped routes';
export const sectionFor = (path) => (/^\/api\/admin\/agent-domains\//.test(path) ? 'program' : 'dashboard');

const list = (xs) => (xs.length ? xs.join(', ') : 'none');

export function statusSentence(mgmt) {
  if (!mgmt.is_mgmt) {
    return `GET ${MGMT_STATUS_PATH} says this account is not a management user (is_mgmt false), so the portal is not expected to mint an admin token for it.`;
  }
  const name = mgmt.label ? `"${mgmt.label}" (${mgmt.role})` : mgmt.role ?? 'a role it did not name';
  return `GET ${MGMT_STATUS_PATH} says this account is a management user with the role ${name}, scoped to ${mgmt.sections.length} section${mgmt.sections.length === 1 ? '' : 's'}: ${list(mgmt.sections)}.`;
}

export function accessView(access, paths) {
  if (access.status === NOT_LOADED) {
    return { kind: 'not-loaded', lines: [`Not signed in. Paste your participant token and press Load: the page calls GET ${MGMT_STATUS_PATH}, then POST ${MGMT_ENTER_PATH}.`] };
  }
  const lines = access.mgmt ? [statusSentence(access.mgmt)] : [];
  if (access.status === LOADING) {
    lines.push(access.step === 'status' ? `Checking GET ${MGMT_STATUS_PATH}…` : `Asking POST ${MGMT_ENTER_PATH} for an admin token…`);
    return { kind: 'loading', lines };
  }
  if (access.status === ERROR) {
    const where = access.mgmt ? `POST ${MGMT_ENTER_PATH}` : `GET ${MGMT_STATUS_PATH}`;
    const err = access.error;
    lines.push(err?.status === 403 && access.mgmt
      ? `The admin-token mint was refused. ${where} answered HTTP 403 with this exact body, which you can send to the platform team: ${err.body}`
      : `Sign-in stopped at ${where}. ${err?.message ?? 'No error was given.'}`);
    return { kind: 'error', lines };
  }
  const { role, sections } = access.entered;
  lines.push(`Admin session opened by POST ${MGMT_ENTER_PATH}: role ${role}, sections: ${list(sections)}. The admin token is held in this page's memory only and is not shown.`);
  if (access.remints) lines.push(`An /api/admin read answered HTTP 401, so a new admin token was minted ${access.remints === 1 ? 'once' : `${access.remints} times`}.`);
  const missing = [...new Set(Object.values(paths).map(sectionFor))].filter((s) => !sections.includes(s));
  const needs = Object.values(paths).map((p) => `GET ${p} needs ${sectionFor(p)}`).join('; ');
  lines.push(missing.length
    ? `Your sections do not include ${list(missing)}, so expect HTTP 403 on the panels that need it (${needs}; source: ${SECTION_SOURCE}).`
    : `Your sections cover every read on this tab (${needs}; source: ${SECTION_SOURCE}).`);
  return { kind: 'ok', lines };
}
