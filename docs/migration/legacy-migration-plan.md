# Legacy migration plan: Admissions & Applicant Experience

**Story:** `admissions.LEGACY-MIGRATION-PLAN` · **Accountable human:** Taiwo Oludimimu · **Prepared by:** the intended builder, 2026-11-01
**Platform evidence:** `ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator` at commit `36c8e38`. Every `file:line` below is against that commit and sits under `backend/src/` unless another path is given.
**Status:** draft for Taiwo's review. This plan changes nothing. No agent, scheduler entry or registry row was touched, and nothing was sent.

---

## Summary

1. **All 28 inherited records are accounted for, and all 28 match a registry row by name.** The brief names only 13 of them. The other 15, marked migrated, are listed in the platform's capability file (`services/agentDomain/capabilities/admissions.json:5157-5354`). The table below lists all 28.
2. **Split:** 15 kept (migrated to a capability), 8 merged into a successor (superseded), 4 retired and 1 undecided (unknown). These counts match the brief (`docs/stories/admissions.LEGACY-MIGRATION-PLAN.md:5-8`).
3. **The migration changes no running job.** The 15 kept records are already live on cron and stay as they are. The 12 superseded or retired records are already unreachable; the migration only holds them switched off, through a mechanism that is safe to repeat (`agentRegistrySeed.ts:3125-3160`).
4. **I found five things in the brief that I believe are wrong or incomplete.** The most important: `AdmissionsCallGovernanceAgent`'s code is **still called by two live jobs**, and the one "unknown" record can largely be answered from the code. See [What I believe is wrong in the brief](#what-i-believe-is-wrong-in-the-brief).
5. **The biggest replay risk is a second scheduled job.** 11 of the 15 live jobs run under a scheduler name that differs from their registry name, so any step that switches a job off or re-registers it by the wrong name would either do nothing or start a duplicate. That step is blocked until the naming is reconciled.
6. **Taiwo's duplicate-contact concern applies here.** Four retired or superseded records sent emails, texts, documents or calls on channels that Maya and Cora already use. The plan never brings any of them back, at any autonomy level.

---

## How to read the dispositions

The acceptance criteria say each record is "kept, merged or retired". The platform uses four labels (`services/agentDomain/capabilityRecord.ts:42-46`). They map like this:

| Platform label | In this plan | What it means |
|---|---|---|
| `migrated_to_capability` | **Kept** | The job keeps running unchanged, now owned by a named capability |
| `superseded` | **Merged** | The record is held off; what it did is already done by its successor capability |
| `retired` | **Retired** | The record is held off; nothing replaces it, with a stated reason |
| `unknown` | **Undecided (held)** | Nothing changes until one named question is answered |

None of these is confirmed. Every capability is still `draft` and waits on Taiwo (`admissions.json`, notes, "NOTHING IN THIS FILE IS CONFIRMED").

---

## Disposition table: all 28 records

**Registry line** is where the record's entry sits in `services/agentRegistrySeed.ts` today, which I located by name.
**Scheduler entry** is the job's registration in `services/aiOpsScheduler.ts`. The ⚠ mark means the scheduler name differs from the registry name.

### Kept: 15 records (`migrated_to_capability`)

