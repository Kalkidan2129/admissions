# admissions.CAP.applicant_lifecycle_audit_trail — Applicant lifecycle audit trail

For any applicant, anyone authorised can reconstruct what happened, in what order, and who caused it, which is what makes an admissions outcome defensible rather than merely recorded.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- internship_status_events.reason is free text (InternshipStatusEvent.ts:49) and no rule constrains what a reviewer may write there, so whether the trail carries applicant PII beyond the application reference is unknown
- domain ownership is contested between the admissions and internship domains

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Applicant lifecycle audit trail
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.applicant_lifecycle_audit_trail`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
For any applicant, anyone authorised can reconstruct what happened, in what order, and who caused it, which is what makes an admissions outcome defensible rather than merely recorded.
Intended users: application_reviewer, admissions_operations, compliance_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read the status events for the application in order
- Join the decision records
- Present the timeline with actor_type and actor_id on every event
- Follow the correlation_id across services when a single action spans several
**Inputs**
- internship_status_events rows
- internship_decisions rows
**Outputs**
- an ordered activity timeline per application
- an actor attribution per event
**Exceptions that must be handled**
- A transition with no event row: report the gap, because a silent transition is the failure this trail exists to catch
- actor_type system on an edge that should be reviewer-only: report it as an anomaly rather than normalising it
- A correlation_id that does not resolve end to end: the observability is incomplete and must be stated as such
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_status_event_audit
**Application surfaces**
- /admin/internship?view=apps
- frontend/src/pages/admin/internship/tabActivity.tsx
- GET /api/admin/internship/applications/:id/activity (internshipRoutes.ts:356)
**Source modules**
- backend/src/models/InternshipStatusEvent.ts
- backend/src/services/internship/internshipApplicationService.ts
- backend/src/services/internship/internshipDecisionService.ts
**Dependencies**
- internship_status_events table
- internship_decisions table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R6**.
Why that ceiling: This is a read-only reconstruction that changes nothing, which argues for a high ceiling. It stops at a supervised production pilot (autonomy:R6) rather than autonomy:R7 for one reason: the trail is the evidence base for an admissions outcome, and an agent that reads it unattended should be doing so under a named human's supervision until the free-text reason column is proven not to carry applicant PII that a summary could re-expose.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'what happened to this application and who did it' from the event rows.

Acceptance: Every answer cites an event row with its actor_type and actor_id; no answer asserts an event absent from the table.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- internship_status_events.reason is free text (InternshipStatusEvent.ts:49) and no rule constrains what a reviewer may write there, so whether the trail carries applicant PII beyond the application reference is unknown
- domain ownership is contested between the admissions and internship domains
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/models/InternshipStatusEvent.ts:47 (actor_type)
- backend/src/models/InternshipStatusEvent.ts:48 (actor_id)
- backend/src/models/InternshipStatusEvent.ts:49 (reason)
- backend/src/models/InternshipStatusEvent.ts:51 (correlation_id)
- backend/src/models/InternshipStatusEvent.ts:56 (tableName 'internship_status_events')
- backend/src/routes/admin/internshipRoutes.ts:356 (GET /api/admin/internship/applications/:id/activity)
- backend/src/services/internship/internshipApplicationService.ts:55 (transition)
- backend/src/services/internship/internshipDecisionService.ts:265 (decisionHistory)
- backend/src/models/InternshipApplication.ts:73 (correlation_id)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every answer cites an event row with its actor_type and actor_id; no answer asserts an event absent from the table.

When every box above is ticked, stop and show the demo.
