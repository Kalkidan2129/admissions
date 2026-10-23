# admissions.CAP.maya_applicant_chat_response — Prospective-applicant chat response

A prospective applicant gets an accurate, on-brand answer about the programme at the moment they ask, from approved admissions knowledge rather than from an improvisation.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the admin review surface for these transcripts, GET /api/admin/admissions/conversations (admissionsRoutes.ts:18), is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146) and mgmtSectionGate.ts:214-215 is deny-by-default for scoped roles
- CURRENT_STATE.md:71 records this pipeline as 'fully Maya/admissions-hardcoded', so it is a reusable pattern and not reusable code for a new AI employee

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Prospective-applicant chat response
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.maya_applicant_chat_response`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
A prospective applicant gets an accurate, on-brand answer about the programme at the moment they ask, from approved admissions knowledge rather than from an improvisation.
Intended users: prospective_applicant, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Assemble persona, page context, memory summary and retrieved knowledge (admissionsMayaService.ts:11)
- Retrieve relevant approved knowledge (admissionsKnowledgeService.ts:75)
- Generate the reply
- Persist the turn and log the action
**Inputs**
- the visitor's message
- approved admissions_knowledge_entries
- admissions_memory for the visitor
- page context
**Outputs**
- a chat reply
- a ChatMessage row
- an admissions_action_logs entry
**Exceptions that must be handled**
- Question has no answer in approved knowledge: say so and offer a human, rather than generating a plausible answer
- Question asks for a price, date or guarantee not present in knowledge: refuse, because an invented commitment to an applicant is a business liability
- Visitor asks to stop being contacted: honour it in-session and record it
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- read_admissions_knowledge
- read_admissions_chat_conversations
- llm_text_generation
- sandbox_postgres_read
- sandbox_postgres_write
**Application surfaces**
- public marketing pages hosting the chat widget
- POST /api/chat/start (trackingRoutes.ts:75)
- POST /api/chat/message (trackingRoutes.ts:76)
- POST /api/chat/close (trackingRoutes.ts:77)
- GET /api/chat/history/:id (trackingRoutes.ts:78)
**Source modules**
- backend/src/services/admissionsMayaService.ts
- backend/src/services/admissionsKnowledgeService.ts
- backend/src/services/chatService.ts
- backend/src/controllers/chatController.ts
**Dependencies**
- admissions.admissions_knowledge_curation
- admissions.conversation_memory_summarization
- chatService.ts
- an LLM provider
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Answering from approved knowledge is autonomy:R2 work by definition, and the live surface already runs unattended. The ceiling is autonomy:R7 for the narrow action class 'reply from approved admissions knowledge'. It may never state an admission outcome, an eligibility conclusion or a price absent from approved knowledge, and it may never advance an application state.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers programme questions strictly from approved knowledge entries.

Acceptance: On a 50-question fixture set, every answer traces to an admissions_knowledge_entries row and the refusal path fires on all questions with no approved answer.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the admin review surface for these transcripts, GET /api/admin/admissions/conversations (admissionsRoutes.ts:18), is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146) and mgmtSectionGate.ts:214-215 is deny-by-default for scoped roles
- CURRENT_STATE.md:71 records this pipeline as 'fully Maya/admissions-hardcoded', so it is a reusable pattern and not reusable code for a new AI employee
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsAssistantAgent
- backend/src/services/agentRegistrySeed.ts:1017
- backend/src/services/aiOpsScheduler.ts:240
- backend/src/services/agents/admissions/admissionsAssistantAgent.ts
- backend/src/services/admissionsMayaService.ts:11 (buildMayaSystemPrompt)
- backend/src/services/admissionsMayaService.ts:259 (generateMayaGreeting)
- backend/src/services/admissionsKnowledgeService.ts:75 (buildKnowledgeContext)
- backend/src/services/chatService.ts:343 (sendMessage)
- backend/src/routes/trackingRoutes.ts:75-80
- docs/architecture/ai-workforce-management/CURRENT_STATE.md:71

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] On a 50-question fixture set, every answer traces to an admissions_knowledge_entries row and the refusal path fires on all questions with no approved answer.

When every box above is ticked, stop and show the demo.
