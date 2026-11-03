// The autonomy ladder and effectiveAuthority(), ported line for line from the platform:
//   ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator @ 92d103b
//   backend/src/services/agentDomain/autonomyLadder.ts
//     AUTONOMY_MEANINGS   :58-69   (the owner's words, verbatim)
//     effectiveAuthority  :185-223
// Re-read that file before changing anything here; tests/agentDomain.test.mjs pins the behaviour.

export const PLATFORM_COMMIT = '92d103b';
export const LADDER_SOURCE = `autonomyLadder.ts:58-69 at platform commit ${PLATFORM_COMMIT}`;
export const AUTHORITY_SOURCE = `effectiveAuthority() in autonomyLadder.ts:185-223 at platform commit ${PLATFORM_COMMIT}`;

export const RUNGS = Object.freeze([
  ['autonomy:R0', 'Define the workflow, requirements, risks and human decisions.'],
  ['autonomy:R1', 'Prepare isolated development, fixtures and baseline tests.'],
  ['autonomy:R2', 'Answer questions using approved knowledge and records.'],
  ['autonomy:R3', 'Perform approved, user-initiated sandbox tool operations.'],
  ['autonomy:R4', 'Execute and verify stateful, multi-step sandbox tasks.'],
  ['autonomy:R5', 'Evaluate in shadow mode against approved reference outcomes.'],
  ['autonomy:R6', 'Conduct a separately approved, supervised production pilot.'],
  ['autonomy:R7', 'Automate only explicitly authorized action classes within limits.'],
  ['autonomy:R8', 'Coordinate necessary, authorized handoffs with other agents.'],
  ['autonomy:R9', 'Demonstrate reliable operation, monitoring, recovery and ownership.'],
].map(([stage, meaning]) => Object.freeze({ stage, meaning })));

const STAGES = RUNGS.map((r) => r.stage);

// Coordinated handoff between agents does not exist in the platform today, so this rung is
// unreachable by fact for every capability (STORY-000 brief, panel 6).
export const UNREACHABLE_BY_FACT = 'autonomy:R8';

export const isAutonomyStage = (v) => typeof v === 'string' && STAGES.includes(v);
export const autonomyIndex = (stage) => STAGES.indexOf(stage);

// input: { capability_id, approved_autonomy, max_permitted_autonomy, granted_tools[],
//          environment: 'sandbox' | 'production', human_decision: boolean }
export function effectiveAuthority(input) {
  const reasons = [];

  if (!isAutonomyStage(input.approved_autonomy)) {
    reasons.push('no_approved_autonomy');
    return { capability_id: input.capability_id, effective_autonomy: null, reasons };
  }

  let level = input.approved_autonomy;

  // A ceiling can only ever LOWER the result.
  if (isAutonomyStage(input.max_permitted_autonomy)
      && autonomyIndex(input.max_permitted_autonomy) < autonomyIndex(level)) {
    level = input.max_permitted_autonomy;
    reasons.push('capped_by_max_permitted');
  }

  // Production is never reached by approval alone: a pilot (R6) is separately approved.
  if (input.environment === 'production' && autonomyIndex(level) >= autonomyIndex('autonomy:R6')) {
    reasons.push('production_requires_separate_pilot_approval');
  }

  // No tool grants means nothing beyond answering from approved knowledge.
  if (input.granted_tools.length === 0 && autonomyIndex(level) > autonomyIndex('autonomy:R2')) {
    level = 'autonomy:R2';
    reasons.push('no_tool_grants');
  }

  // A human-required decision stays human-required at EVERY level. It is never automated.
  if (input.human_decision) {
    reasons.push('human_decision_required_at_every_level');
    if (autonomyIndex(level) > autonomyIndex('autonomy:R5')) {
      level = 'autonomy:R5';
      reasons.push('capped_below_automation_because_human_decision');
    }
  }

  return { capability_id: input.capability_id, effective_autonomy: level, reasons };
}
