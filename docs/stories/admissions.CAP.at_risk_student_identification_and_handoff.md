# admissions.CAP.at_risk_student_identification_and_handoff — At-risk student identification and handoff

A student who has gone quiet is noticed within days and reaches a human within two days of an automated nudge failing, instead of being discovered at the end of the cohort.

**Built today:** partial. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the person who sets the thresholds and receives the escalation has no surface
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nudging or following up by mail requires the default-denied live_email capability (executionPolicy.ts:27)
- implementation_state is partial: the weekly report already renders an at-risk list, but I found no implementation of the 48-hour nudge-to-human escalation the brief specifies at :43
- the inactivity thresholds are written as 'X days' in the brief itself, so the rule is undefined at source and cannot be implemented without Taiwo supplying the number

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# At-risk student identification and handoff
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.at_risk_student_identification_and_handoff`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** partial · **Source:** manager_defined
## The business outcome
A student who has gone quiet is noticed within days and reaches a human within two days of an automated nudge failing, instead of being discovered at the end of the cohort.
Intended users: admissions_operations, learner_success.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Evaluate the inactivity signals against thresholds Taiwo sets
- Produce the at-risk list
- Hand off for an automated nudge
- Escalate to a named human when the nudge has not landed within 48 hours
**Inputs**
- activity signals (repository activity, lab submissions, community engagement)
- the inactivity thresholds
- nudge outcomes
**Outputs**
- an at-risk list
- a handoff record
- a human follow-up task when the nudge does not land
**Exceptions that must be handled**
- A student on an agreed break: they will look at-risk, so an exemption must exist or the escalation becomes noise and gets ignored
- No activity signal available for a student: report as unknown rather than as at-risk, because absence of a signal is not evidence of absence
- The same student escalated repeatedly: escalate the pattern once, not daily
- The 48-hour rule needs a recorded nudge outcome; if nudge delivery is not observable, the rule cannot fire and must be reported as unenforceable
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_enrollment_records
- read_cohort_snapshots
- render_html_report
**Application surfaces**
- /admin/reports
- /admin/students
**Source modules**
- backend/src/scripts/weeklyCohortReport.js
**Dependencies**
- admissions.weekly_cohort_progress_report
- activity signal sources
- the SuccessCoach nudge path
- a named human for follow-up
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R6**.
Why that ceiling: Identifying and listing is safe, but this capability names individual students as at-risk, which is a judgement that reaches them if it is acted on. A supervised production pilot (autonomy:R6) is the ceiling, and the nudge itself belongs to whichever capability holds the contact channel, never to this one.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'who looks at-risk this week and on which signal'.

Acceptance: Every at-risk student cites the specific missing signal; a student with no available signal is reported as unknown rather than at-risk.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the person who sets the thresholds and receives the escalation has no surface
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nudging or following up by mail requires the default-denied live_email capability (executionPolicy.ts:27)
- implementation_state is partial: the weekly report already renders an at-risk list, but I found no implementation of the 48-hour nudge-to-human escalation the brief specifies at :43
- the inactivity thresholds are written as 'X days' in the brief itself, so the rule is undefined at source and cannot be implemented without Taiwo supplying the number
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:3 (he owns retention tracking and student lifecycle reporting)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:42 (identify at-risk students: no GitHub activity for X days, no lab submission, no community engagement)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:43 (hand at-risk students to AI SuccessCoach for a nudge, then human follow-up if the nudge does not land in 48 hours)
- PROGRESS.md:1920-1926 (the weekly report already tiers an at-risk bottom quartile and renders a filterable at-risk list)
- backend/src/scripts/weeklyCohortReport.js

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every at-risk student cites the specific missing signal; a student with no available signal is reported as unknown rather than at-risk.

When every box above is ticked, stop and show the demo.
