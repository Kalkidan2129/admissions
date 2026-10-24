# Taiwo Oludimimu's role, and which responsibilities transition to AI

**Story:** `admissions.RESEARCH-3-ROLE-AND-DA-TRANSITION` · **Domain:** Admissions & Applicant Experience
**Status:** draft for review, nothing here is validated yet
**Platform evidence read at:** `ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator` commit `36c8e38` (4:24 PM CDT on 2026-10-22), the same commit as documents [01](01-system-classes.md) and [02](02-agent-anatomy.md). Platform paths are cited against that commit; paths starting `docs/stories/` are in this repo.

## The answer in brief

- **Accountable human:** **Taiwo Oludimimu**, Admissions Operations.
  - He is the manager the platform records for this domain (`agentDomainRegistry.ts:143-146`).
  - His launch brief says he "own[s] enrollment monitoring, retention tracking, subscription growth, student lifecycle reporting" (`docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:1-3`).
- **No Data Analyst duty list exists** in either repository. The platform says so itself: "NO DATA ANALYST ROLE DOCUMENT EXISTS FOR COLABERRY" (`backend/src/services/agentDomain/capabilities/executive.json:8745`).
- **What does exist** is Taiwo's own launch brief, which lists the responsibilities of his role. I use it as the only sourced responsibility list. I do **not** call it a DA duty list. Whether Taiwo is the Data Analyst for this domain, or whether a separate one exists, is **unknown**.
- **From his brief: 6 responsibilities are proposed to transition.** 1 has already transitioned and 5 split between AI and Taiwo. **5 stay human.** In addition, **17 domain decisions** are reserved to a human by the capability stories.
- **Every transition is a proposal.** Deciding that a person's responsibility moves to a machine is itself reserved to Taiwo and Ali (`docs/stories/admissions.CAP.da_reporting_responsibility_transition_map.md:65`).

## The accountable human

| Fact | Source |
|---|---|
| Domain manager for Admissions & Applicant Experience | `backend/src/services/agentDomain/agentDomainRegistry.ts:143-146` |
| Title: Admissions Operations. Owns enrollment monitoring, retention tracking, subscription growth and student lifecycle reporting | `16-taiwo-admissions.md:1-3` |
| Has a full admin login (corrected by the platform on 2026-10-15) | `agentDomainRegistry.ts:148-153`, `:175` |
| His work and personal email addresses differ, which blocks some screens | `agentDomainRegistry.ts:155-158`; [document 02](02-agent-anatomy.md), Communication |

Two other people share the domain:

- **Roselen** owns "the human sales conversation"; Taiwo owns "the operational layer behind it" (`16-taiwo-admissions.md:3`).
- **Dhee** is named in the internship spec as the person who "approves first", reviewing and accepting applications, and who can grant time-boxed free access (`docs/AI_INTERNSHIP_SPEC.md:186-188`, `:195-197`). So **who holds application decisions, Taiwo or Dhee, is unresolved**. The capability stories record the same dispute.

**What the brief does not tell us:** how the role is *actually performed* today, including who does each task, how long it takes, and what judgement it involves. A brief written for launch states intent, not current practice. That evidence needs the manager interview in story `RESEARCH-4`, which has not happened. The current-state columns below therefore say **unknown** wherever only the brief speaks.

## What I searched, and what I found

**How I searched:**

- **This repo:** every file under `docs/` and `.colaberry/`.
- **Platform:** the **whole** repository at commit `36c8e38`, all **12,088** tracked files, fetched as one complete snapshot and searched with case-insensitive `git grep`.
- **When:** 2026-10-24.

| Pattern | This repo | Whole platform repo | What the hits are |
|---|---|---|---|
| `Data Analyst` | 3 files | **39 files** | No duty list; breakdown below |
| `DA responsibilit` | 5 files | 7 files | Statements that the material does not exist, and proposed capabilities |
| `DA duties` | 2 files | 2 files | The same warning text |
| `DA to AI` | 0 files | 1 file | `capabilities/admissions.json:5367`: "THE DA-RESPONSIBILITIES-TO-AI SOURCE MATERIAL DOES NOT EXIST FOR THIS DOMAIN" |
| `analyst duties` | 2 files | 4 files | Absence statements, for example `capabilities/curriculum.json:4128` |
| `job description` | 1 file | **12 files** | No human Data Analyst role; breakdown below |

**The 39 platform files matching `Data Analyst`, by kind.** None enumerates the duties of a human Data Analyst at Colaberry.

