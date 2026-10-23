# The nine anatomy elements of the Admissions AI employee

**Story:** `admissions.RESEARCH-2-AGENT-ANATOMY` · **Domain:** Admissions & Applicant Experience
**Accountable human:** Taiwo Oludimimu · **Status:** draft for review, nothing here is validated yet
**Platform evidence read at:** `ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator` commit `36c8e38` (4:24 PM CDT on 2026-10-22), the same commit as [document 01](01-system-classes.md). Platform `file:line` citations are against that commit; paths starting `docs/` are in this repo.

## Headline: 3 of 9 unknown, 5 known gaps, 1 partial, none fully in place

| # | Element | State | What it maps to |
|---|---|---|---|
| 1 | Reasoning | **Unknown** | `ai_agents.system_prompt` + the Talk prompt builder; model from `AI_MODEL` |
| 2 | Memory | Gap | `agent_memory_proposals` (approved rows injected into the prompt) |
| 3 | Inputs | Gap | Talk messages and directives; no trigger fires the agent |
| 4 | Communication | Gap | Agent Detail **Talk** tab, `agent_manager_conversations` |
| 5 | Tools | Gap | `agentToolRegistry.ts` grants; `tools_granted` is empty |
| 6 | Procedures | **Unknown** | `agent_role_charters` + `manager_directives`; the 47 Workflow lists |
| 7 | Coordination | Gap | Does not exist. Nearest is a human handoff ticket |
| 8 | Safeguards | Partial | Release Zero floor, autonomy ladder, kill switch; two fail-open paths |
| 9 | Verification | **Unknown** | `promotionCriteria.ts`, `ai_agent_activity_logs`, `agent_runs` |

The three states mean:

- **Unknown:** the repo cannot tell us what this agent's version of the element is.
- **Gap:** the evidence says it is absent or does not work for this agent today.
- **Partial:** parts exist and apply to this agent, but a known path fails open.
- **In place:** it exists, applies to this agent, and has no known fail-open path. No element meets this today.

So **3 of 9 elements are unknown**. Counting the gaps as well, **8 of 9 have no working answer today**. The ninth, Safeguards, is only partial.

## The agent these elements belong to

Document 01 said the domain has no AI employee, because the domain registry's `agent_id` is `null` (`agentDomainRegistry.ts:177`). That pointer is still null, but **an Admissions AI employee row does exist**: `AdmissionsDomainAgent`.

| Fact | Source |
|---|---|
| Created as "One AI employee per provisioned domain" | `agentRegistry/domainAgents.ts:6`, `:112-120` |
| Loaded by the registry seed | `agentRegistrySeed.ts:13`, `:2856` |
| Given an identity (a staff login, `admissions-agent@colaberry.com`) and classified as an employee | `domainAgentIdentitySeed.ts:61-62`, `:101-130`, called from `agentRegistrySeed.ts:3262` |
| **Release Zero: created, not alive.** `enabled: false`, `tools_granted: []`, autonomy `observe`, no reporting line, and nothing invokes it | `domainAgents.ts:22-38`, `:66-79` |
| **Its description covers far less than the domain.** It "Owns lead intake: sources, ingest logs, routing rules and import" | `domainAgents.ts:118-119` |

That last point matters. The 47 capabilities cover chat, interviews, decisions, documents and reporting, not just lead intake.

Whether this row exists in the production database is **unknown**: the seed declares it, but this repo cannot query production. Everything below maps the nine elements onto `AdmissionsDomainAgent`. It is not Maya, which is the live applicant chat and is not an `ai_agents` employee.

---

## 1. Reasoning: unknown

**Maps to:** `ai_agents.system_prompt` (`AiAgent.ts:240`), assembled by `buildAgentManagerConversationSystemPrompt` (`agentBlueprint/agentManagerConversationPrompt.ts:91-124`). The model comes from `process.env.AI_MODEL`, defaulting to `gpt-4o-mini` (`agentManagerConversationService.ts:63`, `:503-513`).

**Exists today:** the mechanism. A reply to the manager is one model call. Its prompt layers the platform safety rules, then the role charter, then the manager's active directives, then approved memories (`agentManagerConversationPrompt.ts:98-124`).

**Missing:**