| # | Legacy record | Registry line | Scheduler entry (name, line) | Successor capability | Reason (from `admissions.json`, line corrected) |
|---|---|---|---|---|---|
| 1 | `AdmissionsAssistantAgent` | :1019 | ⚠ `AdmissionsAssistant`, :240 | `maya_applicant_chat_response` | Live; prepares call queues and checks eligibility. It is the operational half of the Maya assistant |
| 2 | `AdmissionsCallComplianceMonitor` | :989 | ⚠ `AdmissionsCallCompliance`, :237 | `outreach_compliance_monitoring` | Live; detects duplicate outreach and campaign conflicts |
| 3 | `AdmissionsCallbackManagementAgent` | :999 | ⚠ `AdmissionsCallbackManagement`, :238 | `callback_request_queue_management` | Live; works the callback queue. Admin view at `routes/admin/admissionsRoutes.ts:23` (not re-checked) |
| 4 | `AdmissionsConversationContinuityAgent` | :877 | ⚠ `AdmissionsConversationContinuity`, :233 | `conversation_continuity_stitching` | Live; one-to-one match |
| 5 | `AdmissionsConversationMemoryAgent` | :817 | ⚠ `AdmissionsConversationMemory`, :230 | `conversation_memory_summarization` | Live; its output feeds `buildMayaSystemPrompt` (`admissionsMayaService.ts:11`) |
| 6 | `AdmissionsConversationTaskMonitor` | :1009 | `AdmissionsConversationTaskMonitor`, :239 | `conversation_action_request_detection` | Live every 2 minutes; detects document, callback, email, text and appointment requests in chats |
| 7 | `AdmissionsConversionArchitect` | :1949 | `AdmissionsConversionArchitect`, :320 | `enrollment_conversion_strategy_proposals` | Live; reports to Taiwo. Its missing persona is carried as an unknown |
| 8 | `AdmissionsExecutiveUpdateAgent` | :917 | ⚠ `AdmissionsExecutiveUpdate`, :236 | `pipeline_executive_update` | Live every 4 hours; one-to-one match |
| 9 | `AdmissionsHighIntentLeadAgent` | :887 | ⚠ `AdmissionsHighIntentDetection`, :234 | `enterprise_high_intent_flagging` | Live; also writes `visitor_type = 'enterprise'` (`agents/admissions/admissionsHighIntentLeadAgent.ts:54-55`) |
| 10 | `AdmissionsInsightsAgent` | :907 | ⚠ `AdmissionsInsightsAggregation`, :235 | `visitor_insight_aggregation` | Live; admin view at `admissionsRoutes.ts:17` (not re-checked) |
| 11 | `AdmissionsIntentDetectionAgent` | :827 | ⚠ `AdmissionsIntentDetection`, :231 | `visitor_intent_scoring` | Live; writes `recommended_next_action`, which the greeting reads |
| 12 | `AdmissionsKnowledgeSyncAgent` | :2119 | `AdmissionsKnowledgeSyncAgent`, :338 | `knowledge_base_website_sync` | Live daily; keeps drafting and flagging, drops auto-update authority |
| 13 | `AdmissionsProactiveOutreachAgent` | :857 | ⚠ `AdmissionsProactiveOutreach`, :232 | `proactive_chat_eligibility_marking` | Live; sets a flag that opens Maya proactively (`agents/admissions/admissionsProactiveOutreachAgent.ts:46-50`) |
| 14 | `AdmissionsSuperAgent` | :2181 | `AdmissionsSuperAgent`, :352 | `department_signal_rollup` | Live twice an hour |
| 15 | `AdmissionsVisitorActivityAgent` | :807 | ⚠ `AdmissionsVisitorActivity`, :229 | `page_event_admissions_enrichment` | Live; one-to-one match |

**Plan action for all 15:** no change to the job, its schedule or its code. Record which capability now owns it.

### Merged: 8 records (`superseded`)

