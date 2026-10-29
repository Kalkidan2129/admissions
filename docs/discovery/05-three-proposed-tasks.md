# Three proposed agent tasks for Admissions

**Story:** `admissions.RESEARCH-5-THREE-PROPOSED-TASKS` · **Domain:** Admissions & Applicant Experience
**For review by:** Taiwo Oludimimu, accountable human for this domain
**Status:** **proposal only.** No agent has been changed, granted a tool or moved up the autonomy ladder. All three capabilities stay `draft` until Taiwo has reviewed them.
**Platform evidence read at:** `ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator` commit `36c8e38`, the same commit as documents [01](01-system-classes.md) to [04](04-manager-interview.md). Platform paths are under `backend/src/` unless noted.

## The three tasks at a glance

| # | Taiwo's priority | Capability | What the agent does | Start | First release | Ceiling | Approver |
|---|---|---|---|---|---|---|---|
| 1 | UC-03, Explorer engagement (**partial match**) | `outreach_compliance_monitoring` | Answers "when were we last in touch with this person, and on which channel" | R0 | R2 | R7 | Taiwo Oludimimu |
| 2 | UC-02, incomplete registration (**partial match**) | `daily_enrollment_report` | Answers "how many enrolled today, against what target", with unfinished (pending) enrollments shown separately from paid | R0 | R2 | R7 | Taiwo Oludimimu |
| 3 | UC-01, inquiry monitoring (**closest match**) | `lead_intake_dedup_and_qualification` | Answers "is this person already a lead, and from which source" | R0 | R2 | R6 | Taiwo Oludimimu |

All three only **answer questions from existing records**. None of them contacts anyone, creates a GHL contact or changes a record.

## How the three were chosen

### The rules

- **Only this domain's 47 draft capabilities** (`docs/stories/admissions.CAP.*.md`) were candidates. No task is invented.
- **None is human-reserved.** All three stories say "Not a human-reserved decision" (`outreach_compliance_monitoring.md:74`, `daily_enrollment_report.md:75`, `lead_intake_dedup_and_qualification.md:81`). The 17 human-reserved capabilities were excluded.
- **Taiwo's order is followed:** UC-03 first, then UC-02, then UC-01 ([document 04](04-manager-interview.md), interview record, Q1).
- **Her rules are used as boundaries:**
  - The team proofreads and approves every outreach email before it is sent (document 04, "Must stay human").
  - At this stage the agent must not contact anyone, create GHL contacts or change any record on its own.

### UC-03: free-resource Explorer engagement. No capability matches it fully.

What Taiwo asked for: a weekly report of unpaid Explorers, ranked by progress and points, with three columns: on GHL (yes/no), reached out (yes/no), and channel (document 04, "Wanted output").

**None of the 47 capabilities mentions Explorers, GHL or points** (case-insensitive search of all 47 story files: zero matches for each). The platform does hold Explorer data. It is just not in any Admissions capability:

- `explorer_journey_profiles` has one row per free Explorer (`models/ExplorerJourneyProfile.ts:10-11`, `:124`).
- Each row carries engagement, intent and fit scores (`:99-101`). Whether these are the "points" Taiwo means is **unknown**.
- Each row also has a learner-side `last_contacted_at`, which the code says is distinct from the CRM-side one on `leads` (`:108-112`).
- `leads.ghl_contact_id` records a GHL link when one exists (`models/Lead.ts:276`). A null means "no linkage recorded", not "not in GHL" (`services/adminOs/panels/acquisitionPanels.ts:53-58`).

How the nearest capabilities cover the parts of the report:

