# admissions.CAP.admission_decision_recording — Admission decision recording

Every accept, reject, waitlist or information request is recorded against a named human with a reason code, so an applicant's outcome is explainable months later and the decision is attributable to a person.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the accountable human for this domain cannot witness or audit these decisions on any surface today
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested: AI_INTERNSHIP_SPEC.md:186-198 names Dhee as the approver, not Taiwo
- the decision verb is permanently outside any agent grant; this is a structural ceiling, not a pending approval

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admission decision recording
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.admission_decision_recording`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
Every accept, reject, waitlist or information request is recorded against a named human with a reason code, so an applicant's outcome is explainable months later and the decision is attributable to a person.
Intended users: application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Validate the reason code against the closed list (internshipReasonCodes.ts:194)
- Assert the transition is legal for the reviewer actor (internshipStateMachine.ts:282)
- Write the internship_decisions row with decided_by set from the session, never from the request body
- Request the applicant notification as a separate step
**Inputs**
- the reviewer's authenticated identity
- one of the six decision verbs
- a reason code
- an applicant-facing message
- optional conditions
**Outputs**
- an internship_decisions row
- a state transition
- a notification request
**Exceptions that must be handled**
- Transition illegal for this state: InvalidInternshipTransitionError with error_class 'ContractViolation' (internshipStateMachine.ts:245-246)
- Reason code requires a custom message and none supplied: refuse (internshipReasonCodes.ts:210)
- Caller is the system actor: structurally cannot reach approved, rejected or waitlisted, because those edges list only the reviewer actor
- A model or tool failure must never advance an approved stage (approval-and-change-policy.md section 3)
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
**Application surfaces**
- /admin/internship?view=apps
- frontend/src/pages/admin/internship/tabDecide.tsx
- POST /api/admin/internship/applications/:id/decide (internshipRoutes.ts:650)
**Source modules**
- backend/src/services/internship/internshipDecisionService.ts
- backend/src/services/internship/internshipStateMachine.ts
- backend/src/services/internship/internshipReasonCodes.ts
- backend/src/models/InternshipDecision.ts
**Dependencies**
- internshipStateMachine.ts
- internshipReasonCodes.ts
- admissions.decision_notification_delivery
- an authenticated human reviewer
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: An admission decision is always a human decision. The platform already enforces this structurally rather than by policy: internshipStateMachine.ts:155 and :170 list only the reviewer actor on every edge into approved, rejected and waitlisted, and canTransition at :264-279 deliberately takes no override, force or isAdmin parameter, so there is no argument an agent could pass to make itself a reviewer. The agent's ceiling is therefore autonomy:R2, answering questions about decisions already recorded. It may prepare a decision packet under admissions.reviewer_decision_packet_assembly; it may never make, advance or self-approve a decision at any autonomy level, including autonomy:R9.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the six decision verbs, the reviewer-only edges and the reason-code contract, and records the decision as a human decision.

Acceptance: The document enumerates every reviewer-only edge in internshipStateMachine.ts:155, :163, :170, :191 and names the human accountable for each.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the accountable human for this domain cannot witness or audit these decisions on any surface today
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested: AI_INTERNSHIP_SPEC.md:186-198 names Dhee as the approver, not Taiwo
- the decision verb is permanently outside any agent grant; this is a structural ceiling, not a pending approval
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/routes/admin/internshipRoutes.ts:650 (POST /api/admin/internship/applications/:id/decide)
- backend/src/routes/admin/internshipRoutes.ts:71-87 (decideSchema, six verbs)
- backend/src/routes/admin/internshipRoutes.ts:49-55 (why there is deliberately no generic PATCH state)
- backend/src/services/internship/internshipDecisionService.ts:96 (decide)
- backend/src/services/internship/internshipStateMachine.ts:155 (under_review transitions, reviewer actor only)
- backend/src/services/internship/internshipStateMachine.ts:170 (waitlisted transitions, reviewer actor only)
- backend/src/services/internship/internshipStateMachine.ts:20-29 (the human gate is an actor, not a comment)
- backend/src/services/internship/internshipStateMachine.ts:264-279 (canTransition has no override, force or isAdmin parameter)
- backend/src/services/internship/internshipStateMachine.ts:307-314 (REVIEWER_DECISIONS)
- backend/src/services/internship/internshipReasonCodes.ts:63-191 (REASON_DEFINITIONS)
- backend/src/models/InternshipDecision.ts:64 (decided_by)
- backend/src/models/InternshipDecision.ts:72 (tableName 'internship_decisions')
- docs/project-lifecycle/approval-and-change-policy.md (an AI identity never populates a product approval)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document enumerates every reviewer-only edge in internshipStateMachine.ts:155, :163, :170, :191 and names the human accountable for each.

When every box above is ticked, stop and show the demo.
