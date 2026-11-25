# admissions.CAP.maya_quoted_email_draft_for_approval — Quoted follow-up email drafted for a person to approve

**CANDIDATE -- not started, not assigned.** This is one line on this domain's list of everything its agent could eventually do. It becomes real work only when the builder picks it and their manager agrees, at which point it opens as four stories. Until then it is deliberately inert, and the honest status of it is "not started" rather than "behind".

A visitor who asks to be sent something in writing gets a follow-up email that quotes only approved marketing material, drafted in the conversation and held for a person, so the claims in it trace to an asset rather than to an improvisation.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm the scope as admissions conversational work; the quotable-asset rules it depends on are Sohail Syed's and may move this record to the marketing domain on review

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)

Full build prompt is attached to this story.

**Release:** autonomy:R0 · Legacy migration plan (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Quoted follow-up email drafted for a person to approve
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.maya_quoted_email_draft_for_approval`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
A visitor who asks to be sent something in writing gets a follow-up email that quotes only approved marketing material, drafted in the conversation and held for a person, so the claims in it trace to an asset rather than to an improvisation.
Intended users: prospective_applicant, admissions_operations, marketing_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Retrieve the quotable assets and their copy rules (mayaQuoteComposer.quotableMaterialForMaya)
- Compose a subject and body citing assets by id
- Refuse any citation that is not a real asset id
- Hold the result as a draft; nothing is sent by this capability
**Inputs**
- a subject and body composed in the conversation
- the ids of the quotable assets the message draws on
- the quotable-asset digest and its copy rules
**Outputs**
- a draft held for a human decision
- a record of which assets were cited
**Exceptions that must be handled**
- A cited asset id does not exist: refuse the draft, because a citation nobody can resolve is indistinguishable from an invented one
- The draft states a price, a cohort date, a deadline or a seat count: refuse, because those are not Maya's to state and an applicant will act on them
- Subject or body missing: refuse rather than composing the missing half
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- draft_marketing_email
- list_quotable_marketing_assets
- llm_text_generation
**Application surfaces**
- public marketing pages hosting the chat widget
- POST /api/chat/message (trackingRoutes.ts:76)
**Source modules**
- backend/src/services/mayaActionService.ts
- backend/src/services/mayaQuoteComposer.ts
**Dependencies**
- admissions.maya_applicant_chat_response
- the quotable-asset registry and its copy rules
- marketing's brand governance
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R6**.
Why that ceiling: Composing is autonomy:R6 work because this capability cannot reach anyone: its effect class is compose_only and the draft sits until a person acts. The ceiling stays below R7 because the copy rules it enforces are the brand boundary, and a drafting capability that silently stopped enforcing them would be invisible until a claim reached a prospect.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R2)**
Drafts with every citation resolved against a real asset id.

Acceptance: On a fixture set including invalid ids, every invalid citation is refused and no draft is produced with an unresolvable id.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/mayaActionService.ts:242 (the draft_marketing_email tool definition: 'It is NOT sent')
- backend/src/services/mayaActionService.ts:335 (the dispatch case)
- backend/src/services/mayaActionService.ts:362 (handleDraftMarketingEmail)
- backend/src/services/mayaQuoteComposer.ts:133 (composeQuotedEmail)
- backend/src/services/maya/mayaToolGovernance.ts:157 (draft_marketing_email -> composeMarketingDraft, effectClass compose_only)
- backend/src/services/agentRegistrySeed.ts:3378

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.


When every box above is ticked, stop and show the demo.