| Kind | Files | What they are |
|---|---|---|
| Capability definitions | 10 (`backend/src/services/agentDomain/capabilities/*.json`) | Proposed capabilities, or statements that no DA role document exists (for example `website.json:3340`, `executive.json:8745`) |
| Story template | 1 (`agentDomain/agentDomainStoryTemplates.ts`) | The text this story was generated from |
| An unrelated agent | 7 (`backend/src/intelligence/assistant/…`, `docs/agent-catalog/assistant/…`, `intelligence/ai_engine/orchestrator/prompts.py`) | The Assistant's "Data Analyst Agent" and related prompts: "a deterministic SQL-result enricher … unrelated to a DA role" (`capabilities/executive.json:7223`) |
| Course content | 6 (`backend/src/data/…`, `docs/architect-mindset/…`) | A fictional stakeholder persona in a teaching scenario ("The data analyst: what the numbers actually show", `architectMindsetScenario.ts:334`) and wording examples |
| Marketing copy and its tests | 7 (`services/marketing/…`, `routes/admin/__tests__/landingPageRoutes.test.ts`, `timeline/__tests__/…`, `docs/sessions/CC-20260909-m4kt.md`) | Landing-page copy for a course aimed at "working data analysts", and a testimonial fixture ("From nurse to data analyst") |
| Design templates | 3 (`frontend/public/knowledge/design/templates/…`) | Sample copy in case-study and social-post templates |
| Government bid requirements | 3 (`gov-bid-builds/…/requirements.md`) | Third-party requirements documents |
| Demo seed data | 1 (`backend/src/seeds/seedDepartments.ts`) | A team-member label "Data Analyst" on three demo department initiatives (Intelligence, Operations, Finance). A title only, with no duties and nothing to do with Admissions |
| Interview prep | 1 (`backend/src/scripts/sendMiladInterviewPrep.js`) | Salary guidance for an external job interview |

**The 12 platform files matching `job description`.** Every one is about an *agent's* role charter or about hiring, not about a human Data Analyst:

- The `AgentRoleCharter` model, its schema, its architecture notes and session logs (for example `AgentRoleCharter.ts:5`, `docs/architecture/ai-workforce-management/DOMAIN_REUSE_MAP.md:8`).
- The intern programme kickoff page.
- A course module.
- Two capability files.
- **`docs/training-program-2026-q3/TEAM_LEAD_JOB_DESCRIPTIONS.md`**, which holds four hiring job descriptions: Website Team Lead, Marketing Team Lead, AI Team Contract Developer, and a part-time Sales SDR. None is an Admissions role, and none is a Data Analyst.

**Result: the absence is established across the whole platform repo,** not just in the folders I first checked. This matches the platform's own finding (`capabilities/executive.json:8745`).

**The one sourced responsibility list** is Taiwo's launch brief, `16-taiwo-admissions.md:15-55` (scope and reporting cadence) and `:66-69` (approvals). The capability story for this exact job uses the brief's four-report cadence as "the candidate transition set" (`docs/stories/admissions.CAP.da_reporting_responsibility_transition_map.md:90`).

## Responsibilities, one row each

**Verdict key:**

- **Transitions:** the AI side produces the output, and Taiwo keeps only content direction.
- **Splits:** the line is drawn in the "Where the line falls" column.
- **Stays human:** the reason is given in the next section.

"Capability" names the story in `docs/stories/` that would carry the transition, with its build state and autonomy ceiling.

