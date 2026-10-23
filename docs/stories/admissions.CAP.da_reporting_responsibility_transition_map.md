# admissions.CAP.da_reporting_responsibility_transition_map — Data-analyst reporting responsibility transition map

Each reporting task a human currently performs by hand has a named, evidenced transition path to automation, so the handover is planned rather than assumed and nothing silently stops being done.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no document describing DA responsibilities transitioning to AI exists for this domain: a repo-wide search of docs/ for 'Data Analyst', 'DA responsibilities' and related phrasings found only the sunsetting Data Analytics bootcamp product, an unrelated Data Analyst Agent in the agent catalog, and appendix numbering in the governance book, so the source content this capability is meant to carry is unknown
- the only verified transition instance in this domain is the Weekly Cohort Performance Report (PROGRESS.md:1920); the other three reports in Taiwo's cadence have no located implementation, so three of four candidate transitions are unevidenced
- the manager interview that would supply the current-state task list has not happened, and manager_has_no_admin_login (agentDomainRegistry.ts:148-151) means Taiwo cannot reach the surface where it would be recorded
- the execution contract forbids this run from scheduling that interview or sending an invitation (execution-contract.md:117-119)

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Data-analyst reporting responsibility transition map
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.da_reporting_responsibility_transition_map`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
Each reporting task a human currently performs by hand has a named, evidenced transition path to automation, so the handover is planned rather than assumed and nothing silently stops being done.
Intended users: admissions_operations, executive.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Enumerate the manual reporting tasks in this domain
- For each, record the current owner, the cadence and what is produced
- Name the automated artifact that would replace it and the evidence it works
- Name explicitly what stays a human decision after the transition
**Inputs**
- each manual reporting task
- its current owner and cadence
- the automated artifact that would replace it
**Outputs**
- a transition map per task with its current state, target state, success measure and retained human decision
**Exceptions that must be handled**
- A task whose output nobody reads: the honest transition is to stop doing it, not to automate it
- A task where the human judgement is the product rather than the figures: automating the figures does not transition the task, and recording it as transitioned would be false
- A transition with no success measure cannot be verified as complete, so it must stay recorded as in-progress
- Taiwo's brief at :55 draws the line as the system drafting and him directing content, so a transition that removes his direction has changed the task rather than automated it
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_static_read
**Application surfaces**
- none
**Source modules**
- backend/src/scripts/weeklyCohortReport.js (the one verified completed transition)
**Dependencies**
- a manager interview with Taiwo
- the reporting capabilities in this matrix
- admissions.manager_surface_access_remediation
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: Deciding that a human's responsibility moves to a machine is a decision about a person's job, and it is not one an agent may make or even recommend unprompted. The agent may assemble the map from evidence (autonomy:R2); every transition on it is approved by Taiwo and by Ali.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the candidate task list from the role brief, marking each transition state as evidenced or unevidenced.

Acceptance: All four reports in the brief's cadence table are listed; exactly one is marked evidenced with its PROGRESS.md and script citation, and the other three are marked unevidenced rather than assumed.
## Before you start
- no document describing DA responsibilities transitioning to AI exists for this domain: a repo-wide search of docs/ for 'Data Analyst', 'DA responsibilities' and related phrasings found only the sunsetting Data Analytics bootcamp product, an unrelated Data Analyst Agent in the agent catalog, and appendix numbering in the governance book, so the source content this capability is meant to carry is unknown
- the only verified transition instance in this domain is the Weekly Cohort Performance Report (PROGRESS.md:1920); the other three reports in Taiwo's cadence have no located implementation, so three of four candidate transitions are unevidenced
- the manager interview that would supply the current-state task list has not happened, and manager_has_no_admin_login (agentDomainRegistry.ts:148-151) means Taiwo cannot reach the surface where it would be recorded
- the execution contract forbids this run from scheduling that interview or sending an invitation (execution-contract.md:117-119)
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/plan.md:308-309 (proposed_new includes DA responsibilities transitioning to AI)
- .loop-architect/runs/20261007-school-agent-factory/plan.md:634 (document existing DA responsibilities and their intended transition)
- .loop-architect/runs/20261007-school-agent-factory/plan.md:642-643 (manager-interview stories: current DA responsibilities, intended AI responsibilities, examples, exceptions, human decisions, success measures)
- PROGRESS.md:1920 (the one verified instance in this domain: the Weekly Cohort Performance Report replaces Taiwo's manual Wednesday report)
- PROGRESS.md:1924-1926 (what replaced it: cohort_report_snapshots, weeklyCohortReport.js, cron 0 13 * * 3)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:46-55 (his four-report cadence, the candidate transition set)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:55 (the report formats are drafted by the system and he directs what goes in, which is the division of labour a transition map must preserve)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] All four reports in the brief's cadence table are listed; exactly one is marked evidenced with its PROGRESS.md and script citation, and the other three are marked unevidenced rather than assumed.

When every box above is ticked, stop and show the demo.
