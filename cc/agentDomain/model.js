// Pure view-models for the six panels: what each panel says, decided without touching the DOM so
// the rules are testable. Every value comes from an endpoint response; anything the endpoints do
// not return is named as missing, never filled in.
import { NOT_LOADED, LOADING, ERROR } from './session.js';
import { RUNGS, UNREACHABLE_BY_FACT, autonomyIndex, isAutonomyStage, effectiveAuthority } from './authority.js';

export const get = (path) => `GET ${path}`;

// Fields the brief asks for that no endpoint returns at platform commit 92d103b. Panels name
// them as missing rather than leaving a blank that reads like a bug.
export const NOT_RETURNED = Object.freeze({
  classification: 'not returned by /agent-domains/:key or /coverage',
  starting_autonomy: 'not returned by /agent-domains/:key or /coverage',
  human_decision: 'not returned by /agent-domains/:key or /coverage',
  release_behaviour: 'not returned by /agent-domains/:key or /coverage',
  ceiling_reason: 'not returned by /agent-domains/:key or /coverage',
});

// The state of a panel built from one or more endpoints. "not loaded" (no token yet) and
// "loading" and "error" are each worded and styled differently from an endpoint that answered
// with nothing, which the panel decides itself once every endpoint is ok.
export function panelStatus(states) {
  const paths = states.map((s) => get(s.path)).join(' and ');
  if (states.some((s) => s.status === NOT_LOADED)) {
    return { kind: 'not-loaded', message: `Not loaded yet. Enter the portal address and your admin token above; this panel then reads ${paths}.` };
  }
  if (states.some((s) => s.status === LOADING)) return { kind: 'loading', message: `Loading ${paths}…` };
  const failed = states.find((s) => s.status === ERROR);
  if (failed) return { kind: 'error', message: `Could not read ${get(failed.path)}. ${failed.error.message}` };
  return { kind: 'ok', message: null };
}

export const emptyMessage = (state, what) => `${get(state.path)} answered (HTTP ${state.httpStatus}) and returned ${what}.`;

export function validationLabel(state) {
  if (state === 'draft') return 'Draft: not agreed by anyone yet';
  return state ?? 'not in the response';
}

// Panel 1. `domains` rows carry the agent's own fields (ProvisionedDomainRow, 92d103b).
export function employeeView(mine, domainKey) {
  const row = (mine.data?.domains ?? []).find((d) => d.domain_key === domainKey);
  if (!row) {
    return { kind: 'empty', message: `${emptyMessage(mine, `no ${domainKey} domain for your login`)} ${mine.data?.note ?? ''}`.trim() };
  }
  if (!row.agent_id) {
    return { kind: 'no-agent', message: `No agent: the ${domainKey} domain has no AI employee linked to it yet. This is what the endpoint returned, not a page still fetching.` };
  }
  const setBy = (mine.data?.not_recorded ?? []).find((n) => n.field === 'agent.autonomy_level_set_by');
  const tools = row.agent_tools_granted ?? [];
  return {
    kind: 'ok',
    fields: [
      ['Agent name', row.agent_display_name ?? 'Not named yet (agent_display_name is null)'],
      ['Agent id', row.agent_id],
      ['Enabled', row.agent_enabled === null || row.agent_enabled === undefined ? 'not in the response' : (row.agent_enabled ? 'Yes' : 'No')],
      ['Autonomy level', row.agent_autonomy_level
        ? `${row.agent_autonomy_level} (the agent-level scale observe / suggest / act_audited / communicate; not a rung on the R0 to R9 ladder)`
        : 'not in the response'],
      ['Tools granted', `${row.agent_tools_granted_count ?? tools.length}${tools.length ? `: ${tools.join(', ')}` : ''}`],
      ['Autonomy level last set', row.agent_autonomy_level_set_at ?? 'not in the response'],
      ['Set how', row.agent_autonomy_level_source ?? 'not in the response'],
      ['Set by', setBy ? `Not recorded by the platform. ${setBy.reason}` : 'not in the response'],
    ],
    setAt: row.agent_autonomy_level_set_at ?? null,
    tools,
  };
}

