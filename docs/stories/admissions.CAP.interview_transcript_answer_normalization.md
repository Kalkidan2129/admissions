# admissions.CAP.interview_transcript_answer_normalization — Interview transcript answer normalization

What an applicant said on a phone interview becomes structured answers the reviewer can read, without the system ever treating a machine transcription as the applicant's confirmed word.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
- whether internship_interview_sessions.transcript and provider_payload are encrypted at rest is unknown; no encryption attribute appears in the model definition and the migrations were not inspected

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Interview transcript answer normalization
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.interview_transcript_answer_normalization`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
What an applicant said on a phone interview becomes structured answers the reviewer can read, without the system ever treating a machine transcription as the applicant's confirmed word.
Intended users: prospective_applicant, application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Parse the transcript into turns
- Map turns onto question_keys
- Write every extracted answer as needs_followup, never as answered
- Present the summary to the applicant, who confirms or corrects it
**Inputs**
- the call transcript
- the outstanding question set
**Outputs**
- normalized answers in state needs_followup
- a summary the applicant is asked to confirm
**Exceptions that must be handled**
- Transcript ambiguous or inaudible: leave the question outstanding rather than guessing, because a guessed answer about a person's circumstances can change their outcome
- Applicant never confirms the summary: the answers stay unresolved and the application does not advance
- Transcript contains information nobody asked for (a health disclosure, a family circumstance): it must not be mapped onto an unrelated question_key
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_applicant_interview_responses
- llm_text_generation
**Application surfaces**
- /portal/internship
- frontend/src/pages/portal/internship/InternshipSummary.tsx
- GET /api/portal/internship/interview/summary (participantRoutes.ts:346)
- POST /api/portal/internship/interview/summary/confirm (participantRoutes.ts:347)
**Source modules**
- backend/src/services/internship/internshipTranscriptExtraction.ts
- backend/src/models/InternshipInterviewSession.ts
**Dependencies**
- admissions.ai_voice_interview_dispatch
- admissions.interview_progress_tracking
- an LLM provider
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: The transcript is the single richest piece of unstructured applicant PII in the system and the extraction feeds an admission decision. Shadow mode against applicant-confirmed answers (autonomy:R5) is the ceiling: it measures extraction fidelity against the person's own confirmation, which is the only correct reference. It must never reach a level at which an extracted answer is stored as confirmed, because internshipTranscriptExtraction.ts:11-13 makes applicant confirmation the control.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Documents the extraction contract, including the needs_followup invariant.

Acceptance: The document names applicant confirmation as the only path from needs_followup to answered.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
- whether internship_interview_sessions.transcript and provider_payload are encrypted at rest is unknown; no encryption attribute appears in the model definition and the migrations were not inspected
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/internship/internshipTranscriptExtraction.ts:172 (extractAnswersFromTranscript)
- backend/src/services/internship/internshipTranscriptExtraction.ts:11-13 (every extracted answer lands as needs_followup until the applicant confirms)
- backend/src/services/internship/internshipTranscriptExtraction.ts:50 (parseTurns)
- backend/src/models/InternshipInterviewSession.ts:53 (transcript)
- backend/src/models/InternshipInterviewSession.ts:52 (provider_payload)
- backend/src/models/InternshipInterviewSession.ts:61 (tableName 'internship_interview_sessions')
- backend/src/routes/participantRoutes.ts:346 (GET /api/portal/internship/interview/summary)
- backend/src/routes/participantRoutes.ts:347 (POST /api/portal/internship/interview/summary/confirm)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document names applicant confirmation as the only path from needs_followup to answered.

When every box above is ticked, stop and show the demo.