| Part of the report | Nearest capability | Covers it? |
|---|---|---|
| Weekly, one row per person, ranked | `weekly_cohort_progress_report` | **Shape only.** Its population is enrolled cohort students from class progress data (`weekly_cohort_progress_report.md:36-41`), not unpaid Explorers |
| Ranked by likelihood to convert | `visitor_intent_scoring` | **No.** It scores chat visitors from their chat interests (`visitor_intent_scoring.md:40-42`), not Explorer progress |
| Reached out yes/no, and channel | `outreach_compliance_monitoring` | **Yes, for this column.** Its first release answers "when were we last in touch with this person" (`outreach_compliance_monitoring.md:76`) |
| On GHL yes/no | none | **No.** No capability reads `ghl_contact_id` |

**What is missing:** an Admissions capability for the Explorer population itself. It would need to cover which Explorers are unpaid, their progress and points, and their GHL status.

**What would have to be written:** a new capability story for the weekly Explorer report, for Taiwo to validate. It would also need Ali's team, because the Enterprise-to-GHL integration is still being built (document 04, "Main problem"). That is a scope addition, so it is **recorded here, not proposed as a task.**

**Next-best choice: `outreach_compliance_monitoring`.** Three reasons:

- It answers the column her team checks by hand today: whether anyone has already reached out (document 04, Q1).
- That is also the column where she says Enterprise's "contacted" flags disagree with GHL. Measuring that disagreement is useful in its own right.
- Its story says it "only reads and reports; it changes nothing" (`outreach_compliance_monitoring.md:72`), which fits her rule.

### UC-02: incomplete registration. Partial match.

**Closest: `daily_enrollment_report`.** It is the only capability that separates unfinished enrollments from paid ones. It must report pending enrollments separately from paid (`daily_enrollment_report.md:49`, `:79`). The platform creates an enrollment as pending first (`services/enrollmentService.ts:38`). Its payment states are `paid`, `pending`, `pending_invoice` and `failed` (`models/Enrollment.ts:22`).

- **Matches:** a count of people who started an enrollment and have not finished paying.
- **Missing:**
  - It gives counts, not a list of the people to follow up.
  - Whether Taiwo's "incomplete registration" means exactly these pending states is **unknown**. It goes in the follow-up email.
- **Other candidates checked:**
  - `interview_progress_tracking` and `applicant_assessment_preparation` mention incomplete items, but for the internship application flow.
  - `application_queue_triage` covers internship applications, and its ownership is contested between Dhee and Taiwo (`application_queue_triage.md:10`).

### UC-01: inquiry monitoring. Closest match.

**Closest: `lead_intake_dedup_and_qualification`.** Its outcome is "Every enquiry becomes exactly one lead record" (`lead_intake_dedup_and_qualification.md:30`). Its first release answers "is this person already a lead, and from which source" (`:83`). That is the Enterprise half of the check her staff do by hand before creating a contact (document 04, Q1).

- **Missing:** the GHL half. The capability reads `leads`, not GHL.
- **Cora:** this task takes no calls and creates no contacts, so it does not duplicate Cora (document 04, "Cora"). Whether callers Cora handles end up as `leads` rows is **unknown**.
- **Other candidates checked:**
  - `conversation_action_request_detection` tracks requests made inside chat conversations (`conversation_action_request_detection.md:29`).
  - `callback_request_queue_management` tracks callback requests (`callback_request_queue_management.md:30`).
  - Both cover parts of an inquiry, but neither covers the inquiry itself.

## What holds for all three tasks

- **No agent tool exists today.** Every tool these stories list, such as `sandbox_postgres_read`, is a name in the capability catalogue only. The platform implements one agent tool, `read_attachments` (`services/agents/tools/types.ts:12`; [document 02](02-agent-anatomy.md), Tools).
- **With no tools, the platform caps an agent at R2:** answering from approved knowledge and records (`services/agentDomain/autonomyLadder.ts:61`, `:207-211`). So R2 is the real limit at this stage, whatever a story's ceiling says.
- **Rungs used below** (`autonomyLadder.ts:58-69`):
  - R0: define the workflow, requirements, risks and human decisions.
  - R2: answer questions using approved knowledge and records.
  - R5: evaluate in shadow mode against approved reference outcomes.
  - R6: a separately approved, supervised production pilot.
  - R7: automate only explicitly authorized action classes within limits.
