# admissions.CAP.eligibility_attestation_blocking_flag — Eligibility attestation blocking flag

An applicant who is employed full-time is stopped at the reviewer rather than discovered mid-programme, because the attestation is carried onto the application as a hard blocking flag a human must clear.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
- the attestation is self-reported and no verification process is documented, so what a reviewer is meant to do with a cleared flag is unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Eligibility attestation blocking flag
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.eligibility_attestation_blocking_flag`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
An applicant who is employed full-time is stopped at the reviewer rather than discovered mid-programme, because the attestation is carried onto the application as a hard blocking flag a human must clear.
Intended users: application_reviewer, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read the attestation as submitted
- Raise a blocking flag when the attestation is absent or negative
- Present the flag to the reviewer alongside the applicant's own words
- Stop; the clearing of the flag is a human act
**Inputs**
- attests_not_employed_fulltime
- commitment_acknowledged_at
- the applicant's own statements about their employment
**Outputs**
- a blocking flag on the reviewer's profile signals
- no decision
**Exceptions that must be handled**
- Attestation true but an interview answer contradicts it: raise the contradiction, do not resolve it, because resolving it is deciding
- Attestation null on a legacy or converted application: report as not collected rather than as a failure
- AI_INTERNSHIP_DISCOVERY.md:175-186 forbids automatic rejection on this flag, so no path may turn the flag into a rejection
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_internship_application_queue
**Application surfaces**
- /admin/internship?view=apps
- frontend/src/pages/admin/internship/badges.tsx
- GET /api/admin/internship/applications/:id (internshipRoutes.ts:335)
**Source modules**
- backend/src/services/internship/internshipReviewQueue.ts
- backend/src/services/internship/internshipRequirementChecks.ts
- backend/src/models/InternshipApplication.ts
**Dependencies**
- internship_applications table
- admissions.interview_progress_tracking
- admissions.application_queue_triage
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Raising a flag is not deciding, so sandbox multi-step work (autonomy:R4) is reachable. It is marked human_decision because the flag's only consequence is a human judgement about a person's eligibility, and AI_INTERNSHIP_DISCOVERY.md:175-186 explicitly forbids the flag ever becoming an automatic rejection. The ceiling therefore stops well below automation: an automated eligibility conclusion is an automated admission decision.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the attestation, the flag rule and the prohibition on automatic rejection.

Acceptance: The document states the prohibition verbatim from AI_INTERNSHIP_DISCOVERY.md:175-186 and names the human who clears the flag.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
- the attestation is self-reported and no verification process is documented, so what a reviewer is meant to do with a cleared flag is unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/models/InternshipApplication.ts:69 (attests_not_employed_fulltime)
- backend/src/models/InternshipApplication.ts:70 (commitment_acknowledged_at)
- docs/AI_INTERNSHIP_SPEC.md:17 (eligibility gate: must not currently be employed full-time)
- docs/AI_INTERNSHIP_SPEC.md:66-77 (the attestation and the commitment acknowledgement are the two things the email intake actually collects)
- docs/AI_INTERNSHIP_DISCOVERY.md:175-186 (surfaced to the reviewer as a hard blocking flag, never an automatic rejection)
- backend/src/services/internship/internshipReviewQueue.ts:239 (buildProfileSignals)
- backend/src/services/internship/internshipRequirementChecks.ts

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document states the prohibition verbatim from AI_INTERNSHIP_DISCOVERY.md:175-186 and names the human who clears the flag.

When every box above is ticked, stop and show the demo.
