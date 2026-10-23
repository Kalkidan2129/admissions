# admissions.CAP.existing_intern_conversion_planning — Existing-intern conversion planning

Interns who joined before the portal existed are brought onto it without creating duplicate people, because the plan is produced and reviewed before anything is written.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
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

# Existing-intern conversion planning
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.existing_intern_conversion_planning`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
Interns who joined before the portal existed are brought onto it without creating duplicate people, because the plan is produced and reviewed before anything is written.
Intended users: admissions_operations, application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Match each intern to an active enrollment by email
- Classify the row as no_match, ambiguous_match, already_converted or will_convert
- Return the plan without writing anything
- Commit only after a human has read the plan
**Inputs**
- a list of existing interns with their email addresses
- active enrollments
- existing internship applications
**Outputs**
- a conversion plan with one of four outcomes per row
- on commit, applications created idempotently
**Exceptions that must be handled**
- No matching enrollment: report no_match for a human to resolve; the service never creates an enrollment
- Two enrollments for one email: report ambiguous_match rather than picking one, because picking one can hide a person's class or their internship
- Already converted: findOrCreate makes a repeat commit a no-op
- verified-domain-registry.json:57 records an intern holding one active and one withdrawn application on a single enrollment, so the active row is the referent
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_enrollment_records
- read_internship_application_queue
**Application surfaces**
- /admin/internship?view=manage
- POST /api/admin/internship/conversion/plan (internshipRoutes.ts:935)
- POST /api/admin/internship/conversion/commit (internshipRoutes.ts:968)
**Source modules**
- backend/src/services/internship/internshipConversionService.ts
- backend/src/services/internship/internshipCohortService.ts
**Dependencies**
- enrollments table
- internship_applications table
- internshipCohortService.ts
- a human to read the plan
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: The plan half is a pure read and could sit higher, but commit writes application rows for named people and an ambiguous match resolved wrongly merges or splits a real person's record. Shadow planning against conversions a human already committed (autonomy:R5) is the ceiling. Commit stays human, which preserves the structural dry-run guarantee the service was built around.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the four outcomes and the pure-read guarantee.

Acceptance: The document states that planConversion writes nothing and that an unmatched intern is a human's problem to resolve.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/internship/internshipConversionService.ts:124 (planConversion)
- backend/src/services/internship/internshipConversionService.ts:350 (commitConversion)
- backend/src/services/internship/internshipConversionService.ts:14-22 (planConversion is a pure read; commitConversion is the only writer)
- backend/src/services/internship/internshipConversionService.ts:29-34 (nothing here creates a student; an unmatched intern is reported as no_match for a human)
- backend/src/services/internship/internshipConversionService.ts:54-58 (ConversionOutcome: no_match, ambiguous_match, already_converted, will_convert)
- backend/src/services/internship/internshipConversionService.ts:445 (InternshipApplication.findOrCreate, the conversion idempotency hinge)
- backend/src/routes/admin/internshipRoutes.ts:935 (POST /api/admin/internship/conversion/plan)
- backend/src/routes/admin/internshipRoutes.ts:968 (POST /api/admin/internship/conversion/commit)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document states that planConversion writes nothing and that an unmatched intern is a human's problem to resolve.

When every box above is ticked, stop and show the demo.
