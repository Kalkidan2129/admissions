# admissions.CAP.ai_voice_interview_dispatch — AI voice interview dispatch

An applicant who prefers to talk can complete the interview by phone, with the call placed only on their recorded permission and never twice.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- outbound voice contact with an applicant is an external side effect that no agent grant in this matrix includes; it is recorded here as a blocker rather than as a required tool, for the same reason outbound mail is default-denied as live_email (executionPolicy.ts:27)
- whether POST /api/webhook/synthflow/call-complete verifies a provider signature is unknown; the controller's verification path was not read
- domain ownership is contested between the admissions and internship domains

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# AI voice interview dispatch
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.ai_voice_interview_dispatch`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
An applicant who prefers to talk can complete the interview by phone, with the call placed only on their recorded permission and never twice.
Intended users: prospective_applicant, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Check permission_to_call, permission_ai_interviewer and consent_recording
- Build the prompt from the outstanding questions passed as an argument, so phone and form cannot diverge
- Dial through the dedicated Synthflow agent, degrading to no call when the agent id is unset
- Handle the completion webhook idempotently
**Inputs**
- the applicant's recorded permission_to_call, permission_ai_interviewer and consent_recording
- their phone number
- the outstanding question set
**Outputs**
- a placed or scheduled call
- a transcript and provider_payload
- a CommunicationLog entry with PII redacted
**Exceptions that must be handled**
- No permission_to_call: no call, which is the first of the four hard refusals
- SYNTHFLOW_INTERNSHIP_AGENT_ID unset: no call rather than borrowing another Colaberry agent, which carries its own saved script
- Webhook delivered twice: idempotent completion handling (internshipCallCompletion.ts:13-23)
- Synthflow caller-ID rejection: a known outage class; the call must fail loudly and the applicant must not be left believing a call is coming
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_applicant_interview_responses
**Application surfaces**
- /portal/internship
- frontend/src/pages/portal/internship/InternshipInterview.tsx
- POST /api/portal/internship/interview/call (participantRoutes.ts:349)
- POST /api/portal/internship/interview/call/schedule (participantRoutes.ts:350)
- POST /api/portal/internship/interview/call/cancel (participantRoutes.ts:351)
- POST /api/webhook/synthflow/call-complete (webhookRoutes.ts:52)
**Source modules**
- backend/src/services/internship/internshipCallService.ts
- backend/src/services/internship/internshipCallPrompt.ts
- backend/src/services/internship/internshipCallCompletion.ts
- backend/src/services/internship/internshipCallReconcile.ts
**Dependencies**
- Synthflow
- admissions.interview_progress_tracking
- admissions.outreach_compliance_monitoring
- CommunicationLog
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Placing a call reaches an applicant's phone, which is an irreversible external side effect on a person. The existing design keeps it applicant-initiated, and that is the property to preserve: an agent may prepare the prompt and read the outcome, so its ceiling is stateful sandbox work (autonomy:R4). Dialling stays with the applicant's own request, never with the agent's judgement that a call would be useful.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Documents the four hard refusals, the consent columns and the no-agent-id degradation.

Acceptance: The document names all three consent columns and states that an unset agent id means no call.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- outbound voice contact with an applicant is an external side effect that no agent grant in this matrix includes; it is recorded here as a blocker rather than as a required tool, for the same reason outbound mail is default-denied as live_email (executionPolicy.ts:27)
- whether POST /api/webhook/synthflow/call-complete verifies a provider signature is unknown; the controller's verification path was not read
- domain ownership is contested between the admissions and internship domains
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/internship/internshipCallService.ts:62 (callNow)
- backend/src/services/internship/internshipCallService.ts:234 (scheduleCall)
- backend/src/services/internship/internshipCallService.ts:279 (cancelScheduledCall)
- backend/src/services/internship/internshipCallService.ts:16-22 (four hard refusals, including no permission_to_call means no call)
- backend/src/services/internship/internshipCallPrompt.ts:60 (buildInternshipCallPrompt, outstanding questions passed as an argument)
- backend/src/services/internship/internshipCallCompletion.ts:48 (handleInternshipCallCompleted, idempotent because webhooks arrive twice)
- backend/src/models/InternshipAdministrativeIntake.ts:63 (phone)
- backend/src/models/InternshipAdministrativeIntake.ts:73 (permission_to_call)
- backend/src/models/InternshipAdministrativeIntake.ts:74 (permission_ai_interviewer)
- backend/src/models/InternshipAdministrativeIntake.ts:75 (consent_recording)
- backend/src/routes/participantRoutes.ts:349 (POST /api/portal/internship/interview/call)
- backend/src/routes/participantRoutes.ts:336-342 (internshipCallRateLimiter, 6 per hour)
- backend/src/routes/webhookRoutes.ts:52 (POST /api/webhook/synthflow/call-complete)
- docs/AI_INTERNSHIP_DISCOVERY.md:86-96 (a dedicated SYNTHFLOW_INTERNSHIP_AGENT_ID that degrades to no call when unset)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document names all three consent columns and states that an unset agent id means no call.

When every box above is ticked, stop and show the demo.