// Panel 3. Authority per capability, from effectiveAuthority(). The approved level is the
// coverage row's `effective_authority`, which the platform resolves from recorded approvals only
// (null when nobody approved one). `human_decision` is not returned, so it is passed as true, the
// more restrictive reading, and labelled as such.
export function authorityRows(coverageRows, grantedTools) {
  return coverageRows.map((r) => {
    const result = effectiveAuthority({
      capability_id: r.capability_id,
      approved_autonomy: r.effective_authority ?? null,
      max_permitted_autonomy: r.target_autonomy,
      granted_tools: grantedTools,
      environment: 'sandbox',
      human_decision: true,
    });
    return { id: r.capability_id, name: r.capability_name, ceiling: isAutonomyStage(r.target_autonomy) ? r.target_autonomy : null,
      approved: r.effective_authority ?? null, effective: result.effective_autonomy, reasons: result.reasons };
  });
}

export function noToolGrantsSummary(rows) {
  const constrained = rows.filter((r) => r.reasons.includes('no_tool_grants')).length;
  if (constrained > 0) {
    return { count: constrained, sentence: `The no_tool_grants rule currently constrains ${constrained} of ${rows.length} capabilities: each is held at autonomy:R2 because the agent has no granted tools.` };
  }
  const unapproved = rows.filter((r) => r.reasons.includes('no_approved_autonomy')).length;
  return { count: 0, sentence: `The no_tool_grants rule currently constrains zero capabilities. The rule is in force, but it only lowers a capability approved above autonomy:R2, and none of these ${rows.length} is: ${unapproved} have no approved level at all.` };
}

// One cell of the ladder grid for a capability at a rung.
export function ladderCell(rungStage, row) {
  const i = autonomyIndex(rungStage);
  const tags = [];
  if (row.effective && autonomyIndex(row.effective) === i) tags.push('effective');
  if (row.ceiling && autonomyIndex(row.ceiling) === i) tags.push('ceiling');
  if (rungStage === UNREACHABLE_BY_FACT) tags.push('unreachable-fact');
  else if (row.ceiling && i > autonomyIndex(row.ceiling)) tags.push('unreachable');
  else if (!row.ceiling) tags.push('unknown');
  return tags;
}

export const TOOL_REQUEST_DISCLOSURE = 'A tool request asks a human for a tool. Filing one grants nothing, and its status records only what a named human decided. The tools the agent actually holds are the ones listed in panel 1.';

export function governanceView(rows) {
  const line = (r) => ({
    title: r.title,
    status: r.status === 'pending' ? 'Pending: nobody has decided yet' : r.status,
    proposedBy: r.requested_by_identity ?? 'not in the response',
    proposedAt: r.requested_at,
    decidedBy: r.approved_by_identity ?? (r.status === 'pending' ? 'nobody yet' : 'not in the response'),
    decidedAt: r.approved_at,
    declinedReason: r.declined_reason,
  });
  return {
    changes: rows.filter((r) => r.kind !== 'tool').map(line),
    tools: rows.filter((r) => r.kind === 'tool').map(line),
  };
}

// Panel 6. Each gap carries where it was established.
export function gapsView(coverage, mineView) {
  const gaps = [{ text: `${UNREACHABLE_BY_FACT} (${RUNGS[8].meaning}) is unreachable by fact, not by choice: coordinated handoff between two agents does not exist in this platform today. No capability can reach it, whatever its ceiling.`, source: 'the STORY-000 brief' }];
  if (coverage.status === 'ok') {
    const rows = coverage.data?.rows ?? [];
    const draft = rows.filter((r) => r.validation_state === 'draft').length;
    gaps.push({ text: `${draft} of ${rows.length} capabilities are draft: their requirements have not been agreed by anyone.`, source: get(coverage.path) });
  } else {
    gaps.push({ text: 'How many capabilities are draft: not known until the coverage endpoint loads.', source: get(coverage.path) });
  }
  gaps.push({ text: 'Which capabilities have an empty release_behaviour[] (no defined next rung): this page cannot tell, because release_behaviour[] is not returned by either capability endpoint.', source: get(coverage.path) });
  gaps.push({ text: `Not sourced from any endpoint, so left blank and labelled on this page: ${Object.keys(NOT_RETURNED).join(', ')}.`, source: 'platform commit 92d103b' });
  if (mineView?.kind === 'no-agent') gaps.push({ text: 'There is no AI employee for this domain yet, so no rung is held by an agent.', source: 'GET /api/admin/agent-domains-mine' });
  gaps.push({ text: 'Finishing work does not promote anything: a story marked complete, elapsed time, a conversation that went well or a mocked test passing never raises autonomy. A named human promotes, one rung at a time, on evidence.', source: 'NON_PROMOTING_SIGNALS, promotionCriteria.ts:79-84 at platform commit 92d103b' });
  return gaps;
}
