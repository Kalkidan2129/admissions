# admissions.CAP.daily_enrollment_report — Daily enrollment report

Taiwo and Ali see enrollments against target every day, broken down by intensive and by channel, so a shortfall is visible while there is still time in the cohort to act on it.

**Built today:** unknown. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the person who must set the thresholds has no surface on which to set them
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- emailing the report requires the default-denied live_email capability (executionPolicy.ts:27)
- implementation_state is unknown: the brief names the report and its 2026-07-10 date, but I did not locate a shipped daily enrollment report script or an automated_reports registration for it in this tree
- the brief at :89 cites TRAINING_INTEGRATION_PLAN.md Section 4 as its source, and that section does not exist in that file, so the authoritative scope statement behind this capability is unverifiable

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Daily enrollment report
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.daily_enrollment_report`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** unknown · **Source:** manager_defined
## The business outcome
Taiwo and Ali see enrollments against target every day, broken down by intensive and by channel, so a shortfall is visible while there is still time in the cohort to act on it.
Intended users: admissions_operations, executive.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Count enrollments for the day and week to date
- Compare against the cohort target
- Break down by intensive and by channel
- Escalate only when a threshold Taiwo set is tripped
**Inputs**
- enrollments by day
- the cohort target
- intensive and channel attribution
**Outputs**
- a daily dashboard
- a threshold-tripped escalation
**Exceptions that must be handled**
- payment_status pending versus paid: a pending enrollment is not revenue and must not be counted as one
- A day with zero enrollments: report an explicit zero, because an omitted row reads as a data outage
- Enrollment.ts:205 status withdrawn: a withdrawal must reduce the count rather than leaving a stale total
- A threshold not set by Taiwo must not be invented, or the escalation is the agent's judgement rather than his policy
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_enrollment_records
- read_cohort_snapshots
- render_html_report
**Application surfaces**
- /admin/dashboard
- /admin/revenue
**Source modules**
- backend/src/services/enrollmentService.ts
- backend/src/services/cohortService.ts
- backend/src/models/Enrollment.ts
**Dependencies**
- enrollments table
- cohortService.ts
- thresholds Taiwo sets
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Producing an aggregate internal report is exactly the kind of explicitly authorizable action class autonomy:R7 is for, and the brief already describes it as something that generates daily once the columns and thresholds are given. Distribution by mail requires the default-denied live_email capability, so the agent renders and an approved mail path or a human sends. The thresholds stay Taiwo's, because a self-set escalation threshold is a self-granted exemption.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'how many enrolled today, and against what target'.

Acceptance: Every figure reconciles with a re-runnable query, and pending enrollments are reported separately from paid.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the person who must set the thresholds has no surface on which to set them
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- emailing the report requires the default-denied live_email capability (executionPolicy.ts:27)
- implementation_state is unknown: the brief names the report and its 2026-07-10 date, but I did not locate a shipped daily enrollment report script or an automated_reports registration for it in this tree
- the brief at :89 cites TRAINING_INTEGRATION_PLAN.md Section 4 as its source, and that section does not exist in that file, so the authoritative scope statement behind this capability is unverifiable
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:3 (he owns enrollment monitoring)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:20-23 (daily enrollments week-to-date versus the 25-student target, per-intensive and per-channel breakdowns)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:25 (give the column list and thresholds, and the report generates daily)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:50 (Daily: enrollment dashboard, email Ali plus post to Approval Queues if a threshold tripped)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:61 (critical-path date 2026-07-10)
- backend/src/services/enrollmentService.ts:33 (createPendingEnrollment)
- backend/src/models/Enrollment.ts:191 (payment_status enum)
- backend/src/models/Enrollment.ts:205 (status enum)
- backend/src/models/Enrollment.ts:309 (tableName 'enrollments')

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every figure reconciles with a re-runnable query, and pending enrollments are reported separately from paid.

When every box above is ticked, stop and show the demo.
