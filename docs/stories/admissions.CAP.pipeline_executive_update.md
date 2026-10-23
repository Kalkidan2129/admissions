# admissions.CAP.pipeline_executive_update — Admissions pipeline executive update

Leadership sees the state of the admissions pipeline on a fixed cadence with figures that reconcile, instead of asking for a number and waiting.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- emailing the update requires the default-denied live_email capability (executionPolicy.ts:27), so the agent may render but never send

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions pipeline executive update
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.pipeline_executive_update`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
Leadership sees the state of the admissions pipeline on a fixed cadence with figures that reconcile, instead of asking for a number and waiting.
Intended users: executive, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Snapshot the pipeline
- Compare against the previous snapshot
- State what moved and what did not
- Say explicitly when a figure could not be computed
**Inputs**
- aggregate pipeline counts
- conversion and stage figures
- the prior update for comparison
**Outputs**
- an executive update with period-over-period movement
**Exceptions that must be handled**
- No prior snapshot: report absolute figures and say there is no comparison, rather than implying a trend
- A source query fails: report the gap in the update, never silently omit the metric
- Figures disagree between two sources: report both and flag the disagreement
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_enrollment_records
- read_lead_records
- render_html_report
**Application surfaces**
- /admin/dashboard
**Source modules**
- backend/src/services/agents/admissions/admissionsExecutiveUpdateAgent.ts
- backend/src/services/executiveBriefingService.ts
**Dependencies**
- admissions.visitor_insight_aggregation
- enrollment and lead aggregates
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Composing an internal aggregate update is an authorizable action class at autonomy:R7. Distribution is the constrained part: delivering it by mail needs the default-denied live_email capability, so the agent renders and a human or an already-approved mail service sends.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers pipeline questions from the latest snapshot.

Acceptance: Every figure reconciles with a re-runnable query and no figure is estimated.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- emailing the update requires the default-denied live_email capability (executionPolicy.ts:27), so the agent may render but never send
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsExecutiveUpdateAgent
- backend/src/services/agentRegistrySeed.ts:915
- backend/src/services/aiOpsScheduler.ts:236
- backend/src/services/agents/admissions/admissionsExecutiveUpdateAgent.ts
- backend/src/services/executiveBriefingService.ts

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every figure reconciles with a re-runnable query and no figure is estimated.

When every box above is ticked, stop and show the demo.