- **Production is never reached by approval alone.** R6 is a separately approved pilot (`autonomyLadder.ts:202-205`).
- **A threshold stays "proposed" until a named human accepts it** (`services/agentDomain/promotionCriteria.ts:18-22`). Every "to be agreed with Taiwo" below is one of these.
- **Taiwo cannot yet open the agent's screens.** The access blocker in [document 04](04-manager-interview.md) is still open. Until it is fixed, her approvals are recorded in this repo, not on the platform.
- **Evidence is recorded by row ID, never by name.** No student, payment or refund details go into this repo.

---

## Task 1: When were we last in touch with this person?

**Capability:** `admissions.outreach_compliance_monitoring` · **Built today:** partial (`outreach_compliance_monitoring.md:5`) · **Serves:** UC-03, the "reached out" and "channel" columns

### Completion evidence (written first)

The task is complete when **all** of the following are true:

1. **It matches the team's own check.**
   - Each week, Taiwo or Rose picks a sample of unpaid Explorers.
   - For each one, the agent answers with the date and channel of the last contact, "no contact recorded", or "channel history missing".
   - Taiwo or Rose checks the same people by hand in GHL and Enterprise.
   - The answers match for every person, for a number of consecutive weeks **to be agreed with Taiwo**.
2. **Every answer can be reproduced from cited rows.** Each answer names the `communication_logs`, `call_contact_logs` or `email_send_ledger` rows it rests on, and re-running the lookup gives the same answer. This is the story's own acceptance test (`outreach_compliance_monitoring.md:78`).
3. **A gap is reported as a gap.** Where one channel's history is missing, the answer says so instead of "not contacted" (`outreach_compliance_monitoring.md:49`).
4. **Mismatches are kept, not removed.** Each mismatch is recorded with its row IDs and a cause: the agent was wrong, or the ledger was incomplete.
5. **Taiwo has accepted it in writing.** She accepts the sample rule and the number of weeks by name and date, as `accepted_by` and `accepted_at`.

**Does not count:** this story or task marked done, weeks passing, a good demo, or a test against mocked records.

### The task

Given a person, answer when Colaberry was last in touch with them and on which channel (call, text or email), using only the contact records. The answer goes to Taiwo or Rose, who still decide what to do next.

### Boundary: what the agent must NOT do

- It must **not contact anyone**, on any channel.
- It must **not approve, schedule or queue any outbound contact**. Its story says it "must never acquire the power to approve an outbound contact" (`outreach_compliance_monitoring.md:72`).
- It must **not draft outreach**. If drafting is added later, the team proofreads and approves every email before it is sent.
- It must **not create or change a GHL contact**, or change the Enterprise "contacted" flags or any other record.
- It must **not report "not contacted"** where a channel's history is missing.
- It must **not build the Explorer list itself**. Taiwo or Rose chooses who to ask about. Building that list is the missing capability described under UC-03.

### Tools and data it needs

| Needs | Exists today? | Source |
|---|---|---|
| Tool `sandbox_postgres_read` | **No**, a catalogue name only | `types.ts:12`; document 02, Tools |
| Tool `read_call_logs` | **No** | as above |
| Tool `read_email_send_ledger` | **No** | as above |
| Tool `render_html_report` | **No** | as above |
| Data: `communication_logs`, with a `channel` per row | Yes | `models/CommunicationLog.ts:75`, `:137` |
| Data: `call_contact_logs` | Yes | `models/CallContactLog.ts:78` |
| Data: `email_send_ledger` | Yes | `db/ensureEmailSendLedgerSchema.ts:42` |
| Whether texts and calls staff make directly in GHL are recorded in these tables | **Unknown** | Texts the platform sends through GHL are logged (`services/agents/admissions/admissionsSMSAgent.ts:87-96`). Nothing found shows staff-made GHL contacts being recorded |

