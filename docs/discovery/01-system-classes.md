# Which class of AI system Admissions needs

**Story:** `admissions.RESEARCH-1-SYSTEM-CLASSES` · **Domain:** Admissions & Applicant Experience
**Accountable human:** Taiwo Oludimimu · **Status:** draft for review, nothing here is validated yet
**Platform evidence read at:** `ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator` commit `36c8e38` (4:24 PM CDT on 2026-10-22). Platform `file:line` citations below are against that commit. Paths that start with `docs/` or `.colaberry/` are in this repo.

## The answer in one paragraph

Admissions needs **one tool-using agent that runs pre-written workflows**. It does not need a multi-agent system. The reason is in the domain's own numbers. Of its **47 candidate capabilities**, **17 are reserved to a human at every level**, and the platform holds any human decision at autonomy R5 or below, so those 17 can prepare and propose but never act. The other 30 top out at R7, which means automating one explicitly authorized action class at a time. **None of the 47 reaches R8**, the level where agents hand work to each other. And all 47 already have their steps written down, so the agent does not have to plan its own sequence.

## The five classes, and where Admissions sits on each

I map each class to the platform's own autonomy ladder (`autonomyLadder.ts:58-69`). That mapping is my reading; the platform does not name these classes itself.

### 1. Chatbot

Answers from a knowledge source and takes no action. This is ladder level R2 (`autonomyLadder.ts:61`), where the platform also caps any capability with no tool grants (`autonomyLadder.ts:207-211`). Six Admissions capabilities have an R2 ceiling, and all six are human-reserved.

### 2. Fixed workflow

The same steps run in the same order on a schedule or an event, and no model picks the next step. Of the 28 inherited registry rows, 16 are cron jobs of this kind, for example visitor activity enrichment every 10 minutes (`agentRegistrySeed.ts:811-812`). All 47 capability stories specify their process as a fixed **Workflow** step list.

### 3. Tool-using agent

A model picks which tool to call, from a fixed set, inside one bounded turn. Maya, the live applicant chat, already is one: 10 tools (`mayaActionService.ts:26-198`), chained for at most 5 rounds per message (`chatService.ts:408-417`). The nearest ladder step is R3 (`autonomyLadder.ts:62`).

### 4. Agentic system

Pursues a goal over many steps, keeps state, and decides its own sequence and when it is done; the closest ladder step is R4 (`autonomyLadder.ts:63`). The nearest thing on the platform, `AdmissionsConversionArchitect`, can create initiatives and tickets (`agentRegistrySeed.ts:1949-1958`). Its own description says it cannot close its loop, because "Initiative.status has no write path" (`agentRegistrySeed.ts:1956`).

### 5. Multi-agent system

Several agents divide a job and hand work to one another; this is ladder level R8 (`autonomyLadder.ts:67`). `AdmissionsSuperAgent` is not one: it reads the other agents' status and writes a health report (`admissionsSuperAgent.ts:11`, `superAgentBase.ts:118-138`), which is aggregation, not handoff.

## The recommendation, in this domain's numbers

**Admissions needs a tool-using agent whose workflows are fixed in advance.**

| Figure | Value | Source | What it rules in or out |
|---|---|---|---|
| Candidate capabilities | 47 | `docs/stories/admissions.RESEARCH-1-SYSTEM-CLASSES.md:5` | The size of the job |
| Human-reserved at every level | 17 (36%) | same line; 17 story files carry "THIS IS A HUMAN DECISION" | These may prepare, never act. The platform caps a human decision at R5 (`autonomyLadder.ts:213-219`) |
| Other capabilities | 30 | 47 − 17 | Ceilings: 17 at R7, 6 at R6, 2 at R5, 5 at R4 |
| Highest ceiling of all 47 | R7 | the "ceiling" line in each `docs/stories/admissions.CAP.*.md` | R7 is automating one explicitly authorized action class (`autonomyLadder.ts:66`), not open-ended goals |
| Capabilities at R8 or R9 | 0 | same | No capability is ever expected to hand work to another agent |
| Capabilities with a pre-written step list | 47 | `**Workflow**` heading in each CAP story | The sequence is specified, so the agent does not need to plan it |
| Capabilities needing any default-denied capability | 0 | each CAP story's tool list states this | The tool set is reads, sandbox writes, text generation and rendering. 41 of 47 need `sandbox_postgres_read` |
| Live AI employees in the domain | 0 (1 created, not alive) | `agentDomainRegistry.ts:177` (`agent_id: null`); `domainAgents.ts:22-35`, `:112-120` | `AdmissionsDomainAgent` exists but is disabled with no tools, so there is no working agent to coordinate with |

### The argument depends on these numbers

**What the 17 human-reserved capabilities require in the design.** Each of their workflows must contain a **human-approval step** between what the agent prepares and anything that changes state or reaches an applicant. In practice:

- **The agent's output is a draft, a packet or an answer.** It never records a decision.
- **A named human approves it.** That approval is recorded against the person's own authenticated identity. The decision-recording story requires `decided_by` to come "from the session, never from the request body" (`docs/stories/admissions.CAP.admission_decision_recording.md:38`).
- **A failure never advances anything.** A model or tool failure must never move an application to an approved stage (same file, `:54`).

The platform enforces the ceiling. It holds human decisions at R5 whatever their listed ceiling (`autonomyLadder.ts:213-219`), and for admission decisions the state machine offers only the reviewer as an actor (same file, `:75`). So the approval step is a structural part of 17 of the 47 workflows, not an option the agent can skip.

**When chatbot plus fixed workflows would be the better recommendation.** This threshold is **my own reasoning, not a platform rule**. Here is how I got it:

1. **What the agent is for.** A tool-using agent earns its cost through capabilities that reach production and run without a human approving each output, meaning an R6 pilot or R7 automation. Everything at R5 or below can be built as a fixed workflow with a model-drafting step and a human approval.
2. **Today.** 23 of the 47 capabilities reach R6 or above (17 at R7, 6 at R6). All 23 are among the 30 that are not human-reserved, because human-reserved capabilities are held at R5.
3. **My cut-off.** I judge that once **5 or fewer** capabilities reach production (about 10% of 47), it is cheaper to write each as its own fixed workflow than to build and govern one agent. The number 5 is a judgement call.
4. **What has to move.** Getting from 23 to 5 means 18 of those capabilities becoming human-reserved: 17 + 18 = **35**. If the R4 and R5 ones (7 of them) were reserved first, it would take 17 + 7 + 18 = **42**.

So chatbot plus fixed workflows would become the better recommendation at **roughly 35 to 42 human-reserved capabilities out of 47**, about three-quarters or more. At today's 17 (36%), the domain is well short of that.

The other direction matters too:

- **If no capability were human-reserved and ceilings still stopped at R7,** the recommendation would stay a tool-using agent, with more action classes running unattended.
- **If any capability's ceiling were R8,** a multi-agent design would have to be considered. Today none is.

## What this domain does NOT need

**Admissions does not need a multi-agent system.** Three facts, each sourced:

1. **No capability is ever expected to coordinate.** 0 of 47 ceilings reach R8 (`autonomyLadder.ts:67`).
2. **There is no working agent to coordinate with.** On the platform, "AI employee" is a specific role, separate from Maya and the 28 legacy registry rows. Admissions has one such row, `AdmissionsDomainAgent` (`domainAgents.ts:112-120`), but it was created "not alive":

   - disabled (`enabled: false`)
   - no tools (`tools_granted: []`)
   - autonomy `observe`
   - no reporting line

   (`domainAgents.ts:22-35`, `:66-72`.) The domain registry's `agent_id` does not yet point to it either (`agentDomainRegistry.ts:73-74`, `:177`). An agent that is disabled and holds no tools cannot take part in a handoff, so this point stands. See [document 02](02-agent-anatomy.md) for the full picture.
3. **The platform already tried splitting this work into agents, and the split did not survive.** 11 Admissions agents are on the platform's unwired list: all 9 on-demand ones (conversation planning, knowledge retrieval, page context and others) and 2 event-driven ones (`agentRegistryAuditClassification.ts:52-62`). The work of the three Maya-related ones now runs inside the single Maya pipeline (`docs/stories/admissions.LEGACY-MIGRATION-PLAN.md:13`, `:15-16`).

It also does not need an agentic system **yet**; see the next section.

## What would justify the next class up

The next class up is an agentic system. It is justified for a specific capability when **all three** of these are true:

1. **The steps cannot be written down in advance.** Taiwo confirms that a capability's Workflow list cannot be fixed, because the right next step depends on what the agent finds. Today every one of the 47 has a fixed list.
2. **It has earned production.** The capability is not human-reserved, has passed R5 shadow evaluation against approved reference outcomes (`autonomyLadder.ts:64`), and Taiwo has separately approved an R6 production pilot. Production is never reached by approval alone (`autonomyLadder.ts:202-205`).
3. **It can close its own loop.** The agent has a write path to record that its goal is done. The nearest candidate today, `AdmissionsConversionArchitect`, lacks one (`agentRegistrySeed.ts:1956`).

**Multi-agent, beyond that,** would need a capability's ceiling raised to R8 and a second AI employee assigned to the domain.

## Findings for Taiwo to decide on

These came up while checking the evidence. None of them is changed by this document.

