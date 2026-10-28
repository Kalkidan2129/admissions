# Interview plan for Taiwo Oludimimu, and a proposed weekly check-in

**Story:** `admissions.RESEARCH-4-MANAGER-INTERVIEW` · **Domain:** Admissions & Applicant Experience
**Interviewee:** Taiwo Oludimimu, accountable human for this domain
**Status:** **plan only. No meeting has been arranged.** Nothing in this project sends, schedules or books anything. Arranging the conversation is a human action taken outside this project, if Taiwo agrees to it.
**Platform evidence read at:** `ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator` commit `36c8e38` (4:24 PM CDT on 2026-10-22), the same commit as documents [01](01-system-classes.md), [02](02-agent-anatomy.md) and [03](03-role-and-da-transition.md).

## Why this conversation is worth 30 minutes

Discovery left eight open questions that **only Taiwo can answer**. Each answer changes a specific document, capability or decision, listed per question below. Until then:

- The Admissions agent has no agreed scope.
- No capability has an accepted measure of "good".
- Five application decisions have no settled owner.

## Agenda (30 minutes)

| Time | Minutes | Section | Questions |
|---|---|---|---|
| 0:00 to 0:03 | 3 | Purpose, and what discovery found | none |
| 0:03 to 0:06 | 3 | **The access blocker, to raise, not to fix** | none |
| 0:06 to 0:13 | 7 | What you want first | Q1, Q2 |
| 0:13 to 0:19 | 6 | What must stay human forever | Q3, Q4 |
| 0:19 to 0:24 | 5 | What "good" looks like, in numbers | Q5, Q6 |
| 0:24 to 0:28 | 4 | What you would switch off immediately | Q7, Q8 |
| 0:28 to 0:30 | 2 | The weekly check-in proposal, and next steps | none |
| | **30** | | **8 questions** |

## 0:03: the access blocker, to raise, not to fix

**What to say:** "Before we talk about what the agent should do: today you probably cannot open the screens you would use to direct it, check it or approve its work. You can't validate what you can't see. Here is what is wrong, and who would have to fix it."

**The brief's version of the blocker is partly out of date.** At commit `36c8e38`:

| The brief says | Current state | Source |
|---|---|---|
| (a) He has no `admin_users` row | **Corrected on 2026-10-15.** He has a full admin login | `agentDomainRegistry.ts:148-153`, `:175` |
| (b) `/api/admin/admissions` is not mapped in `PATH_SECTION` | **Still true.** No entry for it exists. But it does not block him today: his nine Admissions routes use `requireAdmin`, which his full admin login passes | `agentDomainRegistry.ts:165-170`; `mgmtSectionGate.ts` has no `/api/admin/admissions` entry |
| He is the reporting target for 4 agents | **True.** Finance Intelligence, Operations Optimization, Admissions Conversion and Student Success Architects | `agentBlueprint/ticketCreatorIdentitySeed.ts:99-104` |
| The `admissions` management role is Dhee's and grants the internship section, at `mgmtSectionGate.ts:100` | **True, but the line moved.** It is now at `:150-151` | `mgmtSectionGate.ts:150-151` |

**The block that applies now** is worked out from the code, not tested. It is on his **agent** screens: Talk, memory, role charter and directives for `AdmissionsDomainAgent`. Those routes admit a `super_admin`, or a manager whose `org_members` row matches their sign-in email **and** who has the agent in their reporting chain. Taiwo fails on both counts:

- His role is legacy `admin`, not `super_admin`.
- His `org_members` row holds a different email from the one he signs in with.
- The agent has no reporting line yet.

(Sources: `agentManagerAuthMiddleware.ts:43`, `:64-86`; `agentDomainRegistry.ts:150-158`; `domainAgents.ts:35`; [document 02](02-agent-anatomy.md), Communication.)

**What to ask for in the meeting:** agreement that a platform admin, or Ali, should:

1. link his `org_members` row to his work sign-in, and
2. set `AdmissionsDomainAgent`'s reporting line to him.

Plus one test attempt afterwards to confirm he can open the Talk tab. **Nothing is fixed in the meeting, and this project fixes nothing.**

**Until it is fixed,** every answer below is captured in this file, not entered on the platform.

## The questions

Every question names the finding it comes from, and what its answer will change.

### What you want first

**Q1. Of the five reporting jobs not yet fully automated, which should the agent take on first? And for that one, how is it done today, and by whom?**
The five are the daily enrollment report, refund and churn tracking, the monthly subscription and MRR report, at-risk student identification (partly built), and the cohort retrospective. The weekly cohort report is already automated.
- *Follow-ups:*
  - Are the daily, monthly and retrospective reports still produced, by hand or automatically, or have they stopped?
  - Does anyone besides you do analysis or reporting for Admissions?
- *Comes from:*
  - document 03, rows 1-6 and finding 3 (all four of those reports are "Built today: unknown")
  - document 03, the missing Data Analyst duty register