**The unknown in the last row is the main risk.** If staff outreach made in GHL never reaches these tables, check 1 will fail. The failure would point to the missing integration, not to the agent. That is worth knowing either way.

### Autonomy

- **Start:** R0. The workflow, risks and human decisions are being defined in this document.
- **First release:** R2. It answers from records, which is all the platform allows with no tools.
- **Ceiling in the story:** R7, because the capability "only reads and reports; it changes nothing" (`outreach_compliance_monitoring.md:72`).
- **Ceiling for now:** R2, until Taiwo has accepted the evidence above.
- **Next step:** R5, shadow comparison against the agreed weekly samples, with Taiwo's separate approval.

### Who approves

| Approval | Who |
|---|---|
| The sample rule and the number of weeks | Taiwo Oludimimu |
| Accepting the evidence, and any move beyond R2 | Taiwo Oludimimu |
| Granting the read tools on the platform | Approved by Taiwo Oludimimu. The platform admin who carries it out is **unknown**; it is the open access question in document 04 |

### What would make me switch it off

- An answer that cannot be reproduced from the rows it cites.
- "Not contacted" given for a person whose channel history is missing.
- Any attempt to send, schedule or approve a contact, or any write to any record.

Who holds the switch is **unknown**, because Q8 in document 04 is not answered yet. The proposal is Taiwo, using the platform's tool kill switch (`services/agents/tools/agentToolRegistry.ts:28-34`).

---

## Task 2: How many enrolled today, and how many are unfinished?

**Capability:** `admissions.daily_enrollment_report` · **Built today:** unknown (`daily_enrollment_report.md:5`) · **Serves:** UC-02, as counts

### Completion evidence (written first)

The task is complete when **all** of the following are true:

1. **Every figure reconciles.** Each figure is saved with the re-runnable query that produced it, and re-running that query gives the same figure (`daily_enrollment_report.md:79`).
2. **Unfinished is never counted as paid.** Pending, pending-invoice and failed enrollments are each reported separately from paid (`daily_enrollment_report.md:49`).
3. **Zeros and withdrawals are handled.**
   - A day with no enrollments shows an explicit 0, not a missing row (`daily_enrollment_report.md:50`).
   - A withdrawal reduces the count (`:51`).
4. **It matches the team's hand count.** The unfinished count matches the number of incomplete registrations Taiwo and Rose count by hand, for a number of consecutive weeks **to be agreed with Taiwo**.
5. **Taiwo has confirmed it in writing.** She confirms that "incomplete registration" means these pending states (still unknown), and accepts the evidence by name and date.

**Does not count:** this story or task marked done, weeks passing, a good demo, or a test against mocked records.

### The task

Answer "how many enrolled today and this week, against the cohort target", and "how many enrollments are unfinished, by state", from the enrollment records. The answer is counts only.

### Boundary: what the agent must NOT do

- It must **not contact anyone** with an incomplete registration. That includes reminders. Email is a default-denied capability (`services/delivery/execution/executionPolicy.ts:27`).
- It must **not change any enrollment or payment status**.
- It must **not email the report.** That also needs the default-denied email capability (`daily_enrollment_report.md:83`).
- It must **not set, invent or act on an alert threshold.** The thresholds are Taiwo's, and Q6 in document 04 is not answered yet (`daily_enrollment_report.md:52`).
- It must **not show payment amounts or any individual's payment details.** It gives counts only.

### Tools and data it needs

| Needs | Exists today? | Source |
|---|---|---|
| Tool `sandbox_postgres_read` | **No**, a catalogue name only | `types.ts:12`; document 02, Tools |
| Tool `read_enrollment_records` | **No** | as above |
| Tool `read_cohort_snapshots` | **No** | as above |
| Tool `render_html_report` | **No** | as above |
| Data: `enrollments`, with `payment_status` | Yes | `models/Enrollment.ts:22`, `:203`, `:331` |
| Data: the cohort target | The launch brief states a 25-student target. A stored target table is **unknown** | `daily_enrollment_report.md:93` |
| Whether a daily report already runs | **Unknown** | `daily_enrollment_report.md:11` |