- **The prompt itself.** No repo file sets a `system_prompt` for `AdmissionsDomainAgent`; the seed entry has none (`domainAgents.ts:112-120`). What, if anything, is in the production row is **unknown**.
- **Which model production uses.** That depends on an environment variable, so it is also **unknown**.

**First honest version:**

- A short `system_prompt` that states the scope Taiwo approves and the R5 rule for human decisions.
- Nothing about tools until a tool is granted.
- Reasoning stays at R2: answering from approved records (`autonomyLadder.ts:61`, `:207-211`).

## 2. Memory: gap

**Maps to:** the `agent_memory_proposals` table (`AgentMemoryProposal.ts:6-14`, `:109`). The flow is that the agent proposes a memory, a human approves it, and approved texts enter the prompt (`agentMemoryProposalService.ts:116`, `:132`; `agentManagerConversationPrompt.ts:124`). The Talk thread itself is stored in `agent_manager_conversations` and `agent_manager_messages` (`AgentManagerConversation.ts:188`, `AgentManagerMessage.ts:50`).

**Exists today:**

- **A human-approval gate on agent memory.** That is the right design, and the model's own header says nothing else in the codebase had one (`AgentMemoryProposal.ts:7-13`).
- **Separate applicant memory for Maya.** `admissions_memory` holds visitor type and next-action fields (`AdmissionsMemory.ts:116`). It is Maya's memory of applicants, not the employee's memory.

**Missing:**

- **No approved memories for this agent are defined anywhere in the repo.** Whether any rows exist in production is unknown.
- **Taiwo cannot reach the approval screen today.** See Communication.

**First honest version:**

- Memory is empty at start.
- Every memory is a proposal that Taiwo approves by name on `/api/admin/agents/:id/memory-proposals` (`agentMemoryProposalRoutes.ts:17-24`).
- No applicant personal data goes into agent memory.

## 3. Inputs: gap

**Maps to:**

- The agent's trigger: `trigger_type: 'event_driven'`, empty schedule (`domainAgents.ts:37-38`, `:66-72`).
- Manager messages: `POST /api/admin/agents/:id/conversation/messages` (`agentManagerConversationRoutes.ts:12`).
- Manager directives: `POST /api/admin/agents/:id/directives` (`managerDirectiveRoutes.ts:13`).

**Exists today:**

- **The domain data the capabilities would read.** Applicant memory in `admissions_memory` (`AdmissionsMemory.ts:116`), the knowledge base in `admissions_knowledge_entries` (`AdmissionsKnowledgeEntry.ts:90`), and Maya's transcripts in `chat_conversations` (`ChatConversation.ts:25`, `:132`) and `chat_messages` (`ChatMessage.ts:14`, `:60`).
- **Each capability story lists its inputs**, for example decision recording (`docs/stories/admissions.CAP.admission_decision_recording.md:40-45`).

**Missing:**

- **"Nothing invokes them at all until a capability exists"** (`domainAgents.ts:37-38`).
- **No tool connects the agent to any of that data.** See Tools.
- **The only input path left is a manager message, and Taiwo appears to be blocked from it.**

**First honest version:**

- One input only: a message or directive from Taiwo.
- No cron, no event subscription, and no applicant-originated input until a capability is validated.

## 4. Communication: gap

**Maps to:** the **Talk** tab on the Agent Detail page (`frontend/src/pages/admin/AgentDetailPage.tsx:13`, `:377`), backed by `GET` and `POST /api/admin/agents/:id/conversation` (`agentManagerConversationRoutes.ts:11-12`). Talk is "purely conversational": a message never creates a directive or approves anything (`agentManagerConversationService.ts:35-40`).

**Exists today:** a manager-to-agent thread for any `ai_agents` row. The service is generic and keys off `AiAgent.id` (`agentManagerConversationService.ts:35-37`).

**Missing: Taiwo appears to be locked out.** This is derived from the code, **not tested**. Every Talk, memory, charter and directive route uses `requireAgentManagerOrAdmin` (`agentManagerConversationRoutes.ts:11-12`, `agentRoleCharterRoutes.ts:13-14`, `managerDirectiveRoutes.ts:12-14`). That gate admits:

- a `super_admin` (`agentManagerAuthMiddleware.ts:43`, `:64-67`), or
- a human whose `org_members` row matches their sign-in email **and** who has the agent in their reporting chain (`:76-86`).

Taiwo fails both:

- His role is legacy `admin`, not `super_admin` (`agentDomainRegistry.ts:150-153`).
- His `org_members` row holds his personal email while he signs in with his work email (`agentDomainRegistry.ts:155-158`). So the lookup at `:76` finds nothing and returns 403.
- Even with a match, the agent has no reporting line yet (`domainAgents.ts:35`).

The agent also has **no channel to applicants**, which is correct; Maya is that channel.

**First honest version:** Taiwo reaches Talk on `AdmissionsDomainAgent` as its accountable manager. That needs two changes by a platform admin, not by this project:

1. Link his `org_members` row to his work identity.
2. Set the reporting line, which is step AF4.3 (`domainAgents.ts:35`).

The agent speaks only to him.

## 5. Tools: gap

**Maps to:** the platform's tool grants. `agentToolRegistry.ts:16-26` grants exactly one tool, `read_attachments`, to Cory, Reese and Dara. The tool type allows only that name (`agents/tools/types.ts:12`), and agent keys are only `'cory' | 'reese' | 'dara'` (`:15`). `AdmissionsDomainAgent` has `tools_granted: []` (`domainAgents.ts:71`).

**Exists today:** the grant mechanism, plus a kill switch (`AGENT_TOOLS_DISABLED`, `agentToolRegistry.ts:10-12`, `:28-34`).

**Missing: every tool the 47 capabilities name.** Examples are `sandbox_postgres_read` (needed by 41 of 47), `read_admissions_knowledge` and `llm_text_generation`. In the platform, those names appear only in the capability definition file (`agentDomain/capabilities/admissions.json`, for example `:72`). They appear in no TypeScript under `backend/src/services`, `models` or `routes`. **None of them is implemented as a tool.** Granting one is step AF7.1 and "requires a manager" (`domainAgents.ts:29`).

**First honest version:**

- One read-only tool, scoped to one capability Taiwo validates.
- Implemented as a new `AgentToolName` and granted in `agentToolRegistry.ts`.
- No write tools and no outbound tools. Maya's outbound tools are not a precedent; see document 01.

## 6. Procedures: unknown

**Maps to:**

- The role charter in `agent_role_charters`, the agent's "business-facing job description", kept separate from `system_prompt` (`AgentRoleCharter.ts:4-15`, `:120`). Edited at `PUT /api/admin/agents/:id/charter` (`agentRoleCharterRoutes.ts:14`).
- Manager directives (`managerDirectiveRoutes.ts:12-14`).
- The step-by-step **Workflow** list in each of the 47 capability stories, for example `docs/stories/admissions.CAP.admission_decision_recording.md:35-39`.

**Exists today:**

- The charter and directive mechanisms.
- 47 written Workflow lists, in this repo's stories, not attached to the agent.

**Missing:**

- **No charter for `AdmissionsDomainAgent` is defined in the repo.** Whether one exists in production is **unknown**.
- **Which procedure the agent runs first is undecided.** No capability is validated, and story `RESEARCH-5` is where three candidates get proposed.
- **The charter would also have to resolve the scope mismatch** between the agent's description and the domain.

**First honest version:**

- A charter Taiwo writes, naming the capabilities in scope.
- One Workflow list from one validated capability, loaded as a directive.
- Every human-reserved workflow keeps its human-approval step (document 01).

## 7. Coordination: gap (does not exist)

**Maps to:** nothing that hands work between agents.

**Exists today:** three things that look like coordination but are not:

| What | What it actually does | Source |
|---|---|---|
| Dara's handoff | Opens an `agent_handoff` ticket to Dara's human manager. "No AI employee has a matching capability to hand off TO yet" | `curriculum/daraHandoffService.ts:7-18` |
| `reports_to_type: 'agent'` | A reporting chain used to find the human assignee of a ticket. It "always resolves to a human at the end" | `AiAgent.ts:251-258` |
| `AdmissionsSuperAgent` | Reads other agents' status and writes a health report | `superAgentBase.ts:118-138`, document 01 |

**Missing:** agent-to-agent handoff, which is ladder level R8 (`autonomyLadder.ts:67`). Real coordination would need all of these:

1. A second AI employee with a matching capability to receive the work.
2. A capability whose ceiling is raised to R8. Today none of the 47 is above R7 (document 01).
3. A handoff record naming an agent recipient. Dara's ticket was built "agent-name-agnostic" for exactly this future (`daraHandoffService.ts:15-18`), but it has never had an agent recipient.
4. A reporting line for `AdmissionsDomainAgent`. Ticket creation is rejected for an agent with no accountable human (`AiAgent.ts:243-247`).

