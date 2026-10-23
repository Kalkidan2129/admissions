# admissions.CAP.enrollment_conversion_strategy_proposals — Enrollment conversion strategy proposals

Admissions conversion improves through proposals that name a specific change, its expected effect and how it will be measured, instead of through undirected effort.

**Built today:** partial. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), and he is the named approver for this agent via ticketCreatorIdentitySeed.ts:99-104, so the approval path has no surface today
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the slice records this agent as having no system_prompt and no persona_version, so the behaviour it would exhibit is unknown
- Initiative.status has no write path, so there is no completion signal and no way to measure whether a proposal worked

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Enrollment conversion strategy proposals
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.enrollment_conversion_strategy_proposals`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** partial · **Source:** inherited
## The business outcome
Admissions conversion improves through proposals that name a specific change, its expected effect and how it will be measured, instead of through undirected effort.
Intended users: admissions_operations, executive.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Evaluate department health
- Identify a conversion opportunity
- Propose an initiative with an expected effect and a measurement
- Generate tickets only after a human approves the initiative
**Inputs**
- department health signals
- funnel stage figures
- prior initiatives and their outcomes
**Outputs**
- a strategic initiative proposal
- tickets derived from an approved initiative
**Exceptions that must be handled**
- No measurable baseline for the proposed change: do not propose it, because an unmeasurable initiative cannot be evaluated
- Initiative duplicates an open one: link rather than create
- Initiative.status has no write path in this codebase, so an initiative cannot be closed by the agent and must never be auto-closed on a timer
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_visitor_analytics
- read_enrollment_records
- llm_text_generation
**Application surfaces**
- /admin/intelligence
**Source modules**
- backend/src/services/agents/strategy/strategyArchitectAgent.ts
- backend/src/services/agentBlueprint/ticketCreatorIdentitySeed.ts
**Dependencies**
- admissions.visitor_insight_aggregation
- the department initiative surface
- a human approver
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: A conversion initiative changes how Colaberry treats prospective applicants and commits other people's work, which is a strategic decision reserved for a human. The agent may propose and may shadow-evaluate against initiatives a human already ran (autonomy:R5), but it may never adopt an initiative, so it stops below the supervised production pilot and well below automation.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R2)**
Answers questions about conversion performance from approved aggregates.

Acceptance: Every claim cites a figure a human can re-derive.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), and he is the named approver for this agent via ticketCreatorIdentitySeed.ts:99-104, so the approval path has no surface today
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the slice records this agent as having no system_prompt and no persona_version, so the behaviour it would exhibit is unknown
- Initiative.status has no write path, so there is no completion signal and no way to measure whether a proposal worked
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsConversionArchitect
- backend/src/services/agentRegistrySeed.ts:1947
- backend/src/services/agentRegistrySeed.ts:1956 (config department_slug 'admissions')
- backend/src/services/aiOpsScheduler.ts:320
- backend/src/services/agents/strategy/strategyArchitectAgent.ts (shared generic implementation)
- backend/src/services/agentBlueprint/ticketCreatorIdentitySeed.ts:99-104 (REASSIGNED_TO_TAIWO_AGENT_NAMES)
- backend/src/services/agentBlueprint/ticketCreatorIdentitySeed.ts:21 (ORG_MEMBER.TAIWO)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every claim cites a figure a human can re-derive.

When every box above is ticked, stop and show the demo.
