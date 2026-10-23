# admissions.LEGACY-MIGRATION-PLAN — Legacy migration plan

Disposition of this domain's 28 inherited legacy agent record(s).

- **migrated_to_capability**: 15
- **superseded**: 8
- **retired**: 4
- **unknown**: 1

### Superseded (8) -- functionality carried forward
- `AdmissionsAppointmentSchedulingAgent` -> admissions.appointment_booking_assistance: Superseded by the live public booking routes rather than retired outright. Its source exists (admissionsAppointmentAgent.ts, registered at agentRegistrySeed.ts:957) but it is in ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62): its only caller outside its own definition is the unconsolidated duplicate aiOrchestrator-Ali-AI.ts, so no route and no live code path can reach it. The business outcome it aimed at is already served by GET /api/calendar/availability and POST /api/calendar/book (calendarRoutes.ts:6-7), which is where the capability points. What is deliberately NOT carried forward is its automatic scheduling authority, because booking writes into a named colleague's calendar.
- `AdmissionsCallGovernanceAgent` -> admissions.outreach_compliance_monitoring: Superseded rather than retired because the rule it enforced is still needed and still in code. It is ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62) so nothing can invoke it, but its 24-hour approval rule and CallContactLog history check are the same control the compliance capability carries, and the live internship call path already implements the equivalent refusals at internshipCallService.ts:16-22. The capability's implementation_state is recorded as partial precisely because this half of it has no live caller.
- `AdmissionsConversationPlanningAgent` -> admissions.maya_applicant_chat_response: Superseded by the live in-process prompt pipeline. It is ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62) and specifically not reachable from chatService.ts, which is the surface a conversation-planning agent would have to serve. Deciding the conversation goal and next-message strategy is now done inside buildMayaSystemPrompt (admissionsMayaService.ts:11) at request time, which is both live and cheaper than a separate scheduled planner.
- `AdmissionsEmailAgent` -> admissions.applicant_reply_draft_preparation: Superseded in half and denied in half, which is the honest description. It is ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62), confirmed_dead with disable true, and its SMTP sending behaviour (agentRegistrySeed.ts:937-944) requires the default-denied live_email capability (executionPolicy.ts:27). The drafting half survives as the proposed draft-preparation capability, where a human reads and sends; the sending half is not carried forward at any autonomy level and is recorded as a blocker rather than as a tool.
- `AdmissionsKnowledgeAgent` -> admissions.maya_applicant_chat_response: Superseded by the live retrieval path. It is ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62), but its function, RAG retrieval from AdmissionsKnowledgeEntry, is performed live and synchronously by admissionsKnowledgeService.ts:8 findRelevantKnowledge and :75 buildKnowledgeContext, which the chat capability depends on. Retrieval belongs inside the request that needs it, not in a scheduled agent.
- `AdmissionsPageContextAgent` -> admissions.maya_applicant_chat_response: Superseded by the same live prompt pipeline. It is ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62). Page-specific conversation hints are assembled at request time inside buildMayaSystemPrompt (admissionsMayaService.ts:11) and generateMayaGreeting (:259), which already anticipates intent per landing page.
- `AdmissionsReportingAgent` -> admissions.daily_enrollment_report: Superseded by the manager-defined reporting cadence. It is the first entry in REPORTING_UNWIRED (agentRegistryAuditClassification.ts:36-43): its source exists on the shared departmentReporterAgent.ts, but it is referenced only by the seed file that registers it, with no cron entry, no route and no caller. Its registry row declares trigger_type cron and schedule '0 5 * * *' (agentRegistrySeed.ts:1691-1692) and that schedule is inert, because aiOpsScheduler.ts contains no AdmissionsReportingAgent registration. Its KPI set (conversion rate, show rate, velocity, deal cycle) is replaced by the four reports Taiwo's own brief specifies, which have a named owner and a named recipient where this had neither.
- `AdmissionsSynthflowCallAgent` -> admissions.ai_voice_interview_dispatch: Superseded by the live applicant-initiated call service. It is ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62), confirmed_dead with disable true. The same outcome is served by internshipCallService.ts, which differs in the way that matters: the call is requested by the applicant, gated on three recorded consent columns, rate-limited to six per hour, and degrades to no call when the dedicated agent id is unset. The legacy agent's mandatory 24-hour governance approval (agentRegistrySeed.ts:967-974) is carried into admissions.outreach_compliance_monitoring rather than lost.