**First honest version:** none. Escalation goes to Taiwo as a ticket, following Dara's pattern, once a reporting line exists.

## 8. Safeguards: partial

**Maps to:**

- **Release Zero floor:** disabled, no tools, `observe` (`domainAgents.ts:22-35`, `:66-72`).
- **Autonomy ladder caps** (`autonomyLadder.ts:195-220`):
  - no tool grants means R2 at most (`:207-211`)
  - production needs a separately approved pilot (`:202-205`)
  - human decisions are held at R5 (`:213-219`)
- **Per-agent limits:** `max_runs_per_hour`, `max_writes_per_execution` and `max_proposals_per_run` (`AiAgent.ts:230-232`).
- **Write audit:** every attempted write is recorded with `was_allowed` and `blocked_reason` (`AgentWriteAudit.ts:4-19`, `:107`).
- **Tool kill switch** (`agentToolRegistry.ts:28-34`).

**Exists today:** all of the above. For this domain, admission decisions are also reviewer-only at the state machine (`docs/stories/admissions.CAP.admission_decision_recording.md:75`).

**Why "partial" and not "in place":** two safeguards in this domain fail open.

1. **The authorization gate.** `authorizeAgentAction` runs in **shadow mode by default**. It logs what it would deny and "only BLOCKS when `abac_enforcement === 'enforce'`", and it "FAILS OPEN" on error (`agentAuthorizationService.ts:4-10`, `:39-48`). Whether production has enforcement turned on is **unknown**.
2. **Maya's document-send check.** When the workflow-stage check (`canDeliverDocument`) throws an error, `send_document` refuses only the executive briefing. It still emails the program overview, enterprise guide and pricing guide (`mayaActionService.ts:276`, `:281-296`).

The second path belongs to Maya, not to `AdmissionsDomainAgent`. It still counts here for two reasons. It is the domain's only live, model-triggered outbound action. And it is exactly the kind of tool the employee must not inherit by copying Maya's pattern (document 01, finding 1).

Neither path can be triggered by `AdmissionsDomainAgent` today, because it is disabled with no tools. The employee's own floor holds. The safeguards around it are what fall short.

**First honest version:**

- Keep the Release Zero floor until Taiwo approves a capability.
- Before any tool is granted, confirm `abac_enforcement` is `enforce` for this agent's actions.
- Any check guarding an action the employee is later granted must fail **closed**: on error, refuse. This is the opposite of `mayaActionService.ts:291-296`.
- Whether Maya's own check should change is a separate decision for Taiwo. This project does not change it.

## 9. Verification: unknown

**Maps to:**

- **`promotionCriteria.ts`**, which refuses to count story completion, elapsed time, a good conversation or a mocked test as evidence (`:6-16`). A threshold stays `proposed` until a named human accepts it (`:18-22`).
- **Run evidence:** `ai_agent_activity_logs` (`AiAgentActivityLog.ts:6-20`, `:119`) and `agent_runs`, which is shadow-mode only today (`AgentRun.ts:4-6`, `:111`).
- **The six-dimension trust gate** for production-bound agents (`DeliveryAgentTrustRequirement.ts:4-15`, `:93`).

**Exists today:** the framework for evidence-based promotion.

**Missing:**

- **No reference outcomes and no accepted thresholds exist in this repo** for any Admissions capability. Whether any exist in production is **unknown**.
- **No run history**, because the agent has never run. `docs/DATA_CONTRACT.md:169` says the same.

**First honest version:** for the first capability, Taiwo accepts:

- one measurable threshold (`accepted_by` and `accepted_at` set),
- a small set of reference outcomes he has checked by hand,
- and the evidence of done: a named passing test or a counted query, per the story's own rule.

Shadow runs are compared against those outcomes before any R6 pilot.

---

## Consistency with document 01

| Topic | How this document relates |
|---|---|
| The recommendation | **Consistent.** A tool-using agent on fixed workflows: Tools grants single, scoped tools; Procedures loads written Workflow lists; Coordination stays absent |
| Maya vs the AI employee | **Consistent.** Maya is the live applicant chat with its own tools; the AI employee is `AdmissionsDomainAgent` |
| "No AI employee" | **Corrected in document 01.** It now says `AdmissionsDomainAgent` exists but is disabled, has no tools, sits at `observe` and has no reporting line ("What this domain does NOT need", point 2, and the figures table). Its conclusion, no multi-agent system, is unchanged |

