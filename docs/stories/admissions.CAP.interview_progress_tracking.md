# admissions.CAP.interview_progress_tracking — Interview progress and completeness tracking

An applicant is never asked the same interview question twice across the form and the phone, and the reviewer can see exactly which questions remain unanswered before deciding.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested: CLAUDE_CODE_AI_EMPLOYEE_CONSOLIDATION_LOOP_PROMPT.md:105 lists interviews under Taiwo's admissions scope while :107 lists internship interviews under Dhee's domain, and the two lines are not reconciled anywhere
- conducting the interview by phone is a separate capability with an external side effect; see admissions.ai_voice_interview_dispatch

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Interview progress and completeness tracking
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.interview_progress_tracking`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
An applicant is never asked the same interview question twice across the form and the phone, and the reviewer can see exactly which questions remain unanswered before deciding.
Intended users: prospective_applicant, application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Load the applicant's answers keyed on question_key
- Compute which questions remain unanswered or unresolved
- Ask only those on resume, whichever channel the applicant returns on
- Transition to interview_complete only when the set is satisfied
**Inputs**
- the versioned question set
- existing interview responses
- the channel the applicant chose
**Outputs**
- remaining questions
- a completeness reading
- an interview_complete transition when the set is satisfied
**Exceptions that must be handled**
- Question set version changed mid-interview: the application carries question_set_version (InternshipApplication.ts:64), so the applicant stays on the version they started
- An answer exists in state needs_followup: it counts as unresolved, not as answered
- Applicant abandons mid-interview: the partial set persists and the application does not advance, which is correct rather than a failure
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_applicant_interview_responses
**Application surfaces**
- /portal/internship (portalRoutes.tsx:70)
- frontend/src/pages/portal/internship/InternshipInterview.tsx
- GET /api/portal/internship/interview (participantRoutes.ts:344)
- PUT /api/portal/internship/interview/answers (participantRoutes.ts:345)
- GET /api/portal/internship/interview/completeness (participantRoutes.ts:348)
**Source modules**
- backend/src/services/internship/internshipInterviewService.ts
- backend/src/services/internship/internshipQuestionBank.ts
- backend/src/models/InternshipInterviewResponse.ts
**Dependencies**
- internshipQuestionBank.ts
- internship_interview_sessions and internship_interview_responses tables
- requireParticipant session scoping
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Asking the next approved question is bounded work, but the answers are the applicant's own words in a record that feeds an admission decision, and the interview_complete transition it can trigger moves the application forward. Multi-step sandbox work (autonomy:R4) is the ceiling until Taiwo has approved what an agent may ask and store. It may never evaluate an answer as good or bad, which would be assessing, nor transition past interview_complete.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Documents the question set, the resume rule and what the agent may never do with an answer.

Acceptance: The document states that no answer may be scored or ranked, consistent with internshipRecommendation.ts:4-12.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested: CLAUDE_CODE_AI_EMPLOYEE_CONSOLIDATION_LOOP_PROMPT.md:105 lists interviews under Taiwo's admissions scope while :107 lists internship interviews under Dhee's domain, and the two lines are not reconciled anywhere
- conducting the interview by phone is a separate capability with an external side effect; see admissions.ai_voice_interview_dispatch
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/internship/internshipInterviewService.ts:93 (progress)
- backend/src/services/internship/internshipInterviewService.ts:85 (remainingQuestions)
- backend/src/services/internship/internshipInterviewService.ts:120 (nextQuestion)
- backend/src/services/internship/internshipInterviewService.ts:250 (completeInterviewIfDone)
- backend/src/services/internship/internshipQuestionBank.ts
- backend/src/routes/participantRoutes.ts:344 (GET /api/portal/internship/interview)
- backend/src/routes/participantRoutes.ts:345 (PUT /api/portal/internship/interview/answers)
- backend/src/routes/participantRoutes.ts:348 (GET /api/portal/internship/interview/completeness)
- backend/src/models/InternshipInterviewResponse.ts:51 (answer_text)
- backend/src/models/InternshipInterviewResponse.ts:62 (tableName 'internship_interview_responses')
- docs/AI_INTERNSHIP_DISCOVERY.md:209 (one versioned question bank, both channels write the same question_key)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document states that no answer may be scored or ranked, consistent with internshipRecommendation.ts:4-12.

When every box above is ticked, stop and show the demo.