### Autonomy

- **Start:** R0.
- **First release:** R2. It answers from records.
- **Ceiling in the story:** R7, because an aggregate internal report is the kind of action class R7 allows. The thresholds stay Taiwo's, because "a self-set escalation threshold is a self-granted exemption" (`daily_enrollment_report.md:73`).
- **Ceiling for now:** R2, until Taiwo has confirmed the definition and accepted the evidence.

### Who approves

| Approval | Who |
|---|---|
| What counts as "incomplete registration" | Taiwo Oludimimu |
| The number of weeks, and accepting the evidence | Taiwo Oludimimu |
| Every alert threshold, when one is added later | Taiwo Oludimimu |
| Granting the read tools on the platform | Approved by Taiwo Oludimimu. The platform admin who carries it out is **unknown** |

### What would make me switch it off

- A figure that does not reconcile with its saved query.
- An unfinished enrollment counted as paid.
- An alert raised on a threshold Taiwo did not set.
- Any individual's payment details in an answer.
- Any write to any record.

Who holds the switch is **unknown** (Q8). The proposal is Taiwo.

---

## Task 3: Is this person already a lead?

**Capability:** `admissions.lead_intake_dedup_and_qualification` · **Built today:** implemented (`lead_intake_dedup_and_qualification.md:5`) · **Serves:** UC-01

### Completion evidence (written first)

The task is complete when **all** of the following are true:

1. **It matches Rose's check.**
   - Each week, Rose or Taiwo picks a sample of new inquiries.
   - For each one, the agent answers whether the person is already a lead and from which source.
   - Rose or Taiwo checks the same people by hand.
   - The answers match for every person, for a number of consecutive weeks **to be agreed with Taiwo**.
2. **No test leads are reported as real.** Every answer applies the leads table's default scope, so no `campaign_test` lead is reported as a real one (`lead_intake_dedup_and_qualification.md:85`; `models/Lead.ts:396`).
3. **Nothing was written.**
   - The agent write audit shows no write by the agent (`models/AgentWriteAudit.ts:107`).
   - Row counts in `leads` and `raw_lead_payloads` are unchanged by the agent across the evaluation weeks.
4. **Taiwo has accepted it in writing**, by name and date.

**Does not count:** this story or task marked done, weeks passing, a good demo, or a test against mocked records.

### The task

Given a new inquiry, answer whether that person already exists as a lead and which source first found them. This saves the team the manual check before anyone creates a contact.

### Boundary: what the agent must NOT do

- It must **not create, merge or edit a lead.** The story lists a write tool (`lead_intake_dedup_and_qualification.md:57`), but this task leaves it out.
- It must **not create a GHL contact.** Taiwo would like that automated one day, but it is not decided, and the GHL integration is still being built (document 04, action table).
- It must **not contact a lead.** Contact stays human-sent (`lead_intake_dedup_and_qualification.md:11`).
- It must **not read out the contents of `raw_lead_payloads`.** That table stores whole untrusted request bodies (`lead_intake_dedup_and_qualification.md:52`).
- It must **not answer calls or take over anything Cora does.**

### Tools and data it needs

| Needs | Exists today? | Source |
|---|---|---|
| Tool `sandbox_postgres_read` | **No**, a catalogue name only | `types.ts:12`; document 02, Tools |
| Tool `read_lead_records` | **No** | as above |
| Data: `leads`, with its default scope | Yes | `models/Lead.ts:394`, `:396` |
| Data: `raw_lead_payloads` (used to check that nothing changed, never read out) | Yes | `models/RawLeadPayload.ts:79` |
| The GHL side: is this person in GHL? | **Not in this capability.** `leads.ghl_contact_id` exists, but a null means no link recorded, not "not in GHL" | `models/Lead.ts:276`; `acquisitionPanels.ts:53-58` |

### Autonomy

