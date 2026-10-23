# admissions.CAP.department_signal_rollup — Admissions department signal rollup

The admissions department has one honest status picture that names which of its own components are healthy and which are not, so a silent failure surfaces as a gap rather than as a missing number.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the name drift between aiOpsScheduler.ts and agentRegistrySeed.ts is unresolved, so whether the 15 scheduled admissions entries actually resolve to their registry rows is unknown; see admissions.scheduler_registry_name_drift_reconciliation

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions department signal rollup
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.department_signal_rollup`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
The admissions department has one honest status picture that names which of its own components are healthy and which are not, so a silent failure surfaces as a gap rather than as a missing number.
Intended users: admissions_operations, executive, platform_reliability.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read each component's recent run outcomes
- Classify each as healthy, degraded or silent
- Report the classification with counts
- Name a component that produced no signal at all as silent rather than omitting it
**Inputs**
- per-agent run outcomes across the admissions department
- the department group membership list
**Outputs**
- a department health report naming healthy, degraded and silent components
**Exceptions that must be handled**
- A component that was never wired: it will look silent; the report must distinguish never-wired from newly-broken, or every audit finding re-presents as an outage
- agentRegistrySeed.ts:3304-3319 lists 20 names in the admissions group but eight domain agents are absent from it, so a rollup over the group list under-reports the department
- Scheduler agent names drift from registry agent names (aiOpsScheduler.ts:234, :235, :237 versus agentRegistrySeed.ts:885, :905, :987), so a name-keyed join silently drops components
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_agent_registry
- render_html_report
**Application surfaces**
- /admin/trust
- /admin/intelligence
**Source modules**
- backend/src/services/agents/departments/superAgents/admissionsSuperAgent.ts
- backend/src/services/agentRegistrySeed.ts
**Dependencies**
- the agent run-outcome store
- agentRegistrySeed group membership
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: A read-only health rollup over internal telemetry carries no applicant exposure and changes nothing, so autonomy:R7 is reachable. It must never gain the ability to disable or re-enable a component it reports on, because a reporter that can silence its own findings is not a reporter.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'which admissions components ran in the last hour'.

Acceptance: Every answer reconciles with the run-outcome rows and names silent components explicitly.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the name drift between aiOpsScheduler.ts and agentRegistrySeed.ts is unresolved, so whether the 15 scheduled admissions entries actually resolve to their registry rows is unknown; see admissions.scheduler_registry_name_drift_reconciliation
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsSuperAgent
- backend/src/services/agentRegistrySeed.ts:2179
- backend/src/services/agentRegistrySeed.ts:2182 (source_file agents/departments/superAgents/admissionsSuperAgent.ts)
- backend/src/services/aiOpsScheduler.ts:352
- docs/architecture/ai-workforce-management/SUPERVISOR_HEALTH_AUDIT_2026-10-06.md:50 (Admissions: 17 registered, 11 enabled, 9137 supervisor runs, verdict 'real')

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every answer reconciles with the run-outcome rows and names silent components explicitly.

When every box above is ticked, stop and show the demo.
