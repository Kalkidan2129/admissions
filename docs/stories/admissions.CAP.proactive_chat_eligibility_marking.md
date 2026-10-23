# admissions.CAP.proactive_chat_eligibility_marking — Proactive chat eligibility marking

A high-intent visitor is offered help at the moment they are still on the page, instead of being followed up days later when the interest has gone.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- any variant of this capability that reaches an applicant by email requires the default-denied live_email capability (executionPolicy.ts:27) and is therefore out of scope for the agent in every environment
- no frequency cap or dismissal-memory policy is documented, so the prompting rule Taiwo would be confirming is unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Proactive chat eligibility marking
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.proactive_chat_eligibility_marking`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
A high-intent visitor is offered help at the moment they are still on the page, instead of being followed up days later when the interest has gone.
Intended users: admissions_chat_assistant, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Select visitors above the proactive threshold
- Set the pending flag
- The browser widget polls GET /api/chat/proactive-check and decides whether to open
- Clear the flag once consumed so the same visitor is not re-prompted
**Inputs**
- intent reading from admissions.visitor_intent_scoring
- current visitor session state
**Outputs**
- a proactive_chat_pending flag the on-page widget polls
**Exceptions that must be handled**
- Visitor already in an open conversation: do not flag
- Visitor dismissed a proactive prompt this session: do not re-flag, repeat prompting is the failure mode here
- Flag set but never consumed: must expire rather than persist indefinitely
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_visitor_analytics
**Application surfaces**
- public marketing pages hosting the chat widget
- GET /api/chat/proactive-check (trackingRoutes.ts:79)
**Source modules**
- backend/src/services/agents/admissions/admissionsProactiveOutreachAgent.ts
- backend/src/services/chatService.ts
**Dependencies**
- admissions.visitor_intent_scoring
- chatService.ts:636
- trackingRoutes.ts:79
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: This capability initiates contact with a person, but only inside a page the person already has open and only through a widget the person can dismiss. It never reaches an inbox or a phone. That keeps it inside an authorizable action class at autonomy:R7, conditional on a frequency cap Taiwo sets.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Reports which visitors would be flagged, without flagging them.

Acceptance: Each proposal cites the intent reading that qualified it.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- any variant of this capability that reaches an applicant by email requires the default-denied live_email capability (executionPolicy.ts:27) and is therefore out of scope for the agent in every environment
- no frequency cap or dismissal-memory policy is documented, so the prompting rule Taiwo would be confirming is unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsProactiveOutreachAgent
- backend/src/services/agentRegistrySeed.ts:855
- backend/src/services/aiOpsScheduler.ts:232
- backend/src/services/agents/admissions/admissionsProactiveOutreachAgent.ts
- backend/src/services/chatService.ts:636 (checkProactiveChat)
- backend/src/routes/trackingRoutes.ts:79 (GET /api/chat/proactive-check)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Each proposal cites the intent reading that qualified it.

When every box above is ticked, stop and show the demo.