| # | Responsibility (source) | Capability (built today, ceiling) | Verdict | Where the line falls: AI side / human side |
|---|---|---|---|---|
| 1 | **Daily enrollment report:** today, week-to-date, versus the Cohort 1 target, by intensive and by channel (`16-taiwo-admissions.md:17-25`, `:50`) | `daily_enrollment_report` (unknown, R7) | **Splits** | **AI:** computes and assembles the figures daily. **Taiwo:** sets the column list and the "alert Ali" thresholds (`:25`), and makes the escalation call with Ali (`:68`). **Sending** stays outside the agent, because email is a default-denied capability (`daily_enrollment_report.md:73`) |
| 2 | **Refund and churn tracking** (`:23`) | `refund_and_churn_tracking` (unknown, R7) | **Splits** | **AI:** counts and trends refunds and churn. **Ali:** any refund-policy change (`:69`); the agent "reports the pattern and never recommends the remedy" (`refund_and_churn_tracking.md:69`) |
| 3 | **Monthly subscription and MRR report:** new subscriptions, cancellations, net new, MRR and ARR, retention by cohort (`:29-36`, `:52`) | `monthly_subscription_and_mrr_report` (unknown, R7) | **Splits** | **AI:** computes the counts and trends. **Taiwo:** keeps the price table as a human input, because "a revenue figure computed from a price the agent inferred is a fabricated revenue figure" (`monthly_subscription_and_mrr_report.md:70`) |
| 4 | **Weekly cohort progress per student** (`:41`, `:51`) | `weekly_cohort_progress_report` (implemented, R7) | **Transitions** (already done) | **System:** the Weekly Cohort Performance Report "replaces Taiwo's manual Wednesday report". It snapshots to `cohort_report_snapshots` and runs on cron `0 13 * * 3`, which is Wednesdays at 8:00 AM Central (`PROGRESS.md:1920-1928`). **Taiwo:** directs what goes in (`16-taiwo-admissions.md:55`). Note this is a script, not the AI employee |
| 5 | **Identify at-risk students:** no GitHub activity, no lab submission, no community engagement (`:42`) | `at_risk_student_identification_and_handoff` (partial, R6) | **Splits** | **AI:** lists at-risk students, each citing the missing signal. **Human:** acts on the list. The brief's hand-off to an AI SuccessCoach (`:43`) is agent-to-agent coordination, which does not exist for this agent ([document 02](02-agent-anatomy.md), Coordination), so the list goes to a person |
| 6 | **Track who graduates, who drops, and why; cohort retrospective** (`:44`, `:53`) | `cohort_retrospective_report` (unknown, R7) | **Splits** | **AI:** counts who finished and who dropped. **Human:** the *why*. The agent "must never infer a drop reason" (`cohort_retrospective_report.md:71`) |
| 7 | **Human follow-up when an AI nudge does not land within 48 hours** (`:43`) | none | **Stays human** | |
| 8 | **Setting operational report thresholds** (`:68`) | `escalation_threshold_governance` (absent, R2, human-reserved) | **Stays human** | |
| 9 | **Directing what goes into each report** (`:55`) | none | **Stays human** | |
| 10 | **Strategic decisions**, for example refund policy (`:69`) | none | **Stays human** (Ali) | |
| 11 | **Deciding which of these responsibilities move to AI** | `da_reporting_responsibility_transition_map` (absent, R2, human-reserved) | **Stays human** (Taiwo and Ali) | |

**Current state is unknown for rows 1-3 and 6.** These are the daily, monthly and retrospective reports. All four are listed as "Built today: unknown" (for example `daily_enrollment_report.md:5`), and their launch deadlines in June and July 2026 have passed (`16-taiwo-admissions.md:57-62`). Whether Taiwo still produces them by hand, whether something produces them automatically, or whether nobody does, needs a production check and the interview.

**This document does not grant scope.** None of these responsibilities appears in the Admissions AI employee's own description, which covers lead intake only ([document 02](02-agent-anatomy.md)). Moving any of them to the agent first needs Taiwo to write them into its role charter.

## What would show the agent is ready, per transitioning responsibility

Each row needs **all** of its evidence, and the evidence must be a named query, test or snapshot, never a successful demo. Story completion, elapsed time and conversations never count (`promotionCriteria.ts:6-16`).

| # | Responsibility | Evidence that would show readiness | Source of the test |
|---|---|---|---|
| 1 | Daily enrollment report | Every figure reconciles with a re-runnable query, and pending enrollments are reported separately from paid. Taiwo has accepted the column list and each threshold by name. The report has run in shadow next to his own version for a run of days he sets, matching every time | `daily_enrollment_report.md:79`; acceptance by a named human per `promotionCriteria.ts:18-22`; shadow evaluation is R5 (`autonomyLadder.ts:64`) |
| 2 | Refund and churn tracking | Unrecorded reasons are reported as unrecorded, never inferred. Counts reconcile with the payment source for a month Taiwo picks. No output proposes a policy change | `refund_and_churn_tracking.md:75`, `:69` |
| 3 | Monthly subscription and MRR report | Every count reconciles with a re-runnable query, with the source system named. MRR is computed only from the price table Taiwo supplied | `monthly_subscription_and_mrr_report.md:76`, `:70` |
| 4 | Weekly cohort progress (already transitioned) | Every movement claim cites two snapshot rows, and no movement is claimed where only one snapshot exists. Plus a recorded recent run on `/admin/reports` (last run time and status) | `weekly_cohort_progress_report.md:74`; `PROGRESS.md:1929`. Whether it runs today is **unknown** without a production check |
| 5 | Identify at-risk students | Every at-risk student cites the specific missing signal, and a student with no signal is reported as unknown, not at-risk. The person receiving the list is named before the pilot | `at_risk_student_identification_and_handoff.md:79`; R6 pilot (`autonomyLadder.ts:65`) |
| 6 | Cohort retrospective | Counts reconcile with enrollment statuses, and a student with two enrollments is counted once. No drop reason appears that a human did not record | `cohort_retrospective_report.md:77`, `:71` |

