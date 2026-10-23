# admissions.CAP.applicant_assessment_preparation — Applicant assessment preparation for a reviewer

A reviewer opens an application and already has the deterministic requirement checks and a readable summary in front of them, so the decision is made on assembled evidence rather than on a cold read of raw answers.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains (AI_INTERNSHIP_SPEC.md:186-198, AI_INTERNSHIP_DISCOVERY.md:194)
- no adverse-impact or bias review process is recorded anywhere in the repo for an AI reading of an applicant, and this capability reads work_auth_category (InternshipAdministrativeIntake.ts:72) and accommodation_request (:76) in the same record set

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Applicant assessment preparation for a reviewer
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.applicant_assessment_preparation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
A reviewer opens an application and already has the deterministic requirement checks and a readable summary in front of them, so the decision is made on assembled evidence rather than on a cold read of raw answers.
Intended users: application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Run the deterministic requirement checks first
- Fence the applicant's own words as untrusted evidence (internshipApplicantAssessment.ts:21-22)
- Generate the summary and the suggested action
- Persist as ai_recommendation and ai_factors on the decision record, which no transition reads
**Inputs**
- interview responses
- administrative intake
- requirement check results
**Outputs**
- a deterministic requirement checklist
- a narrative summary
- a suggested action with named factors and no score
**Exceptions that must be handled**
- Applicant text contains instructions aimed at the model: the untrusted-evidence fence is the control, and a prompt-injection attempt must be reported rather than obeyed
- Requirement data incomplete: the checklist reports unknown per item, it does not infer a pass
- internshipRecommendation.ts:4-12 forbids a score or a rank, so no numeric applicant ranking may be introduced
- InternshipDecision.ts:61 reviewer_notes and :67 ai_factors are internal and must never reach an applicant-facing surface
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_applicant_interview_responses
- llm_text_generation
- write_applicant_assessment_draft
**Application surfaces**
- /admin/internship?view=apps
- frontend/src/pages/admin/internship/tabAssessment.tsx
- POST /api/admin/internship/applications/:id/assess (internshipRoutes.ts:630)
**Source modules**
- backend/src/services/internship/internshipApplicantAssessment.ts
- backend/src/services/internship/internshipRecommendation.ts
- backend/src/services/internship/internshipRequirementChecks.ts
**Dependencies**
- admissions.interview_progress_tracking
- internshipRequirementChecks.ts
- an LLM provider
- backend/src/services/inboxCase/promptSafety.ts
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: This is the capability that most tempts a system into deciding, so its ceiling is set by what it must never become. It reads an applicant's resume, phone number and interview transcript and produces text a reviewer leans on. Shadow mode against decisions a reviewer already made (autonomy:R5) is the highest honest level: it proves the assessment is sound without the assessment ever carrying authority. It must never reach autonomy:R7, because an automated assessment that a reviewer rubber-stamps is an automated decision wearing a recommendation's clothes.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Documents what the assessment may and may not contain, and names the decision it must never make.

Acceptance: The document states explicitly that no score, rank or admission outcome may appear, matching internshipRecommendation.ts:4-12.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains (AI_INTERNSHIP_SPEC.md:186-198, AI_INTERNSHIP_DISCOVERY.md:194)
- no adverse-impact or bias review process is recorded anywhere in the repo for an AI reading of an applicant, and this capability reads work_auth_category (InternshipAdministrativeIntake.ts:72) and accommodation_request (:76) in the same record set
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/routes/admin/internshipRoutes.ts:630 (POST /api/admin/internship/applications/:id/assess)
- backend/src/services/internship/internshipApplicantAssessment.ts:91 (assessApplicant)
- backend/src/services/internship/internshipApplicantAssessment.ts:21-22 (applicant words fenced with wrapAsUntrustedEvidence)
- backend/src/services/internship/internshipRecommendation.ts:125 (buildRecommendation)
- backend/src/services/internship/internshipRecommendation.ts:4-12 (no score, no rank, accepted by no transition)
- backend/src/services/internship/internshipRequirementChecks.ts
- backend/src/models/InternshipDecision.ts:66-67 (ai_recommendation, ai_factors)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document states explicitly that no score, rank or admission outcome may appear, matching internshipRecommendation.ts:4-12.

When every box above is ticked, stop and show the demo.