## Findings for Taiwo to decide on

1. **You probably cannot open your agent's Talk, memory, charter or directives screens.** See Communication. This is derived from code and not tested; a platform admin can confirm it in one attempt.
2. **The agent's description says it owns lead intake only**, while the domain has 47 capabilities. Which scope is right is your call, and it goes in the role charter.
3. **The capability tool names are not implemented anywhere** in the platform. Every capability needs at least one new tool built before it can do anything beyond R2.

## Unknown

- What `system_prompt`, role charter, memories or directives `AdmissionsDomainAgent` holds in production. The repo seeds none; only a production query can answer.
- Which model production uses (the `AI_MODEL` environment variable).
- Whether `abac_enforcement` is `enforce` in production.
- Whether the `AdmissionsDomainAgent` row exists in production. It is seeded on boot (`agentRegistrySeed.ts:2856`, `:3262`), but not confirmed.

## Sources

**This repo**
- `docs/discovery/01-system-classes.md`: the recommendation and capability figures
- `docs/stories/admissions.RESEARCH-2-AGENT-ANATOMY.md:3-7`: the brief
- `docs/stories/admissions.CAP.admission_decision_recording.md:35-45`, `:75`: an example Workflow list, its inputs, and the reviewer-only rule
- `docs/DATA_CONTRACT.md:169`: no agent run history

**Platform, commit `36c8e38`, under `backend/src/` unless noted**

*The agent*
- `services/agentRegistry/domainAgents.ts:3-38`, `:66-79`, `:112-120`
- `services/agentRegistrySeed.ts:13`, `:2856`, `:3262`
- `services/agentDomain/domainAgentIdentitySeed.ts:6-29`, `:61-62`, `:101-130`
- `services/agentDomain/agentDomainRegistry.ts:150-158`, `:177`

*Reasoning and communication*
- `services/agentManagerConversationService.ts:35-40`, `:63`, `:503-513`
- `services/agentBlueprint/agentManagerConversationPrompt.ts:91-124`
- `routes/admin/agentManagerConversationRoutes.ts:11-12`
- `middlewares/agentManagerAuthMiddleware.ts:43`, `:50-94`
- `frontend/src/pages/admin/AgentDetailPage.tsx:13`, `:368-386`

*Memory and procedures*
- `models/AgentMemoryProposal.ts:6-14`, `:109`
- `services/agentMemoryProposalService.ts:116`, `:132`
- `routes/admin/agentMemoryProposalRoutes.ts:17-24`
- `models/AgentRoleCharter.ts:4-15`, `:120`
- `routes/admin/agentRoleCharterRoutes.ts:13-14`
- `routes/admin/managerDirectiveRoutes.ts:12-14`
- `models/AgentManagerConversation.ts:188`, `models/AgentManagerMessage.ts:50`

*Domain data*
- `models/AdmissionsMemory.ts:116`
- `models/AdmissionsKnowledgeEntry.ts:90`
- `models/ChatConversation.ts:25`, `:132`
- `models/ChatMessage.ts:14`, `:60`

*Tools*
- `services/agents/tools/agentToolRegistry.ts:10-34`
- `services/agents/tools/types.ts:12`, `:15`
- `services/agentDomain/capabilities/admissions.json:72`

*Coordination*
- `services/curriculum/daraHandoffService.ts:7-18`
- `models/AiAgent.ts:243-258`

*Safeguards*
- `models/AiAgent.ts:230-232`, `:240`
- `models/AgentWriteAudit.ts:4-19`, `:107`
- `services/agentAuthorizationService.ts:4-10`, `:39-48`
- `services/mayaActionService.ts:276`, `:281-296` (document-send check that fails open)
- `services/agentDomain/autonomyLadder.ts:61-67`, `:195-220`

*Verification*
- `services/agentDomain/promotionCriteria.ts:1-22`
- `models/AiAgentActivityLog.ts:6-20`, `:119`
- `models/AgentRun.ts:4-6`, `:111`
- `models/DeliveryAgentTrustRequirement.ts:4-15`, `:93`
