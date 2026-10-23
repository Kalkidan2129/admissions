# admissions.CAP.weekly_cohort_progress_report — Weekly cohort progress report

Taiwo's Wednesday cohort report is produced by the system rather than by hand, with per-student progress tiered within each cohort and week-over-week movement visible.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the manager this report was built to replace cannot open it on the admin surface
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- emailing the report requires the default-denied live_email capability (executionPolicy.ts:27)
- no small-cohort tiering rule is recorded, so whether a bottom-quartile-of-one is suppressed is unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Weekly cohort progress report
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.weekly_cohort_progress_report`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** manager_defined
## The business outcome
Taiwo's Wednesday cohort report is produced by the system rather than by hand, with per-student progress tiered within each cohort and week-over-week movement visible.
Intended users: admissions_operations, executive, curriculum.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Query the class progress view
- Tier students within each cohort by percentile
- Snapshot to cohort_report_snapshots, keyed on (snapshot_date, class_id)
- Render the report with week-over-week comparison
**Inputs**
- CCPP class sign-up and event-progress data
- the previous weekly snapshot
**Outputs**
- a cohort_report_snapshots row per class per week
- an HTML report with cohorts, at-risk students and trends
**Exceptions that must be handled**
- No prior snapshot: render absolute figures and say there is no comparison
- Re-run on the same day: the unique constraint on (snapshot_date, class_id) makes the snapshot idempotent
- Percentile tiering in a tiny cohort: a bottom quartile of one names that student, so small cohorts need a stated handling rule
- The report contains per-student rows and mailto links, so it is applicant-identifiable despite being an aggregate product
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- read_ccpp_class_progress
- sandbox_postgres_read
- sandbox_postgres_write
- render_html_report
**Application surfaces**
- /admin/reports
**Source modules**
- backend/src/scripts/weeklyCohortReport.js
**Dependencies**
- CCPP class progress view
- cohort_report_snapshots table
- the automated_reports registration
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: This report already runs unattended on a weekly cron and the snapshot write is idempotent, so autonomy:R7 reflects what is true rather than what is aspirational. It names individual students, so it must never acquire the ability to contact one of them: the at-risk list is a handoff to a human, which is a separate capability.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'which cohorts got worse this week' from the stored snapshots.

Acceptance: Every movement claim cites two snapshot rows; no movement is claimed where only one snapshot exists.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the manager this report was built to replace cannot open it on the admin surface
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- emailing the report requires the default-denied live_email capability (executionPolicy.ts:27)
- no small-cohort tiering rule is recorded, so whether a bottom-quartile-of-one is suppressed is unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:51 (Weekly: cohort progress per student, to Ali plus Jackie plus Kes)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:41 (weekly progress monitoring per student)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:62 (critical-path date 2026-07-27)
- PROGRESS.md:1920 (Weekly Cohort Performance Report, replaces Taiwo's manual Wednesday report, 2026-05-31)
- PROGRESS.md:1924-1926 (table cohort_report_snapshots with a unique constraint on (snapshot_date, class_id); script backend/src/scripts/weeklyCohortReport.js; registered in automated_reports with cron 0 13 * * 3)
- backend/src/scripts/weeklyCohortReport.js (verified present on disk 2026-10-09)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every movement claim cites two snapshot rows; no movement is claimed where only one snapshot exists.

When every box above is ticked, stop and show the demo.