1. **Live Maya can already send things on its own.** Four of its ten tools act outside the platform:
   - `send_document`, which emails the applicant through `sendAdmissionsDocument` (`mayaActionService.ts:10`, `:74`)
   - `send_sms_summary` (`:95`)
   - `initiate_voice_call` (`:107`)
   - `enroll_in_campaign` (`:159`)

   The Maya capability story lists none of these tools (`docs/stories/admissions.CAP.maya_applicant_chat_response.md`). Its R7 ceiling covers only "reply from approved admissions knowledge". Also, when the workflow-stage check itself throws an error, `send_document` still sends every document type except the executive briefing (`mayaActionService.ts:291-296`).

   **Question:** are these four tools in scope for this plan, or should the plan record them explicitly as live behaviour it does not cover?

2. **Four human-reserved capabilities list ceilings the platform will not honour.** The platform caps human decisions at R5 (`autonomyLadder.ts:213-219`), but four stories list higher ceilings:

   | Capability | Listed ceiling | Story file |
   |---|---|---|
   | `admissions_knowledge_curation` | R6 | `admissions.CAP.admissions_knowledge_curation.md:72` |
   | `admissions_rbac_path_coverage_audit` | R7 | `admissions.CAP.admissions_rbac_path_coverage_audit.md:65` |
   | `applicant_pii_minimization_review` | R7 | `admissions.CAP.applicant_pii_minimization_review.md:66` |
   | `scheduler_registry_name_drift_reconciliation` | R7 | `admissions.CAP.scheduler_registry_name_drift_reconciliation.md:68` |

   Their effective ceiling is R5.

3. **One blocker in the stories is out of date.** The stories say Taiwo "has no admin_users row" (citing `agentDomainRegistry.ts:148-151`). The platform corrected that on 2026-10-15: he has a full admin login as `taiwo@colaberry.com` (`agentDomainRegistry.ts:148-153`, `can_reach_surface: true` at `:175`). The stories also cite `:155` for "no AI employee exists". The registry pointer is still `null`, now at `:177`, but an AI employee row does exist, unlinked and not alive (`domainAgents.ts:112-120`); see point 2 under "What this domain does NOT need".

4. **Some line references have drifted.** For example, the migration plan cites `agentRegistrySeed.ts:957` for the appointment agent, which is at `:959` at this commit.

## Unknown

- **Whether any Admissions agent is running in production right now.** The registry seed is a declaration, not a run history. Answering this needs a query of the production agent run tables, which this repo cannot reach.
- **Whether the 15 legacy records marked "migrated" match the registry by name.** The brief names only the other 13, and I matched all 13 to registry rows. The 28-row total matches what I counted in the seed (16 cron, 9 on-demand, 3 event-driven), but I did not check the migrated 15 one by one.
- **Whether Taiwo agrees with any ceiling.** All 47 capabilities are `draft`; none has been reviewed.

## Sources

**This repo**
- `docs/stories/admissions.RESEARCH-1-SYSTEM-CLASSES.md:5`: 47 capabilities, 28 legacy records, 17 human-reserved
- `.colaberry/plan.seed.json:828`: the same figures in the plan seed
- `docs/stories/admissions.CAP.*.md` (47 files): ceilings, the human-decision marker, Workflow lists and tool lists. Counts come from reading each file's "Starting autonomy … ceiling" line and its "THIS IS A HUMAN DECISION" line.
- `docs/stories/admissions.CAP.admission_decision_recording.md:38`, `:54`, `:75`: the human-approval mechanics
- `docs/stories/admissions.LEGACY-MIGRATION-PLAN.md:3-8`, `:13`, `:15-16`: legacy dispositions and the agents Maya superseded

**Platform, commit `36c8e38`**
- `backend/src/services/agentDomain/autonomyLadder.ts:58-69` (level meanings), `:202-205` (production needs a pilot), `:207-211` (no tools caps at R2), `:213-219` (human decisions capped at R5)
- `backend/src/services/agentRegistrySeed.ts:795-1027` (23 Admissions intelligence and operations rows), `:1208`, `:1689`, `:1949-1958`, `:2119`, `:2181-2189`
- `backend/src/services/agentRegistryAuditClassification.ts:52-62` (11 unwired Admissions agents: 9 on-demand, 2 event-driven)
- `backend/src/services/agentDomain/agentDomainRegistry.ts:73-74` (what `agent_id` means), `:142-181` (the Admissions domain entry)
- `backend/src/services/agentRegistry/domainAgents.ts:22-35`, `:66-72`, `:112-120` (`AdmissionsDomainAgent` and its Release Zero floor)
- `backend/src/services/agents/departments/superAgents/admissionsSuperAgent.ts:11`, `superAgentBase.ts:113-138`
- `backend/src/services/chatService.ts:397-467` (Maya's bounded tool loop)
- `backend/src/services/mayaActionService.ts:10-21`, `:26-198`, `:237-257`, `:281-296` (Maya's tools and the document-send check)
- `backend/src/services/mayaToolsService.ts:251`, `:316` (the SMS and voice-call handlers)