- *Changes:*
  - the "Built today" line on `daily_enrollment_report`, `refund_and_churn_tracking`, `monthly_subscription_and_mrr_report` and `cohort_retrospective_report`
  - which capability leads in story `RESEARCH-5` (three proposed tasks)
  - the first rows of the current-state register in document 03

**Q2. The Admissions AI employee's description says it "Owns lead intake: sources, ingest logs, routing rules and import." Is that its job? Or should its role charter name the reporting and applicant work in this domain, and which parts?**
- *Comes from:* document 02, finding 2 (`domainAgents.ts:118-119`); document 03, finding 2.
- *Changes:*
  - the text Taiwo writes into the agent's role charter (`PUT /api/admin/agents/:id/charter`, `agentRoleCharterRoutes.ts:14`) once he has access
  - which of the 47 capabilities are in scope for `RESEARCH-5`

### What must stay human forever

**Q3. Five application decisions need a named human: recording admission decisions, assembling decision packets, sending decision notifications, activating interns, and verifying signed documents. For each, is the accountable human you, Dhee, or one of you approving with the other informed?**
- *Comes from:* document 03, finding 1. The registry records Taiwo as the domain manager (`agentDomainRegistry.ts:143-146`), but the internship spec says "Dhee approves first" (`docs/AI_INTERNSHIP_SPEC.md:186-188`).
- *Changes:*
  - the accountable-human line on those five capability stories
  - the "who holds it" column in document 03
  - who is asked to validate each of the five

**Q4. Four reserved capabilities list autonomy ceilings above the cap the platform applies to human decisions: knowledge curation (R6), the access-path audit (R7), the personal-data minimization review (R7) and scheduler name-drift reconciliation (R7). Do you agree that for each, the agent may produce the report but a named person approves every change? And who is that person?**
- *Comes from:* document 01, finding 2. The platform holds human decisions at R5 (`autonomyLadder.ts:213-219`).
- *Changes:*
  - the ceiling line in those four stories, lowered to R5
  - the named approver recorded in each

### What "good" looks like, in numbers

**Q5. For the capability you chose in Q1, what has to match, against what, for how long, before you would call it ready?**
For example: every figure reconciles with a query you can re-run, in shadow next to your own version, for a number of consecutive runs you choose.
- *Comes from:* document 03, the readiness table, which leaves every number for Taiwo to set. A threshold stays "proposed" until a named human accepts it (`promotionCriteria.ts:18-22`).
- *Changes:*
  - the accepted threshold for that capability, recorded with `accepted_by` and `accepted_at`
  - the readiness row in document 03
  - the completion evidence for that task in `RESEARCH-5`

**Q6. Your launch brief says to give the daily report "the column list + thresholds for 'alert Ali'". What are the columns, and what figure trips an alert?**
- *Comes from:*
  - `docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:25`, `:68`
  - `escalation_threshold_governance`, whose acceptance requires every threshold to be listed with its owner and recorded as unset where it is unset (`admissions.CAP.escalation_threshold_governance.md:74`)
- *Changes:*
  - the threshold values and their owner in `escalation_threshold_governance`
  - the specification of `daily_enrollment_report`

### What you would switch off immediately

**Q7. Maya, the live applicant chat, can email documents, send texts, start voice calls and enrol people in campaigns on its own. When its stage check errors, it still emails three of the four documents. Should any of these be switched off now, or changed so they refuse on error? Who would you ask to do it?**
- *Comes from:*
  - document 01, finding 1 (`mayaActionService.ts:74`, `:95`, `:107`, `:159`)
  - document 02, Safeguards (`mayaActionService.ts:281-296`)
- *Changes:*
  - a written change request to the platform owner (this project changes nothing in Maya)
  - the Maya capability story's scope
  - the Safeguards label in document 02, which stays "partial" until this is resolved

**Q8. Once the Admissions agent holds its first tool, what single thing would make you want it off at once? For example: a figure that does not reconcile, a student named as at-risk without a cited signal, or any attempt to contact someone. And who should be able to turn it off?**
- *Comes from:*
  - document 02, Safeguards: the authorization gate defaults to shadow mode and "FAILS OPEN" (`agentAuthorizationService.ts:4-10`, `:39-48`)
  - the tool kill switch (`agentToolRegistry.ts:28-34`)
- *Changes:*
  - the exceptions list in the first capability's story
  - a stated rule that `abac_enforcement` is `enforce` before any tool is granted
  - the named person who holds the switch

## What happens to each answer

