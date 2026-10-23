# admissions.CAP.callback_request_queue_management — Callback request queue management

A prospect who asked to be called back is actually called back, because the request sits in a queue with an owner and an age rather than inside a chat transcript nobody re-reads.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the queue's own review surface, GET /api/admin/admissions/callbacks, is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146)
- placing an outbound call or sending a confirmation needs capabilities this capability may not hold; outbound mail is default-denied as live_email (executionPolicy.ts:27)

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Callback request queue management
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.callback_request_queue_management`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
A prospect who asked to be called back is actually called back, because the request sits in a queue with an owner and an age rather than inside a chat transcript nobody re-reads.
Intended users: admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read pending callback requests
- Check call governance before queueing anything schedulable
- Queue or re-queue, keyed so the same request is not queued twice
- Surface the queue to a human on /api/admin/admissions/callbacks
**Inputs**
- callback requests detected in conversations
- existing callback queue rows
- call-governance state
**Outputs**
- a queued callback with an age and an owner
- an admissions_action_logs entry
**Exceptions that must be handled**
- Duplicate request from the same person in the same window: collapse to one queue row
- No phone number on the record: queue as not-callable rather than queueing a call that cannot be made
- Governance denies the call: the request stays visible as denied, it is not silently dropped
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_call_logs
**Application surfaces**
- admin admissions operations surface (no sidebar nav entry found)
- GET /api/admin/admissions/callbacks (admissionsRoutes.ts:23)
**Source modules**
- backend/src/services/agents/admissions/admissionsCallbackAgent.ts
- backend/src/models/AdmissionsActionLog.ts
**Dependencies**
- admissions.outreach_compliance_monitoring
- admissions.conversation_action_request_detection
- admissions_action_logs table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Managing a queue is an internal bookkeeping action class that may reach autonomy:R7. Placing the call is a separate capability with a separate and much lower ceiling, and this one must never dial.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Reports the current callback queue and its ages.

Acceptance: Queue counts reconcile exactly with the underlying rows; no row is invented or omitted.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the queue's own review surface, GET /api/admin/admissions/callbacks, is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146)
- placing an outbound call or sending a confirmation needs capabilities this capability may not hold; outbound mail is default-denied as live_email (executionPolicy.ts:27)
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsCallbackManagementAgent
- backend/src/services/agentRegistrySeed.ts:997
- backend/src/services/aiOpsScheduler.ts:238
- backend/src/services/agents/admissions/admissionsCallbackAgent.ts
- backend/src/routes/admin/admissionsRoutes.ts:23 (GET /api/admin/admissions/callbacks)
- backend/src/models/AdmissionsActionLog.ts:66 (tableName 'admissions_action_logs')

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Queue counts reconcile exactly with the underlying rows; no row is invented or omitted.

When every box above is ticked, stop and show the demo.