### Retired (4) -- and why each is safe to lose
- `AdmissionsCEORecognitionAgent`: Retired on three grounds, not one. First, it is unreachable: ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62), confirmed_dead with disable true, its only caller the duplicate orchestrator file. Second, no manager-defined or application requirement asks for it: neither Taiwo's role brief nor the consolidation scope line mentions executive recognition. Third, and the reason it should not be revived rather than merely left dormant, it identifies a named individual from behavioural signals in order to treat them differently, which is a profiling behaviour with no approval path, no documented business measure and a clear re-identification surface. The absence of a requirement plus the presence of a privacy cost is a retirement, not a deferral.
- `AdmissionsDocumentDeliveryAgent`: Retired because its entire function is an outbound send that no agent in this matrix may perform. Its seed description (agentRegistrySeed.ts:927-934) is sending briefing, overview, enterprise-guide and pricing documents to prospects, which requires the default-denied live_email capability (executionPolicy.ts:27). It is also unreachable today: ADMISSIONS_ON_DEMAND_UNWIRED, confirmed_dead with disable true. Note what this is NOT: it is unrelated to the internship offer-letter package, which is a separate live service (internshipDocumentService.ts) and is captured as admissions.offer_document_package_generation. Conflating the two would have smuggled a dead marketing-collateral sender into a live contractual-document capability.
- `AdmissionsSMSAgent`: Retired because it is an outbound contact channel with no surviving capability and no requirement. It is ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62), confirmed_dead with disable true. Its function, sending summaries, reminders and links by GoHighLevel SMS (agentRegistrySeed.ts:947-954), reaches an applicant's phone, and no document in this domain asks for SMS: Taiwo's role brief names no SMS channel and the consolidation scope line names communications generically without specifying one. An unrequested outbound channel to a person's phone is retired rather than carried as a candidate.
- `Enterprise_Opportunity_Agent`: Retired as confirmed dead, and independently re-verified for this matrix. It is the first entry in NO_SOURCE_FILE (agentRegistryAuditClassification.ts:23-32), whose definition is that the registry row names a source_file path at which nothing was ever written. Its declared path is backend/src/services/agents/admissions/enterpriseOpportunityAgent.ts; I listed that directory on 2026-10-09 and found 24 files, none of them this one, so the classification still holds. Its stated function, detecting enterprise buying signals, is in any case already live under admissions.enterprise_high_intent_flagging, which is cron-wired and has a real source file. There is no code to migrate and no uncovered outcome to preserve.

**A `retire` marking is not self-justifying.** Across three domains in this programme, 28 of 39 rows marked `retire` turned out to hold live, reachable code. Each retirement above states why, and each needs the manager's confirmation.

### Unresolved (1) -- what would settle each
- `AdmissionsVisitorIdentityAgent`: Recorded as unknown rather than retired, because retiring it may leave a live column unwritten and I could not establish that it would not. It is ADMISSIONS_ON_DEMAND_UNWIRED (agentRegistryAuditClassification.ts:56-62), so on wiring grounds it looks dead like its ten siblings. But its output, admissions_memory.visitor_type (AdmissionsMemory.ts:45), is read by a live path: generateMayaGreeting (admissionsMayaService.ts:259) varies the greeting by visitor type. I did not determine which component currently writes that column, so I cannot say whether retiring this agent removes a redundant writer or the only writer. Resolving it needs one question answered, which component writes admissions_memory.visitor_type today, and the honest disposition until then is unknown rather than a retirement that might silently degrade the live greeting.