The stories set none of these numbers: how many shadow days, which month, which cohort. **Taiwo sets each one.** Until he does, the threshold stays "proposed", and the platform will not treat a proposed threshold as accepted (`promotionCriteria.ts:18-22`).

## Responsibilities that stay human, and why

### From Taiwo's brief

| Responsibility | Who holds it | Why it is reserved |
|---|---|---|
| Follow-up with a student when an AI nudge does not land within 48 hours | A person (not named in the brief) | The brief assigns it to a human (`16-taiwo-admissions.md:43`). It is direct contact with a named student, and no Admissions capability may contact students (`weekly_cohort_progress_report.md:68`) |
| Setting operational report thresholds | Taiwo, with Ali on what gets escalated | The brief gives thresholds to Taiwo (`:68`). "An agent that can set its own threshold can decide what it never has to report" (`escalation_threshold_governance.md:66`) |
| Directing what goes into each report | Taiwo | "CB drafts the report formats; you direct what goes in" (`:55`). A transition that removes his direction "has changed the task rather than automated it" (`da_reporting_responsibility_transition_map.md:50`) |
| Strategic decisions, such as refund policy | Ali, via Approval Queues | `16-taiwo-admissions.md:69` |
| Deciding which responsibilities move to AI | Taiwo and Ali | "a decision about a person's job, and it is not one an agent may make or even recommend unprompted" (`da_reporting_responsibility_transition_map.md:65`) |

### Domain decisions reserved by the capability stories

These 17 are marked "THIS IS A HUMAN DECISION" in their stories. Each story names Taiwo as accountable. For the application-decision rows, the internship spec names Dhee as the approver, which is still unresolved (see "The accountable human" above).

| Capability | Why it is reserved (quoted from the story) | Source |
|---|---|---|
| `admission_decision_recording` | "An admission decision is always a human decision" | `admissions.CAP.admission_decision_recording.md:75` |
| `reviewer_decision_packet_assembly` | "an agent may prepare a decision and may never make one" | `…reviewer_decision_packet_assembly.md:71` |
| `decision_notification_delivery` | "Telling a person they were rejected is the single least reversible thing in this domain" | `…decision_notification_delivery.md:73` |
| `intern_activation` | Activation is when an applicant gets paid programme access, "the advancement of an admission" | `…intern_activation.md:74` |
| `signed_document_verification` | Verification grants paid access, and getting it wrong "grants full paid training free and forever" | `…signed_document_verification.md:67` |
| `eligibility_attestation_blocking_flag` | "an automated eligibility conclusion is an automated admission decision" | `…eligibility_attestation_blocking_flag.md:70` |
| `existing_intern_conversion_planning` | An ambiguous match "merges or splits a real person's record" | `…existing_intern_conversion_planning.md:71` |
| `applicant_reply_draft_preparation` | "Drafting is reversible; sending is not" | `…applicant_reply_draft_preparation.md:70` |
| `admissions_knowledge_curation` | Activating an entry "changes what the organisation tells every subsequent applicant" | `…admissions_knowledge_curation.md:73` |
| `enrollment_conversion_strategy_proposals` | It "changes how Colaberry treats prospective applicants and commits other people's work" | `…enrollment_conversion_strategy_proposals.md:69` |
| `escalation_threshold_governance` | "an agent that can set its own threshold can decide what it never has to report" | `…escalation_threshold_governance.md:66` |
| `da_reporting_responsibility_transition_map` | It is "a decision about a person's job" | `…da_reporting_responsibility_transition_map.md:65` |
| `domain_scope_reconciliation` | "an agent that could set its own scope could extend it" | `…domain_scope_reconciliation.md:64` |
| `manager_surface_access_remediation` | "an agent that can grant access can grant itself access" | `…manager_surface_access_remediation.md:71` |
| `admissions_rbac_path_coverage_audit` | Adding a route-section mapping "changes who can reach applicant data" | `…admissions_rbac_path_coverage_audit.md:66` |
| `applicant_pii_minimization_review` | Narrowing a grant or dropping a column "is a human decision with a migration behind it" | `…applicant_pii_minimization_review.md:67` |
| `scheduler_registry_name_drift_reconciliation` | Correcting a name "changes which registry row governs a running behaviour, including its enabled flag and its tool grants" | `…scheduler_registry_name_drift_reconciliation.md:69` |

## Findings for Taiwo to decide on

