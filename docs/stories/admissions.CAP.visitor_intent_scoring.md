# admissions.CAP.visitor_intent_scoring — Prospective-applicant intent scoring

Admissions effort goes to the people most likely to apply, because each prospect carries a current intent reading and a recommended next action instead of sitting in an undifferentiated queue.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the intent threshold table is not documented in any file I located, so the scoring rule Taiwo would be confirming is currently unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Prospective-applicant intent scoring
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.visitor_intent_scoring`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
Admissions effort goes to the people most likely to apply, because each prospect carries a current intent reading and a recommended next action instead of sitting in an undifferentiated queue.
Intended users: admissions_operations, admissions_chat_assistant.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Load the visitor's accumulated interests and questions
- Apply the threshold table
- Write recommended_next_action
- Leave whether to act on it to a human or to a separately approved capability
**Inputs**
- admissions_memory.interests and questions_asked (AdmissionsMemory.ts:43-44)
- visitor session and page-event history
- intent threshold table
**Outputs**
- an intent reading per visitor
- admissions_memory.recommended_next_action
**Exceptions that must be handled**
- No admissions_memory row: no score, not a default score
- Threshold table unset: refuse rather than invent a cutoff
- Score changes on identical input: treat as a defect, the reading must be deterministic
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_visitor_analytics
**Application surfaces**
- /admin/visitors
**Source modules**
- backend/src/services/agents/admissions/admissionsIntentDetectionAgent.ts
- backend/src/models/AdmissionsMemory.ts
**Dependencies**
- admissions.conversation_memory_summarization
- admissions_memory table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: A score is a recommendation, not an action: nothing downstream of this capability may contact anybody or change an application state. Capped at autonomy:R7 and only for the 'write an intent reading' action class, with the thresholds themselves remaining a human setting.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Explains an existing score from the recorded interests.

Acceptance: Every explanation cites at least one stored interest or question and none invents a signal.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the intent threshold table is not documented in any file I located, so the scoring rule Taiwo would be confirming is currently unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsIntentDetectionAgent
- backend/src/services/agentRegistrySeed.ts:825
- backend/src/services/aiOpsScheduler.ts:231
- backend/src/services/agents/admissions/admissionsIntentDetectionAgent.ts
- backend/src/models/AdmissionsMemory.ts:46 (recommended_next_action)
- backend/src/models/AdmissionsMemory.ts:116 (tableName 'admissions_memory')

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every explanation cites at least one stored interest or question and none invents a signal.

When every box above is ticked, stop and show the demo.
