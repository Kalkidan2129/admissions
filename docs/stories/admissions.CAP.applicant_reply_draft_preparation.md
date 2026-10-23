# admissions.CAP.applicant_reply_draft_preparation — Applicant reply draft preparation

Routine applicant questions get a consistent, accurate reply quickly, because a draft is waiting for a human to read and send rather than being composed from scratch each time.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- sending requires the default-denied live_email capability (executionPolicy.ts:27); it is recorded as a blocker and deliberately absent from required_tools in every environment
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
- the set of approved answer classes does not exist yet, so the boundary this capability depends on is unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Applicant reply draft preparation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.applicant_reply_draft_preparation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
Routine applicant questions get a consistent, accurate reply quickly, because a draft is waiting for a human to read and send rather than being composed from scratch each time.
Intended users: admissions_operations, application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Classify the question against approved answer classes
- Draft from approved knowledge only, citing the entries used
- Hold the draft for a human
- A human edits and sends
**Inputs**
- the applicant's question
- approved admissions knowledge
- the application state
**Outputs**
- a draft reply held for human review
- a record of which knowledge entries it drew on
**Exceptions that must be handled**
- Question outside the approved answer classes: produce no draft rather than a plausible one, because a plausible draft is the one a busy human sends unread
- Question touches an admission outcome: no draft at all, since only the reviewer may state an outcome
- Draft would contain a price, date or guarantee absent from approved knowledge: refuse
- Draft must never carry reviewer_notes or ai_factors, following the wall at internshipEmails.ts:22-29
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- read_admissions_knowledge
- llm_text_generation
- sandbox_postgres_read
- render_email_template_preview
**Application surfaces**
- none today
**Source modules**
_none recorded_
**Dependencies**
- admissions.admissions_knowledge_curation
- a human send path
- an LLM provider
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Drafting is reversible; sending is not. Sending requires the default-denied live_email capability, so the ceiling is multi-step drafting in sandbox (autonomy:R4). It is marked human_decision because the act that matters, publication to a named applicant, is a human act, and because an unreviewed draft pipeline is indistinguishable in effect from an automated send.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the answer classes, the refusal classes and who sends.

Acceptance: The document names every class for which no draft may be produced, including anything touching an admission outcome.
## Before you start
- sending requires the default-denied live_email capability (executionPolicy.ts:27); it is recorded as a blocker and deliberately absent from required_tools in every environment
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
- the set of approved answer classes does not exist yet, so the boundary this capability depends on is unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/agents/admissions/admissionsEmailAgent.ts (the retired legacy agent whose send behaviour this capability does not inherit)
- backend/src/services/agentRegistryAuditClassification.ts:56-62 (ADMISSIONS_ON_DEMAND_UNWIRED, confirmed_dead, disable true)
- backend/src/services/delivery/execution/executionPolicy.ts:27 (live_email is default-denied)
- backend/src/services/internship/internshipReasonCodes.ts:245 (buildStudentFacingReason, the existing pattern for applicant-facing wording)
- backend/src/services/internship/internshipEmails.ts:22-29 (the structural wall against internal text reaching an applicant)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document names every class for which no draft may be produced, including anything touching an admission outcome.

When every box above is ticked, stop and show the demo.
