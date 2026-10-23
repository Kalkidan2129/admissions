# admissions.CAP.intern_activation — Intern activation

A new intern starts with their access, cohort membership and first-week checklist correct on day one, and nobody is activated before the gates that precede activation have actually been satisfied.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the execution contract for this programme forbids activation outright (execution-contract.md:117-119), so no story may claim it
- domain ownership is contested between the admissions and internship domains

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Intern activation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.intern_activation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
A new intern starts with their access, cohort membership and first-week checklist correct on day one, and nobody is activated before the gates that precede activation have actually been satisfied.
Intended users: application_reviewer, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Compute activation blockers from the checklist
- Refuse while any blocker stands
- Create the cohort membership, not a second enrollment
- Transition to active
**Inputs**
- the application at activation_pending
- the onboarding checklist evidence
- the target cohort
**Outputs**
- an active intern with cohort membership
- a resolved first-week checklist
**Exceptions that must be handled**
- A blocker outstanding: refuse, because activation is what grants paid access
- Activation run twice: the unique index on (enrollment_id, cohort_id, membership_type) where status is active is the idempotency guarantee
- A person legitimately holding both a class enrollment and an internship: AI_INTERNSHIP_SPEC.md:192-194 permits two active enrollments, so a duplicate-collapsing routine must not silently hide one
- INTENDED_INTERN_ROSTER_2026-10-07.md:24-25: Ruth Kumera must not be activated and no onboarding requirement of hers may be bypassed
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_enrollment_records
**Application surfaces**
- /admin/internship?view=apps
- /portal/internship
- frontend/src/pages/portal/internship/InternshipOnboarding.tsx
- POST /api/admin/internship/applications/:id/activate (internshipRoutes.ts:847)
- GET /api/portal/internship/onboarding (participantRoutes.ts:362)
**Source modules**
- backend/src/services/internship/internshipActivationService.ts
- backend/src/services/internship/internshipOnboarding.ts
- backend/src/services/internship/internshipStateMachine.ts
**Dependencies**
- admissions.signed_document_verification
- internshipOnboarding.ts
- cohort membership
- enrollments table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Activation is the moment an applicant becomes a person with paid programme access, which is the advancement of an admission. It is therefore a human decision and the agent's ceiling is computing blockers against sandbox fixtures (autonomy:R4). An agent may never activate anyone, and it may never mark an onboarding requirement satisfied on an applicant's behalf.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the nine checklist steps, their actors and the activation blockers.

Acceptance: Every step in internshipOnboarding.ts:58-145 is listed with its declared actor, and activation is recorded as a human decision.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the execution contract for this programme forbids activation outright (execution-contract.md:117-119), so no story may claim it
- domain ownership is contested between the admissions and internship domains
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/routes/admin/internshipRoutes.ts:847 (POST /api/admin/internship/applications/:id/activate)
- backend/src/routes/admin/internshipRoutes.ts:823 (GET /api/admin/internship/applications/:id/onboarding)
- backend/src/services/internship/internshipActivationService.ts:135 (activate)
- backend/src/services/internship/internshipActivationService.ts:88 (advanceAfterDocumentsVerified)
- backend/src/services/internship/internshipActivationService.ts:29 (does not create a second enrollment)
- backend/src/services/internship/internshipActivationService.ts:130 (unique index on enrollment_id, cohort_id, membership_type where status is active)
- backend/src/services/internship/internshipOnboarding.ts:58-145 (CHECKLIST, nine steps each declaring its actor)
- backend/src/services/internship/internshipOnboarding.ts:224 (activationBlockers)
- backend/src/services/internship/internshipStateMachine.ts:215 (activation_pending to active)
- backend/src/routes/participantRoutes.ts:359-361 (there is no participant route that activates anyone)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every step in internshipOnboarding.ts:58-145 is listed with its declared actor, and activation is recorded as a human decision.

When every box above is ticked, stop and show the demo.