| # | Legacy record | Registry line | Reachable today? | Successor capability | Reason (short) |
|---|---|---|---|---|---|
| 16 | `AdmissionsAppointmentSchedulingAgent` | :959 | No, on the unwired list (`agentRegistryAuditClassification.ts:56-62`) | `appointment_booking_assistance` | Live booking routes do this (`routes/calendarRoutes.ts:6-7`). Its own scheduling authority is not carried forward |
| 17 | `AdmissionsCallGovernanceAgent` | :979 | **Its registry wrapper, no. Its code, yes:** two live jobs call it (see the [first correction](#1-admissionscallgovernanceagent-is-not-dead-code)) | `outreach_compliance_monitoring` | Its 24-hour rule is still needed |
| 18 | `AdmissionsConversationPlanningAgent` | :837 | No (`:56-62`) | `maya_applicant_chat_response` | Done inside `buildMayaSystemPrompt` at request time |
| 19 | `AdmissionsEmailAgent` | :939 | No (`:56-62`) | `applicant_reply_draft_preparation` | Drafting survives with a human sending. **Sending is not carried forward** (`live_email` is denied by default, `services/delivery/execution/executionPolicy.ts:27`) |
| 20 | `AdmissionsKnowledgeAgent` | :847 | No (`:56-62`) | `maya_applicant_chat_response` | Retrieval runs live inside the chat request |
| 21 | `AdmissionsPageContextAgent` | :867 | No (`:56-62`) | `maya_applicant_chat_response` | Page hints are built at request time |
| 22 | `AdmissionsReportingAgent` | :1689 | No: first entry in `REPORTING_UNWIRED` (`:36-43`), no scheduler entry | `daily_enrollment_report` | Its declared cron is inert. Replaced by Taiwo's own report spec |
| 23 | `AdmissionsSynthflowCallAgent` | :969 | No (`:56-62`) | `ai_voice_interview_dispatch` per the brief. **I believe this is the wrong successor** (see the [third correction](#3-the-synthflow-call-agents-successor-is-more-likely-the-callback-path-cora-than-the-internship-interview-call)) | Places voice calls after a 24-hour governance check |

**Plan action for all 8:** hold the registry row switched off (see [step 4](#the-steps)). Keep the source files, because #17's code is used live.

### Retired: 4 records

| # | Legacy record | Registry line | Reachable today? | Reason (short) |
|---|---|---|---|---|
| 24 | `AdmissionsCEORecognitionAgent` | :897 | No (`:56-62`) | No requirement asks for it, and it profiles a named person. **Note:** the same CEO classification still runs live in the chat path (see the [fourth correction](#4-retiring-admissionsceorecognitionagent-does-not-stop-ceo-classification)) |
| 25 | `AdmissionsDocumentDeliveryAgent` | :929 | No (`:56-62`) | Its whole job is an outbound send to prospects. It is unrelated to the internship offer-letter package |
| 26 | `AdmissionsSMSAgent` | :949 | No (`:56-62`) | An outbound text channel that nothing in this domain asks for |
| 27 | `Enterprise_Opportunity_Agent` | :1208 | No: no source file ever existed (`NO_SOURCE_FILE`, `:23-32`) | I listed `services/agents/admissions/` myself: 24 files, none named for this agent. Its function is live under `enterprise_high_intent_flagging` |

**Plan action for all 4:** hold the registry row switched off. Never revive.

### Undecided: 1 record (`unknown`)

| # | Legacy record | Registry line | Reachable today? | Status |
|---|---|---|---|---|
| 28 | `AdmissionsVisitorIdentityAgent` | :797 | No (`:56-62`) | Held. See the next section: the code answers most of the question |

**Totals:** 15 + 8 + 4 + 1 = 28. Every name in the platform's source list (`docs/architecture/ai-workforce-management/LEGACY_AGENT_CLASSIFICATION.csv:2-29`) appears once above.

---

## The unknown record: `AdmissionsVisitorIdentityAgent`

**The brief's question:** which component writes `admissions_memory.visitor_type` today? If this agent is the only writer, retiring it could silently degrade Maya's greeting (`docs/stories/admissions.LEGACY-MIGRATION-PLAN.md:29`).

**What the code shows.** It is **not** the only writer:

| Writer | Where | Live? |
|---|---|---|
| The chat start path calls the **same** classifier this agent uses, `classifyVisitorType`, and writes the result when it changes | `chatService.ts:177`, `:180-181`; the agent calls it at `agents/admissions/admissionsVisitorIdentityAgent.ts:3`, `:27-30` | Yes: every chat |
| `AdmissionsHighIntentLeadAgent` sets `enterprise` | `admissionsHighIntentLeadAgent.ts:54-55` | Yes, cron (`aiOpsScheduler.ts:234`) |
| `AdmissionsVisitorActivityAgent` creates rows as `new` | `admissionsVisitorActivityAgent.ts:59` | Yes, cron (`aiOpsScheduler.ts:229`) |
| The memory loader defaults to `new` | `admissionsMemoryService.ts:18` | Yes |

The greeting takes the visitor type as a parameter (`admissionsMayaService.ts:260`, `:265-267`). The chat path classifies the visitor (`chatService.ts:177`) and passes that fresh value into the greeting (`chatService.ts:225-226`). The greeting does not depend on this agent.

I also checked whether the batch runner that would call this agent, `runAllAdmissionsIntelligence` (`aiOrchestrator.ts:516-528`), is called from live code. It is not: its only definitions are in `aiOrchestrator.ts` and the duplicate `aiOrchestrator-Ali-AI.ts`, with no other caller. So this agent has not been reachable, and retiring it changes nothing that runs today.

**The one question still open:** *Has `AdmissionsVisitorIdentityAgent` run at all in production since its wrapper was found to be unwired (the 2026-07-31 audit, `agentRegistryAuditClassification.ts:52-55`)?* Its row's run count and last-run time would show it.
- **Who can answer:** Ali or a platform engineer with read access to production. This is a database read, not a code question, and this project has no production access.

**My recommendation, for Taiwo to accept or reject:** reclassify it as **merged** into `maya_applicant_chat_response`, because the chat path already does its job with the same function.
- **If it has not run:** do this now.
- **If it has run:** first find what called it, then decide. That caller would be a new finding.
- **Until then:** it stays undecided and nothing changes.

---

## Citations I personally verified

These were checked by reading the file at commit `36c8e38`.

| Citation in the brief | What I found | Result |
|---|---|---|
| `agentRegistrySeed.ts:957`, appointment agent | Entry is at **:959** | Drifted by 2 (already in document 01) |
| `agentRegistrySeed.ts:1691-1692`, reporting agent's `cron` / `'0 5 * * *'` | Lines are at **:1693-1694**; values as claimed | Drifted by 2 |
| `agentRegistrySeed.ts:927-934`, `:937-944`, `:947-954`, `:967-974` | Entries start at :929, :939, :949 and :969 | Drifted by 2 |
| All 15 registry lines in the migrated reasons (e.g. `:1017`, `:987`, `:2179`) | Every one is 2 lines later (`:1019`, `:989`, `:2181`) | Drifted by 2: the whole block moved |
| `aiOpsScheduler.ts:229-240`, `:320`, `:338`, `:352` | All 15 scheduler lines as cited | Confirmed |
| `agentRegistryAuditClassification.ts:56-62`, the 11 unwired admissions agents | List is at :56-62; each gets `confirmed_dead`, `disable: true` at :117-123 | Confirmed |
| `agentRegistryAuditClassification.ts:36-43`, `AdmissionsReportingAgent` first in `REPORTING_UNWIRED` | As claimed. `aiOpsScheduler.ts` has no entry for it | Confirmed |
| `agentRegistryAuditClassification.ts:23-32`, `Enterprise_Opportunity_Agent` first in `NO_SOURCE_FILE` | As claimed. The directory has 24 files, none for this agent | Confirmed |
| `executionPolicy.ts:27`, `live_email` | Line 27 is `'live_email'` in the gated list | Confirmed (full path `services/delivery/execution/executionPolicy.ts`) |
| `calendarRoutes.ts:6-7`, public booking routes | `GET /api/calendar/availability`, `POST /api/calendar/book` | Confirmed |
| `AdmissionsMemory.ts:45`, `visitor_type` | `declare visitor_type` at :45 | Confirmed |
| `admissionsMayaService.ts:11` and `:259` | `buildMayaSystemPrompt` at :11, `generateMayaGreeting` at :259 | Confirmed |
| `internshipCallService.ts:16-22`, the call refusals | The refusal list starts there (no permission → no call; no phone → no call) | Confirmed in part (full path `services/internship/internshipCallService.ts`). I did not check the "six per hour" rate limit |
| "Nothing can invoke" `AdmissionsCallGovernanceAgent` | Two live jobs call its function | **Wrong** (first correction below) |
| "28 of 39 rows marked `retire` held live code" (`:26`) | No source for this figure in this repo or at the platform paths I searched | **Unknown** |

The platform's own list, `LEGACY_AGENT_CLASSIFICATION.csv`, cites even older line numbers: scheduler `:207-218` and registry `:792-1004`. Neither matches this commit. Treat every line number in either source as approximate until re-checked.

---

## What I believe is wrong in the brief

### 1. `AdmissionsCallGovernanceAgent` is not dead code

**The brief says:** "nothing can invoke it" (`docs/stories/admissions.LEGACY-MIGRATION-PLAN.md:12`).

**What I found:** its registry wrapper (`aiOrchestrator.ts:494`) has no live caller. But its function is imported and called directly by two **live** cron jobs:
- `AdmissionsCallbackManagementAgent`: `agents/admissions/admissionsCallbackAgent.ts:4`, `:38`
- `AdmissionsAssistantAgent`: `agents/admissions/admissionsAssistantAgent.ts:7`, `:40`

**Why it matters:**
- **(a)** Holding the registry row off is still fine. **Deleting or "cleaning up" its source file would break two live jobs.**
- **(b)** The brief says `outreach_compliance_monitoring` is partial because "this half has no live caller". The 24-hour governance check does run today, for callbacks and the assistant's call queue.

### 2. The unknown record is largely answerable from the code

See [the unknown record](#the-unknown-record-admissionsvisitoridentityagent). The chat path writes the same value with the same function (`chatService.ts:177-181`). What remains is a one-line production check, not an open design question.

### 3. The Synthflow call agent's successor is more likely the callback path (Cora) than the internship interview call

**The brief says:** its outcome is served by `internshipCallService.ts`.

**What the code shows:**
- That service dials internship applicants for interviews.
- The legacy agent calls `triggerVoiceCall` in `synthflowService` (`admissionsSynthflowCallAgent.ts:5`).
- The live callback job names it as the thing that places scheduled admissions callbacks: "actual call placement done by SynthflowCallAgent or manual" (`admissionsCallbackAgent.ts:50`).
- Callback-type calls route to the Synthflow agent the platform calls "the Cora Outbound Admissions agent" (`synthflowService.ts:141`; `config/env.ts:83-86`).

**My reading:** the closer successor is `callback_request_queue_management` together with Cora, not `ai_voice_interview_dispatch`. The disposition (merged, never revived) does not change. The successor link does, and so does the duplicate-contact risk below. This is my reading of the code, for Taiwo and Ali to confirm.

### 4. Retiring `AdmissionsCEORecognitionAgent` does not stop CEO classification

**The brief retires it** partly because it "identifies a named individual … in order to treat them differently" (`:21`).

**What the code shows:**
- The shared classifier returns `'ceo'` (`admissionsMemoryService.ts:143-146`).
- The live chat path writes that value (`chatService.ts:177-181`).
- The greeting branches on it (`admissionsMayaService.ts:267`).

**What I recommend:** retiring the agent is still correct. But if the privacy reason is accepted, it applies to live code this migration does not touch. I am recording it as a **separate scope proposal** for Taiwo and Ali, not as a migration step.

### 5. Every registry line number in the brief is out by two, not just one

**Document 01** reported one drifted citation (`:957` → `:959`).

**What I found:** every registry citation in the brief and in `admissions.json` is 2 lines early, which means the whole block moved. The scheduler citations are correct. See the table above.

### Also noted, not an error

- **The brief names 13 records, not 28.** The 15 migrated records are in the platform file, just not shown on the story page (document 01 raised this).
- **There is a second naming problem.** 11 of the 15 live jobs run under a scheduler name that differs from their registry name, not just the 2 the brief mentions (`aiOpsScheduler.ts:229-240` against the registry lines above). This is already a capability of its own (`scheduler_registry_name_drift_reconciliation`), and it blocks [step 6](#the-steps).

---

## Duplicate-contact risk (Maya and Cora)

**What Taiwo raised** (document 04):
- Staff check by hand "whether anyone has already reached out" (`docs/discovery/04-manager-interview.md:193`).
- Enterprise's "contacted" flags can disagree with GHL (`:207`).
- The new agent must work with Cora, not duplicate it (`:211`).

**What already does this today:**
- **Maya** emails documents, sends texts, starts calls and enrols people in campaigns (document 01, finding 1: `mayaActionService.ts:74`, `:95`, `:107`, `:159`).
- **Cora** handles callbacks through Synthflow (`config/env.ts:83-86`).

**Which records overlap:**

| Record | Overlap | Risk if it ran | Plan |
|---|---|---|---|
| `AdmissionsSynthflowCallAgent` (#23) | Same call service and callback route as Cora (`synthflowService.ts:141`) | **A second phone call** to someone Cora or staff already called | Held off; never revived |
| `AdmissionsSMSAgent` (#26) | Maya already sends texts | **A second text** | Retired; never revived |
| `AdmissionsEmailAgent` (#19) | Maya already emails; outreach email must be approved by the team (document 04, `:210`) | **A second, unapproved email** | Only drafting survives, with a human sending |
| `AdmissionsDocumentDeliveryAgent` (#25) | Maya already emails documents | **A second document email** | Retired; never revived |
| `AdmissionsAppointmentSchedulingAgent` (#16) | Live booking routes | **A second booking** in a colleague's calendar | Held off |
| `AdmissionsCallbackManagementAgent` + `AdmissionsConversationTaskMonitor` (#3, #6), **live** | A chat request becomes a callback marked `scheduled`; a person places the call (`admissionsCallbackAgent.ts:50-53`) | The same person may also ask Cora for "call me now". **Unknown** whether staff see both queues | Kept unchanged; flagged to Taiwo |
| `AdmissionsProactiveOutreachAgent` (#13), **live** | Opens Maya's chat proactively for high-intent visitors | **Unknown** whether it checks if the team already contacted them | Kept unchanged; flagged to Taiwo |
| `AdmissionsCallComplianceMonitor` (#2), **live** | It is the duplicate-outreach check | It reads only `CallContactLog` (`admissionsCallComplianceAgent.ts:2`, `:32`, `:52`), not Cora's reply log or GHL. **Unknown** whether Cora's calls write `CallContactLog` rows | Kept unchanged; the gap is recorded |

**The rule for this migration:** no record that can reach a person (email, text, call, document, calendar booking) is revived or given a tool, at any autonomy level.

---

## How the migration runs, and why running it twice is safe

### What "running the migration" means

This project does not run it. After Taiwo's decisions, the platform owner applies them. The steps below are written so that every one of them can be run a second time and leave the same end state.

### The steps

| Step | What it does | How it is safe to repeat | Can it cause a duplicate side effect? |
|---|---|---|---|
| **1. Load** | Read the 28 records from `admissions.json` at a pinned commit, and match each name to a registry row | Read-only | No |
| **2. Classify** | Apply the four labels, and send anything that fails the rules in [the next section](#records-the-migration-cannot-classify) to "undecided" | Pure function of the inputs: the same inputs give the same answer | No |
| **3. Record decisions** | Store Taiwo's confirmed label for each record | **Upsert keyed on the record name:** one row per record. Check the current value first; if it is the same, write nothing | **Yes, if built as an append-only log:** two runs would leave two decision rows. Use upsert |
| **4. Hold off the 12 merged and retired records** | Add each name to `RETIRED_AGENTS` (`agentRegistrySeed.ts:3125`) | Already built to repeat. On every boot it skips rows that don't exist or are already off (`:3152-3153`), and only switches off rows that are still on (`:3154`) | No message. Do **not** delete registry entries: the seed recreates any missing row on the next boot (`findOrCreate`, `:3165-3168`). Do **not** delete source files (see the [first correction](#1-admissionscallgovernanceagent-is-not-dead-code)) |
| **5. Leave the 15 kept records running** | Record the capability that owns each job; no change to the job | Upsert keyed on (record name, capability) | **Yes, a second scheduled job**, if anyone registers a job under a new scheduler name while the old one stays. Running jobs are tracked by scheduler name (`aiOpsScheduler.ts:149`, `:555-559`), so two names mean two jobs running the same code. **Forbidden in this migration** |
| **6. Any scheduler change** (none planned) | If a job ever had to stop, set its schedule config to off and reload | The reload is idempotent by design: "reloading with no config change is a no-op" (`aiOpsScheduler.ts:584`) | **Silent no-op risk:** the config is keyed by **scheduler** name, and 11 of 15 differ from the registry name. **Blocked** until the naming is reconciled |
| **7. Tell people** | Telling Taiwo and the team what changed | A human action outside this project | **Yes, a second message**, if it were ever automated. It would need a key on (recipient, subject, migration run), as the repo's idempotency rule requires. Not automated here |

**The same pattern already exists on the platform.** After a mail-loop incident on 2026-07-14, Cora's auto-reply reserves an idempotency key *before* sending, so a repeat is skipped (`models/CoraReplyLog.ts:11-15`). Any automated step in this migration should copy that pattern.

**An existing replay hazard, outside this migration.** The live task monitor creates a callback request (`agents/admissions/admissionsConversationTaskMonitor.ts:86`) *before* it writes the log row that its duplicate check reads (`:74-82`, `:92`), and not in one transaction. If the log write ever fails, the next run, two minutes later, creates a second callback request, which could become a second call. This migration does not change that job; the hazard is recorded here for Taiwo and the platform owner.

### How to tell a replay left the same end state

After the first run and again after the second, these should match:
- the same 12 rows switched off;
- the same 15 jobs running on the same schedules, with the reload reporting them as "unchanged";
- no new scheduler registrations;
- no new messages, calls or bookings logged.

The exact production queries for these checks are **unknown**. They need the platform owner.

---

## Records the migration cannot classify

The migration does not assume every record can be classified. A record **cannot be classified** if any of these is true:

1. Its name is not matched by exactly one registry row.
2. Its label is missing or is not one of the four.
3. It is marked kept or merged, but names no successor capability.
4. Its evidence no longer holds at the pinned commit. For example, a record marked unreachable turns out to have a live caller.
5. Something that runs as an admissions job is not one of the 28.

**What happens to such a record:**
- It is labelled **undecided** and nothing about it changes: no switch-off, no deletion, no schedule change.
- It goes on a list with the one question that would settle it and the person who can answer.
- **It is never defaulted to retired**, and never defaulted to kept with changes.
- The rest of the migration still completes.
- On a re-run, the record stays undecided until a decision is recorded in step 3. That is what makes the outcome the same on every run.

**What I found when I applied these rules at commit `36c8e38`:**

| Check | Result |
|---|---|
| All 28 names match exactly one registry row | Yes. #7 has a second hit on `:1958`, which is its `config` block, not a second row |
| Registry rows that mention admissions but are not in the 28 | Five text matches: `Content_Marketing_Agent`, `ExecutiveBriefingReportingAgent`, `ExperimentRecommendationAgent`, `MarketingPublishingWorker`, `WebsiteImprovementStrategist`. All five belong to other domains in the platform's list, so none is unclassified here |
| Records whose evidence no longer holds | #17 (its code is live) and #28 (the question is mostly answered). Neither changes label; both are corrected above |
| Undecided today | **1:** `AdmissionsVisitorIdentityAgent` |

**Possibly ours, but outside the 28.** The platform's list has 21 records with no owning domain (`LEGACY_AGENT_CLASSIFICATION.csv`; `services/agentDomain/capabilities/_unresolved.json`). Several touch admissions data by name: `intent_scorer`, `visitor_tracker`, `calendar_intent_booster` and `IntentScoreRecomputer`. The last one recomputes the intent scores the visitor classifier reads (`admissionsMemoryService.ts:149`). This plan does not classify them, because they are not this domain's records.
- **The question:** which domain owns them?
- **Who can answer:** Ali, with Taiwo saying whether admissions relies on them.

---

## Decision order

| Order | Decision | Who decides | What it unblocks | Blocked until then |
|---|---|---|---|---|
| 1 | Accept the rule that **nothing that can contact a person is revived** | Taiwo | Everything below | Every step |
| 2 | Confirm the 15 kept records and their capabilities | Taiwo | Step 5 (record ownership) | Ownership records |
| 3 | Confirm the 4 retirements and 8 merges, including corrections 1 and 3 | Taiwo, with Ali for the code facts | Step 4 (hold the 12 off) | Holding any row off |
| 4 | Has `AdmissionsVisitorIdentityAgent` run in production? Then merge or keep held | Ali or a platform engineer answers; Taiwo decides | Record #28 | Record #28 |
| 5 | Reconcile the scheduler and registry names | Ali (capability `scheduler_registry_name_drift_reconciliation`) | Step 6 | Any scheduler change |
| 6 | Whether live CEO classification should stay (correction 4) | Taiwo and Ali | Nothing in this migration; it is a separate proposal | n/a |
| 7 | Which domain owns the admissions-adjacent unresolved records | Ali | Nothing in this migration | n/a |

**Access caveat.** Taiwo currently cannot reach the platform screens where these decisions would normally be recorded (document 02; document 04, "access blocker"). Until that is fixed, she reviews this document, her decisions are written into this repo, and the platform owner applies them.

---

## Sources

**This repo**
- `docs/stories/admissions.LEGACY-MIGRATION-PLAN.md:3-34`: the brief
- `docs/discovery/01-system-classes.md:87`, `:128`, `:133`: the unwired agents, the `:957` drift, the 13 of 28
- `docs/discovery/04-manager-interview.md:193`, `:207`, `:210-211`: Taiwo on reaching out, flags, approval, Cora
- `docs/discovery/05-three-proposed-tasks.md:76`, `:274`: the Cora boundary on the proposed tasks

**Platform, commit `36c8e38`, under `backend/src/` unless noted**
- `services/agentDomain/capabilities/admissions.json:5157-5354` (the 28 dispositions); `services/agentDomain/capabilityRecord.ts:42-46`, `:85-92`
- `docs/architecture/ai-workforce-management/LEGACY_AGENT_CLASSIFICATION.csv:2-29` (repo root)
- `services/agentRegistrySeed.ts`: the 28 entries at the lines in the table; `:3125-3160` (`RETIRED_AGENTS`, `enforceRetiredAgents`); `:3163-3168` (seed `findOrCreate`)
- `services/aiOpsScheduler.ts:149`, `:229-240`, `:320`, `:338`, `:352`, `:555-559`, `:584-587`
- `services/agentRegistryAuditClassification.ts:23-32`, `:36-43`, `:52-62`, `:117-123`
- `services/aiOrchestrator.ts:494`, `:516-528`
- `services/agents/admissions/admissionsCallbackAgent.ts:4`, `:38`, `:50-53`; `admissionsAssistantAgent.ts:7`, `:40`; `admissionsConversationTaskMonitor.ts:74-92`; `admissionsVisitorIdentityAgent.ts:3`, `:27-30`; `admissionsHighIntentLeadAgent.ts:54-55`; `admissionsVisitorActivityAgent.ts:59`; `admissionsProactiveOutreachAgent.ts:46-50`; `admissionsCallComplianceAgent.ts:2`, `:32`, `:52`; `admissionsSynthflowCallAgent.ts:5`
- `services/chatService.ts:177-181`, `:225-226`; `services/admissionsMemoryService.ts:18`, `:143-149`; `services/admissionsMayaService.ts:11`, `:259-267`
- `services/synthflowService.ts:141`; `config/env.ts:83-86`; `models/CoraReplyLog.ts:11-15`; `models/AdmissionsMemory.ts:45`
- `services/delivery/execution/executionPolicy.ts:27`; `routes/calendarRoutes.ts:6-7`; `services/internship/internshipCallService.ts:16-22`