| Answer | Action | Done by | Where it lands |
|---|---|---|---|
| Q1 | Update the four "Built today" lines; put the chosen capability first in `RESEARCH-5` | Intended builder | Four capability stories; `docs/discovery/05-…` |
| Q2 | Draft the role charter text for Taiwo to approve and enter once he has access | Intended builder drafts; Taiwo enters it | The agent's role charter |
| Q3 | Record the accountable human for each of the five decisions; flag any "Dhee" answer to Ali, because it changes who validates | Intended builder | Five capability stories; document 03 |
| Q4 | Lower the four ceilings to R5 and record the approver | Intended builder | Four capability stories; document 01, finding 2 |
| Q5 | Record the threshold as accepted, with name and date | Intended builder records; Taiwo accepts | Capability story; document 03 readiness table |
| Q6 | Record each threshold value and its owner | Intended builder | `escalation_threshold_governance` and `daily_enrollment_report` |
| Q7 | Write the change request with Taiwo's answer and the cited lines; it is sent by Taiwo or Ali, not by this project | Intended builder drafts | A new findings note; document 02 |
| Q8 | Add the kill condition to the first capability's exceptions, and the enforcement rule to its preconditions | Intended builder | The first capability's story; document 02 |
| Blocker | Record whether Taiwo agrees to the two access fixes and who will make them | Intended builder | This file; document 02 |

**If an answer is "I don't know",** record it as **unknown**, with who could answer instead. Don't fill it with a guess.

The intended builder is Kalkidan Bezabeh (`agentDomainRegistry.ts:178`).

## Proposed weekly check-in

**This is a proposal for Taiwo to accept, change or decline. Nothing has been arranged.**

| | Proposal |
|---|---|
| **Day** | Wednesday |
| **Duration** | 15 minutes |
| **Why Wednesday** | The Weekly Cohort Performance Report runs on Wednesdays at 8:00 AM Central (cron `0 13 * * 3`, `PROGRESS.md:1928`), so a fresh weekly snapshot is always there to look at |

**It reviews three things:**

1. **Evidence against the accepted threshold.** For the capability in shadow: did every figure reconcile this week, and did any run fail? The bar is the threshold from Q5.
2. **Decisions waiting on Taiwo.** Memory proposals awaiting approval (`agent_memory_proposals`, `AgentMemoryProposal.ts:6-14`), thresholds still "proposed", and any open question from this interview.
3. **Anything that misbehaved or was switched off.** Blocked or unexpected writes in the agent's write audit (`AgentWriteAudit.ts:4-19`), use of the kill switch, and any Q8 trigger.

**How it would be recorded:** the platform has a structured check-in record, `agent_one_on_ones`, with an agenda and outcome notes (`AgentOneOnOne.ts:4-12`). It has no repeating schedule (`:14-19`). A new record starts with status `scheduled` (`:21`), so **this project must not create one**; that would record a meeting as arranged. If Taiwo accepts the proposal, he or the person arranging it creates each record once he has access. Until then, outcomes go in this file.

## Interview record

*Empty until the interview happens. Fill this in during or right after it, then apply the actions above.*

**Date held:** *(not held)*
**Present:** *(not held)*

| # | Answer | Unknown? Who could answer | Action taken (commit or file) |
|---|---|---|---|
| Blocker | | | |
| Q1 | | | |
| Q2 | | | |
| Q3 | | | |
| Q4 | | | |
| Q5 | | | |
| Q6 | | | |
| Q7 | | | |
| Q8 | | | |
| Weekly check-in: accepted, changed or declined | | | |

## Sources

**This repo**
- `docs/stories/admissions.RESEARCH-4-MANAGER-INTERVIEW.md:3-9`: the brief and its blocker
- `docs/discovery/01-system-classes.md` (findings 1 and 2), `02-agent-anatomy.md` (Communication, Safeguards, findings), `03-role-and-da-transition.md` (responsibility table, readiness table, findings 1-3)
- `docs/stories/admissions.CAP.escalation_threshold_governance.md:74`

**Platform, commit `36c8e38`, under `backend/src/` unless noted**
- `services/agentDomain/agentDomainRegistry.ts:143-158`, `:165-170`, `:175`, `:178`
- `middlewares/mgmtSectionGate.ts:150-151`
- `middlewares/agentManagerAuthMiddleware.ts:43`, `:64-86`
- `services/agentBlueprint/ticketCreatorIdentitySeed.ts:99-104`
- `services/agentRegistry/domainAgents.ts:35`, `:118-119`
- `routes/admin/agentRoleCharterRoutes.ts:14`
- `services/agentDomain/autonomyLadder.ts:213-219`
- `services/agentDomain/promotionCriteria.ts:18-22`
- `services/mayaActionService.ts:74`, `:95`, `:107`, `:159`, `:281-296`
- `services/agentAuthorizationService.ts:4-10`, `:39-48`
- `services/agents/tools/agentToolRegistry.ts:28-34`
- `models/AgentMemoryProposal.ts:6-14`
- `models/AgentWriteAudit.ts:4-19`
- `models/AgentOneOnOne.ts:4-21`
- `docs/AI_INTERNSHIP_SPEC.md:186-188` (repo root)
- `docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:25`, `:68` (repo root)
- `PROGRESS.md:1928` (repo root)