- **Start:** R0.
- **First release:** R2. It answers from records.
- **Ceiling in the story:** R6. Intake is deterministic and idempotent, but it stops at a supervised pilot for two reasons: a wrong match writes one person's inquiry onto another person's record, and the raw payloads are not fenced off (`lead_intake_dedup_and_qualification.md:79`).
- **Ceiling for now:** R2. This task never uses the write path, so the R6 risk does not arise at this stage.

### Who approves

| Approval | Who |
|---|---|
| The sample rule, the number of weeks, and accepting the evidence | Taiwo Oludimimu |
| Any later step that writes a lead or a GHL contact | Taiwo Oludimimu, and only after the GHL integration question is settled with Ali's team |
| Granting the read tools on the platform | Approved by Taiwo Oludimimu. The platform admin who carries it out is **unknown** |

### What would make me switch it off

- Any write to `leads`, `raw_lead_payloads` or GHL.
- A `campaign_test` lead reported as real.
- Any raw payload content in an answer.
- Any attempt to contact a lead.

Who holds the switch is **unknown** (Q8). The proposal is Taiwo.

---

## Open items for Taiwo

| Item | Why it matters | Where it is asked |
|---|---|---|
| Number of weeks for each task | It is the threshold that has to be accepted | To be agreed with Taiwo |
| Whether "incomplete registration" means pending enrollments | Decides whether Task 2 serves UC-02 | Follow-up email |
| Whether "points" are the Explorer engagement, intent and fit scores | Needed for the missing UC-03 capability | Follow-up email |
| Who holds the switch (Q8) | Named for every task above as unknown | Follow-up email |
| A new capability story for the weekly Explorer report | UC-03 has no matching capability | Scope addition, for Taiwo and Ali |

## Sources

**This repo**
- `docs/stories/admissions.RESEARCH-5-THREE-PROPOSED-TASKS.md`: the brief
- `docs/discovery/04-manager-interview.md`: the interview record (Q1, "Wanted output", "Main problem", "Must stay human", "Cora", the action table)
- `docs/discovery/02-agent-anatomy.md`: Tools
- `docs/stories/admissions.CAP.outreach_compliance_monitoring.md:5`, `:49`, `:72`, `:74`, `:76`, `:78`
- `docs/stories/admissions.CAP.daily_enrollment_report.md:5`, `:11`, `:49-52`, `:73`, `:75`, `:79`, `:83`, `:93`
- `docs/stories/admissions.CAP.lead_intake_dedup_and_qualification.md:5`, `:11`, `:30`, `:52`, `:57`, `:79`, `:81`, `:83`, `:85`
- `docs/stories/admissions.CAP.weekly_cohort_progress_report.md:36-41`; `visitor_intent_scoring.md:40-42`; `application_queue_triage.md:10`; `conversation_action_request_detection.md:29`; `callback_request_queue_management.md:30`

**Platform, commit `36c8e38`, under `backend/src/`**
- `services/agentDomain/autonomyLadder.ts:58-69`, `:202-205`, `:207-211`
- `services/agentDomain/promotionCriteria.ts:18-22`
- `services/agents/tools/types.ts:12`
- `services/agents/tools/agentToolRegistry.ts:28-34`
- `services/delivery/execution/executionPolicy.ts:27`
- `services/agents/admissions/admissionsSMSAgent.ts:87-96`
- `services/enrollmentService.ts:38`
- `services/adminOs/panels/acquisitionPanels.ts:53-58`
- `models/ExplorerJourneyProfile.ts:10-11`, `:99-101`, `:108-112`, `:124`
- `models/Lead.ts:276`, `:394`, `:396`
- `models/Enrollment.ts:22`, `:203`, `:331`
- `models/CommunicationLog.ts:75`, `:137`
- `models/CallContactLog.ts:78`
- `models/RawLeadPayload.ts:79`
- `models/AgentWriteAudit.ts:107`
- `db/ensureEmailSendLedgerSchema.ts:42`
