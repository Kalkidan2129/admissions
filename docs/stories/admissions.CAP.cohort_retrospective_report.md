# admissions.CAP.cohort_retrospective_report — Per-cohort retrospective report

Each cohort ends with an honest account of who finished, how they rated it and how their capstones scored, so the next cohort is designed on evidence from the last one.

**Built today:** unknown. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- implementation_state is unknown: I did not locate a shipped per-cohort retrospective report in this tree
- where a drop reason is recorded is unknown; the enrollments status enum has no reason column and EnrollmentLead.ts:25 lost_reason covers only prospects who never enrolled

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Per-cohort retrospective report
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.cohort_retrospective_report`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** unknown · **Source:** manager_defined
## The business outcome
Each cohort ends with an honest account of who finished, how they rated it and how their capstones scored, so the next cohort is designed on evidence from the last one.
Intended users: admissions_operations, executive, curriculum.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Resolve the cohort's final enrollment statuses
- Join NPS and capstone outcomes
- Report completion, satisfaction and scores
- State the recorded reason for each drop, and say when no reason was recorded
**Inputs**
- final enrollment statuses for the cohort
- NPS responses
- capstone scores
**Outputs**
- a retrospective with completion, satisfaction and outcome figures, and stated reasons for drops
**Exceptions that must be handled**
- A drop with no recorded reason: report it as unrecorded, because an inferred reason becomes a fact in the next cohort's design
- NPS response rate low: report the rate alongside the score, or the score reads as representative when it is not
- A student holding two enrollments (class plus internship): they must be counted once, and AI_INTERNSHIP_SPEC.md:192-194 makes two active enrollments legitimate
- Capstone scores absent: report the gap rather than averaging over the students who happen to have one
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_enrollment_records
- read_cohort_snapshots
- render_html_report
**Application surfaces**
- /admin/cohorts
- /admin/reports
**Source modules**
- backend/src/services/cohortService.ts
- backend/src/models/Enrollment.ts
**Dependencies**
- enrollments table
- cohortService.ts
- the NPS source
- capstone scoring
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: An end-of-cohort aggregate retrospective changes nothing and can be produced without naming anyone, so autonomy:R7 is reachable. Its one discipline is that it must never infer a drop reason, because a fabricated reason propagates into curriculum decisions and compounds.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'who completed this cohort and who withdrew'.

Acceptance: Counts reconcile with the enrollment statuses, and a student with two enrollments is counted once.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- implementation_state is unknown: I did not locate a shipped per-cohort retrospective report in this tree
- where a drop reason is recorded is unknown; the enrollments status enum has no reason column and EnrollmentLead.ts:25 lost_reason covers only prospects who never enrolled
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:53 (Per cohort end: cohort retrospective covering who finished, NPS and capstone scores, to Ali plus Swati)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:44 (track who graduates, who drops, why)
- backend/src/models/Enrollment.ts:205 (status enum: active, completed, withdrawn, suspended)
- backend/src/services/cohortService.ts:408 (getCohortDetail)
- backend/src/services/cohortService.ts:427 (getDashboardStats)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Counts reconcile with the enrollment statuses, and a student with two enrollments is counted once.

When every box above is ticked, stop and show the demo.