1. **Who holds application decisions: you or Dhee?** The platform records you as this domain's manager (`agentDomainRegistry.ts:143-146`). But the internship spec, in its flow decisions of 2026-08-18, says "Dhee approves first", meaning she reviews and accepts applications, and that Dhee grants time-boxed free access (`docs/AI_INTERNSHIP_SPEC.md:186-188`, `:195-197`).

   This matters for 5 of the 17 reserved decisions: admission decisions, decision packets, decision notifications, intern activation and signed-document verification. Each needs a named human. The capability stories record the same dispute, but do not resolve it.

   **Question:** for each of those five, is the accountable human you, Dhee, or one of you as approver with the other informed?
2. **The Admissions AI employee's description covers lead intake only.** None of the six transitioning responsibilities above is in it ([document 02](02-agent-anatomy.md)). Taiwo sets the agent's scope in its role charter.
3. **The daily, monthly and retrospective reports have unknown status.** Their launch deadlines have passed (`16-taiwo-admissions.md:57-62`). **Question:** do you still produce these by hand, does something produce them automatically, or have they stopped?

## The document that would have to be written

The missing source is a **current-state register of the analysis and reporting work done in this domain**. It would turn the brief's intent into evidence of practice. Outline:

1. **Who does the work.** Is there a Data Analyst for Admissions, or is it Taiwo alone? If someone else, who, and how much of their time?
2. **One row per recurring task**, with:
   - who does it
   - cadence
   - systems read (for example CCPP or payments)
   - output and who reads it
   - time it takes
   - what judgement it involves
   - what has gone wrong before
3. **Tasks nobody reads.** The honest outcome for these is to stop, not to automate them (`da_reporting_responsibility_transition_map.md:47`).
4. **Proposed verdict per task:** stays human, transitions or splits, with the line drawn, using the table above as the starting draft.
5. **A success measure per transition**, with the number set by Taiwo.
6. **Sign-off** by Taiwo and Ali for each transition (`da_reporting_responsibility_transition_map.md:65`).

**Who would write it:**

- **Taiwo states the content.** Only he knows how the role is performed.
- **The intended builder captures it in the `RESEARCH-4` manager interview** and drafts it. That builder is Kalkidan Bezabeh (`agentDomainRegistry.ts:178`).
- **Ali approves the transitions.**

The interview itself is arranged by a person outside this project. Nothing in this story schedules it.

## Unknown

- Whether a Data Analyst is assigned to Admissions, separately from Taiwo.
- How the role is actually performed today, including time spent and the judgement in each task.
- Whether the daily, monthly and retrospective reports exist, are manual, or have stopped.
- Whether the weekly cohort report still runs in production.
- Who holds application decisions, Taiwo or Dhee.

## Sources

**This repo**
- `docs/stories/admissions.RESEARCH-3-ROLE-AND-DA-TRANSITION.md:3-7`: the brief and its warning
- `docs/stories/admissions.CAP.da_reporting_responsibility_transition_map.md:47`, `:50`, `:65`, `:90`
- `docs/stories/admissions.CAP.daily_enrollment_report.md:5`, `:73`, `:79`
- `docs/stories/admissions.CAP.refund_and_churn_tracking.md:69`, `:75`
- `docs/stories/admissions.CAP.monthly_subscription_and_mrr_report.md:70`, `:76`
- `docs/stories/admissions.CAP.weekly_cohort_progress_report.md:68`, `:74`
- `docs/stories/admissions.CAP.at_risk_student_identification_and_handoff.md:79`
- `docs/stories/admissions.CAP.cohort_retrospective_report.md:71`, `:77`
- `docs/stories/admissions.CAP.escalation_threshold_governance.md:66`
- The 17 human-reserved capability stories, each at the line given in the table above
- `docs/discovery/01-system-classes.md`, `docs/discovery/02-agent-anatomy.md`

**Platform, commit `36c8e38`**
- `docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:1-3`, `:15-55`, `:57-62`, `:66-69`
- `PROGRESS.md:1920-1929` (the Weekly Cohort Performance Report transition)
- `docs/AI_INTERNSHIP_SPEC.md:186-188`, `:195-197`
- `backend/src/services/agentDomain/agentDomainRegistry.ts:143-158`, `:175`, `:178`
- `backend/src/services/agentDomain/capabilities/executive.json:7223`, `:8745`
- `backend/src/services/agentDomain/capabilities/admissions.json:5367`
- `backend/src/services/agentDomain/capabilities/curriculum.json:4128`
- `backend/src/services/agentDomain/capabilities/website.json:3340`
- `backend/src/models/AgentRoleCharter.ts:5`
- `backend/src/services/agentDomain/promotionCriteria.ts:6-22`
- `backend/src/services/agentDomain/autonomyLadder.ts:64-65`
