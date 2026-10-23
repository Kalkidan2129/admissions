# admissions.CAP.scheduler_registry_name_drift_reconciliation — Scheduler and registry name drift reconciliation

Every scheduled admissions behaviour resolves to the registry row that governs it, so an agent believed to be running is actually running and the department health picture is not built on a broken join.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- this programme's execution contract forbids any write to ai_agents, including enabled, autonomy_level, reports_to and tools_granted (execution-contract.md:106-112), so the correction cannot be made here
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- whether the mismatched names cause the scheduler's enabled-gate to no-op those entries is unknown; establishing it requires reading runAgent's registry lookup, which was not done
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Scheduler and registry name drift reconciliation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.scheduler_registry_name_drift_reconciliation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
Every scheduled admissions behaviour resolves to the registry row that governs it, so an agent believed to be running is actually running and the department health picture is not built on a broken join.
Intended users: platform_reliability, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Enumerate every scheduled admissions entry and its name
- Resolve each against the registry agent_name values
- Resolve each registry row against its source_file on disk
- Report every name that fails to resolve, and say what the failure means for that behaviour's live status
**Inputs**
- the scheduler's registered names
- the registry's agent_name values
- the department group membership list
- the source files on disk
**Outputs**
- a reconciliation report naming every unresolved join
- a named list of behaviours whose live status is unknown
**Exceptions that must be handled**
- A name that fails to resolve does not prove the behaviour is dead; it proves the join is broken, and conflating the two is how a working agent gets retired
- A shared generic implementation (the department reporter, the strategy architect) is driven by its config field, so a filename-based check will wrongly report it as a mismatch
- An agent absent from the group membership list is invisible to the department rollup even while running, which is the quieter half of this defect
- The audit classification file is deliberately a point-in-time judgement rather than a live computation, so it must not be re-derived automatically and presented as the audit's finding
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_static_read
- read_agent_registry
**Application surfaces**
- /admin/trust
**Source modules**
_none recorded_
**Dependencies**
- aiOpsScheduler.ts
- agentRegistrySeed.ts
- agentRegistryAuditClassification.ts
- admissions.department_signal_rollup
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Reconciling names reads only code and configuration, so autonomy:R7 is reachable for producing the report. Correcting a name changes which registry row governs a running behaviour, including its enabled flag and its tool grants, so that write is a human decision and sits outside this programme's scope entirely.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R1)**
Builds the reconciliation from the static definitions with baseline tests.

Acceptance: The three measured name mismatches at aiOpsScheduler.ts:234, :235 and :237 are reported, and a fixture whose name is corrected disappears from the report, which is the mutation proof.
## Before you start
- this programme's execution contract forbids any write to ai_agents, including enabled, autonomy_level, reports_to and tools_granted (execution-contract.md:106-112), so the correction cannot be made here
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- whether the mismatched names cause the scheduler's enabled-gate to no-op those entries is unknown; establishing it requires reading runAgent's registry lookup, which was not done
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/aiOpsScheduler.ts:234 (scheduler name AdmissionsHighIntentDetection) versus backend/src/services/agentRegistrySeed.ts:885 (registry name AdmissionsHighIntentLeadAgent)
- backend/src/services/aiOpsScheduler.ts:235 (AdmissionsInsightsAggregation) versus backend/src/services/agentRegistrySeed.ts:905 (AdmissionsInsightsAgent)
- backend/src/services/aiOpsScheduler.ts:237 (AdmissionsCallCompliance) versus backend/src/services/agentRegistrySeed.ts:987 (AdmissionsCallComplianceMonitor)
- backend/src/services/agentRegistrySeed.ts:3310-3314 (the registry's own record of this bug class: registered agent_names, not source-file names, which left admissions carrying 17 rows in production where the map intended 20)
- backend/src/services/agentRegistrySeed.ts:3304-3319 (the admissions group list of 20 names, from which eight domain agents are absent)
- docs/architecture/ai-workforce-management/SUPERVISOR_HEALTH_AUDIT_2026-10-06.md:50 (Admissions: 17 registered, 11 enabled, 9137 runs)
- four agents whose filename differs from their agent_name: AdmissionsCallComplianceMonitor to admissionsCallComplianceAgent.ts, AdmissionsCallbackManagementAgent to admissionsCallbackAgent.ts, AdmissionsAppointmentSchedulingAgent to admissionsAppointmentAgent.ts

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The three measured name mismatches at aiOpsScheduler.ts:234, :235 and :237 are reported, and a fixture whose name is corrected disappears from the report, which is the mutation proof.

When every box above is ticked, stop and show the demo.
