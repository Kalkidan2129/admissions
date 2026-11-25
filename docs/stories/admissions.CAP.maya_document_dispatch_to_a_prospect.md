# admissions.CAP.maya_document_dispatch_to_a_prospect — Programme document dispatch to a prospect

**CANDIDATE -- not started, not assigned.** This is one line on this domain's list of everything its agent could eventually do. It becomes real work only when the builder picks it and their manager agrees, at which point it opens as four stories. Until then it is deliberately inert, and the honest status of it is "not started" rather than "behind".

A prospective applicant who asks for the programme overview or the executive briefing receives that document by email, from the approved document set, with a person having read the message before it left.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm which documents a prospect may be sent unprompted and which require a person's decision; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no approved document set is recorded anywhere as data; the document types live in the prompt text

Full build prompt is attached to this story.

**Release:** autonomy:R0 · Legacy migration plan (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Programme document dispatch to a prospect
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.maya_document_dispatch_to_a_prospect`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
A prospective applicant who asks for the programme overview or the executive briefing receives that document by email, from the approved document set, with a person having read the message before it left.
Intended users: prospective_applicant, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Resolve the requested document against the approved set (mayaActionService.ts:395)
- Refuse and log when the document or the recipient address is absent
- Hand the composed message to the delivery seam, which resolves the capability's mode
- Queue it for a per-message human approval rather than sending it
**Inputs**
- the document type the visitor asked for
- the visitor's email address, given by the visitor
- the approved document set
**Outputs**
- a queued outbound message awaiting a per-message human approval
- an admissions_action_logs entry recording the attempt and its outcome
**Exceptions that must be handled**
- No recipient address in the conversation: refuse, because a document emailed to an address the visitor did not give is unsolicited contact
- A document outside the approved set: refuse, because an attachment nobody approved is an unreviewed claim about the programme
- The capability resolves off or the kill switch is unreadable: refuse and say so honestly rather than silently dropping the request
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- send_document
- sandbox_postgres_read
- sandbox_postgres_write
**Application surfaces**
- public marketing pages hosting the chat widget
- the agent workspace's Outbound approvals tab
- POST /api/chat/message (trackingRoutes.ts:76)
**Source modules**
- backend/src/services/mayaActionService.ts
- backend/src/services/maya/deliverOrQueue.ts
- backend/src/services/maya/mayaOutboundQueue.ts
**Dependencies**
- admissions.maya_applicant_chat_response
- the outbound approval queue
- an email provider
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: The ceiling is autonomy:R5 and deliberately stops below unattended sending. This is the only one of Maya's four unrecorded capabilities that puts a message in a stranger's inbox, and the queue exists because an agent that can email a prospect without a person reading it first is the failure this system was built to prevent. Raising it past R5 would mean deleting the approval step, which is a decision for Ali rather than a tuning change.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R2)**
Composes the request and queues it; a person approves every message.

Acceptance: No message reaches a recipient without an approval row naming the human who approved it, and a replay of the same approval delivers nothing a second time.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no approved document set is recorded anywhere as data; the document types live in the prompt text
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/mayaActionService.ts:81 (the send_document tool definition)
- backend/src/services/mayaActionService.ts:395 (handleSendDocument)
- backend/src/services/mayaActionService.ts:490 (the delivery seam that queues rather than sends)
- backend/src/services/maya/deliverOrQueue.ts (EffectOutcome: delivered | queued | refused | shadowed | failed)
- backend/src/services/maya/mayaOutboundQueue.ts:118 (enqueueOutbound)
- backend/src/services/maya/mayaToolGovernance.ts:175 (send_document -> sendDocument, effectClass outbound)
- backend/src/services/admissionsMayaService.ts:148 (the prompt line that tells her the tool exists)
- backend/src/services/admissionsMayaService.ts:241 (never call it without the contact details)
- backend/src/services/agentPermissionService.ts:125
- backend/src/services/agentRegistrySeed.ts:3366

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.


When every box above is ticked, stop and show the demo.
