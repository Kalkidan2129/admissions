# admissions.CAP.conversation_memory_summarization — Admissions conversation memory summarization

A returning prospect is not asked the same question twice, because each closed conversation is folded into a durable per-visitor memory that the next conversation reads.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- no human-approval path exists for admissions_memory.personality_notes (MEMORY_MAP.md:12 records 'None' in its approval column)

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions conversation memory summarization
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.conversation_memory_summarization`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
A returning prospect is not asked the same question twice, because each closed conversation is folded into a durable per-visitor memory that the next conversation reads.
Intended users: admissions_chat_assistant, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Select conversations closed since the last watermark (chatService.ts:515)
- Summarize each into one entry keyed on the conversation id
- Append only if that conversation id is absent, which is the idempotency key
- Merge interests and questions as sets, never as duplicates
**Inputs**
- closed ChatConversation and ChatMessage rows
- the existing admissions_memory row
**Outputs**
- an appended admissions_memory.conversation_summaries entry
- merged interests[] and questions_asked[]
**Exceptions that must be handled**
- Conversation already summarized: no-op, which is the idempotency guarantee
- Summary would contain a quoted phone number or email address: reject, a summary is the wrong place for contact details
- personality_notes: MEMORY_MAP.md:12 records no approval path for this column, so writing a character judgement about a named person has no gate today
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- llm_text_generation
- read_admissions_chat_conversations
**Application surfaces**
- /admin/visitors
**Source modules**
- backend/src/services/agents/admissions/admissionsConversationMemoryAgent.ts
- backend/src/services/chatService.ts
- backend/src/models/AdmissionsMemory.ts
**Dependencies**
- chatService.ts:515 closeConversation
- admissions_memory table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R6**.
Why that ceiling: This capability writes a persistent characterisation of a named person that later prompts read back, and MEMORY_MAP.md:12 records no human-approval path for personality_notes. Until an approval path exists it stops at a supervised production pilot (autonomy:R6) rather than reaching the unattended automation of autonomy:R7.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Reads back an existing memory on request.

Acceptance: No reply asserts a fact absent from conversation_summaries.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- no human-approval path exists for admissions_memory.personality_notes (MEMORY_MAP.md:12 records 'None' in its approval column)
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsConversationMemoryAgent
- backend/src/services/agentRegistrySeed.ts:815
- backend/src/services/aiOpsScheduler.ts:230
- backend/src/services/agents/admissions/admissionsConversationMemoryAgent.ts
- backend/src/models/AdmissionsMemory.ts:42 (conversation_summaries)
- backend/src/models/AdmissionsMemory.ts:47 (personality_notes)
- backend/src/services/admissionsMayaService.ts:11 (buildMayaSystemPrompt consumes it)
- docs/architecture/ai-workforce-management/MEMORY_MAP.md:12

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] No reply asserts a fact absent from conversation_summaries.

When every box above is ticked, stop and show the demo.