These are recorded as `unknown` rather than guessed. "No useful legacy functionality is silently lost" is the rule, and an unexamined row is exactly where loss hides.

### Not covered by this plan
The 21 legacy records whose `proposed_owner_domain` is `unresolved` belong to no domain and are therefore not in any project's plan. Five of them are live production rows. They need an owner decision, and naming that here is the point.

**Release:** r1 · Legacy migration plan (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Legacy migration plan
**Domain:** Admissions & Applicant Experience · **Release:** Legacy migration plan · **Story:** `admissions.LEGACY-MIGRATION-PLAN`
**Accountable human:** Taiwo Oludimimu · **Deliverable:** `docs/migration/legacy-migration-plan.md`

## What this is

This is Claude Code work, and the product is a written document. There is no feature to ship
and no agent to switch on. The document is the thing your manager reviews, so it is written
to be read by them rather than by you.

## The specification is the brief on this story, not this prompt

Read the brief above this prompt on the story page. It names this domain's real figures, your
accountable human, and the specific blockers discovery already found. **Those numbers are not
repeated here on purpose:** a second copy drifts from the first, and then nobody knows which
is true. Work from the brief; this prompt tells you how to turn it into a document.

## How to build it

- The brief already contains the disposition of every inherited legacy record for this domain, with reasons and `file:line` evidence. **Your job is not to redo that work.** It is to turn it into a plan a manager can act on, and to check it.
- Verify a sample against the repo. Open two or three of the cited `file:line` references with Claude Code and confirm they say what the brief claims. Record which ones you checked.
- Every record marked `unknown` is the real work. For each, say what single question would resolve it and who can answer.

## What the document must contain

- A disposition table: one row per legacy record, its category, and its successor capability where there is one.
- The `unknown` records called out separately, each with the question that resolves it and the person who can answer.
- Which citations you personally verified, and what you found.
- A sequence: what has to be decided first, and what is blocked until it is.
- Anything in the brief you believe is WRONG, with your evidence. Discovery was done at speed and finding an error in it is a better outcome than agreeing with all of it.

Write it as Markdown with real headings. A wall of prose is not a deliverable, and neither is
a bulleted restatement of the brief.

## Evidence this is done

Cite the real thing. For this story that is the committed file `docs/migration/legacy-migration-plan.md`, and inside it,
every claim carrying either a source or the word unknown.

**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, a document that restates the brief without answering it, or a confident sentence
with no source. Your accountable manager evaluates the evidence.

**Unknown is a real answer and is worth more than a guess.** Several of these questions have
no source material in this repository. Writing "the source does not exist, and here is what
would have to be written" is a complete answer, not a failure to find one.

## Before you start

- **The platform source is PUBLIC. You do not need access granted.** Wherever this brief
  cites a file like `backend/src/services/agentRegistrySeed.ts`, it means the Colaberry
  platform repository:
  **https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator**
  Clone it read-only beside your own project and point Claude Code at it. Sarbjit hit this
  within hours of starting and was right to stop rather than invent an answer: a brief that
  cites a path without naming its repository is the brief being wrong, not you.
- **Nothing in this story authorizes an outbound message.** Do not send an invitation, an
  email or a direct message, and do not record a meeting as booked. Arranging anything with a
  person is a human action taken outside this project.
- **Nothing here changes an agent.** Do not enable one, grant it a tool, or raise an autonomy
  level. A capability stays `draft` until your manager has actually reviewed it.
- Your repo may not be connected yet. The prompt works either way; the story cannot be
  verified and no points are awarded until a repo is connected, because verification is a
  read of your repo.

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The plan accounts for every inherited legacy record for this domain, each one kept, merged or retired with a reason.
- [ ] The migration is described as replayable: running it twice leaves the same end state, with no duplicated side effects.
- [ ] The plan states what happens to a record the migration cannot classify, rather than assuming none exist.

When every box above is ticked, stop and show the demo.
