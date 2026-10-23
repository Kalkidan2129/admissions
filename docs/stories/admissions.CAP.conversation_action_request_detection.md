# admissions.CAP.conversation_action_request_detection — Conversation action-request detection

When a prospect asks for something concrete in a conversation (send me the brochure, call me, book me in), the request becomes a tracked item instead of being lost in the transcript.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- fulfilment by email is default-denied as live_email (executionPolicy.ts:27); SMS and voice fulfilment are external side effects this capability may not hold

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Conversation action-request detection
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.conversation_action_request_detection`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
When a prospect asks for something concrete in a conversation (send me the brochure, call me, book me in), the request becomes a tracked item instead of being lost in the transcript.
Intended users: admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Scan active conversations for an explicit request
- Classify the request type
- Write one action-log row keyed on (conversation_id, action_type) so a repeated ask is not double-counted
- Hand off to the relevant queue; do not fulfil the request here
**Inputs**
- active ChatConversation messages
**Outputs**
- an admissions_action_logs row per detected request
- a work item for a human or for a queue capability
**Exceptions that must be handled**
- Ambiguous phrasing: record as unclassified for a human rather than guessing the channel, since guessing 'call me' from 'contact me' changes which channel a person is contacted on
- Request already logged: no-op
- Request is to stop contact: this must be classified and honoured, not treated as an unfulfillable action
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_admissions_chat_conversations
- llm_text_generation
**Application surfaces**
- admin admissions operations surface (no sidebar nav entry found)
- GET /api/admin/admissions/operations (admissionsRoutes.ts:22)
**Source modules**
- backend/src/services/agents/admissions/admissionsConversationTaskMonitor.ts
- backend/src/models/AdmissionsActionLog.ts
**Dependencies**
- chatService.ts
- admissions.callback_request_queue_management
- admissions_action_logs table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Detecting and recording a request is reversible internal bookkeeping, so autonomy:R7 is reachable for that action class. Fulfilling the request is explicitly a different capability, because the fulfilment channels (email, SMS, voice) are the ones that reach a person.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Lists the requests found in a given conversation.

Acceptance: Every listed request quotes the message that contains it.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- fulfilment by email is default-denied as live_email (executionPolicy.ts:27); SMS and voice fulfilment are external side effects this capability may not hold
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsConversationTaskMonitor
- backend/src/services/agentRegistrySeed.ts:1007
- backend/src/services/aiOpsScheduler.ts:239
- backend/src/services/agents/admissions/admissionsConversationTaskMonitor.ts
- backend/src/models/AdmissionsActionLog.ts:19-21 (action_type, action_details, status)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every listed request quotes the message that contains it.

When every box above is ticked, stop and show the demo.
