# admissions.CAP.decision_notification_delivery — Applicant decision notification delivery

An applicant hears their outcome once, in approved words, with no internal reviewer note or model reasoning ever reaching them.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- sending requires the default-denied live_email capability (executionPolicy.ts:27); it is recorded here as a blocker and deliberately not listed in required_tools, in any environment
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Applicant decision notification delivery
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.decision_notification_delivery`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
An applicant hears their outcome once, in approved words, with no internal reviewer note or model reasoning ever reaching them.
Intended users: prospective_applicant, application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Check the kill switch first and skip if active
- Render from the reason code and the applicant-facing message only
- Claim an idempotency key of internship-<template>-<applicationId>, which is deliberately timestamp-free
- Send through the guarded mail path
**Inputs**
- the recorded decision
- the reason code
- the applicant-facing student_message
- any conditions
**Outputs**
- one delivered notification
- an email_send_ledger entry
**Exceptions that must be handled**
- Kill switch active: skip with reason kill_switch_active, which is a successful outcome and not a failure
- Duplicate send attempt: the ledger's unique index on the idempotency key refuses it, which is how a re-run cannot double-notify an applicant
- Reviewer notes or ai_factors: structurally unreachable, because renderDecisionEmail takes no parameter for them
- Transport failure: the decision is already recorded, so the notification is retried rather than the decision being re-made
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_email_send_ledger
- render_email_template_preview
**Application surfaces**
- POST /api/admin/internship/applications/:id/decide (internshipRoutes.ts:650), which calls this as a later step
**Source modules**
- backend/src/services/internship/internshipEmails.ts
- backend/src/services/internship/internshipReasonCodes.ts
- backend/src/services/email/idempotentSend.ts
- backend/src/services/emailService.ts
**Dependencies**
- admissions.admission_decision_recording
- Mandrill
- email_send_ledger
- launchSafety kill switch
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Telling a person they were rejected is the single least reversible thing in this domain. Sending it requires the default-denied live_email capability (executionPolicy.ts:27), so the agent may render and preview in sandbox (autonomy:R4) and nothing more. It is marked human_decision because the decision the message conveys is a human decision and the send is its irrevocable publication.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the five templates, the reason-code wall and the idempotency key.

Acceptance: The document states that reviewer_notes and ai_factors are structurally excluded and names the idempotency key shape.
## Before you start
- sending requires the default-denied live_email capability (executionPolicy.ts:27); it is recorded here as a blocker and deliberately not listed in required_tools, in any environment
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/internship/internshipEmails.ts:210 (sendDecisionEmail)
- backend/src/services/internship/internshipEmails.ts:250 (guardedSendMail call)
- backend/src/services/internship/internshipEmails.ts:224-225 (kill switch checked first, returns skipped)
- backend/src/services/internship/internshipEmails.ts:237-241 (sendOnce with a timestamp-free business event id)
- backend/src/services/internship/internshipEmails.ts:22-29 (renderDecisionEmail has no parameter for reviewer notes, AI recommendation or factors)
- backend/src/services/internship/internshipEmails.ts:43 (FROM is hardcoded)
- backend/src/services/internship/internshipEmails.ts:33-39 (TEMPLATE_VERSIONS, five templates)
- backend/src/services/internship/internshipReasonCodes.ts:245 (buildStudentFacingReason)
- backend/src/services/emailService.ts:43 (guardedSendMail)
- backend/src/services/emailService.ts:13-31 (Mandrill SMTP relay transport)
- backend/src/db/ensureEmailSendLedgerSchema.ts:42 (email_send_ledger)
- backend/src/services/launchSafety.ts:124 (isKillSwitchActive)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document states that reviewer_notes and ai_factors are structurally excluded and names the idempotency key shape.

When every box above is ticked, stop and show the demo.
