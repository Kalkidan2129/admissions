# admissions.CAP.signed_document_verification — Signed document verification

A person only gets paid programme access after a human has actually looked at their signed documents, so verification is a check rather than a formality.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
- whether payment_pending is reachable in production depends on a cohort requires_subscription setting whose default was not read, so the live gate's behaviour is unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Signed document verification
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.signed_document_verification`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
A person only gets paid programme access after a human has actually looked at their signed documents, so verification is a check rather than a formality.
Intended users: application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- A human opens and reads the signed document
- Verify or reject it, with verified_by taken from the session
- Transition on the reviewer-only edge
- Route through payment_pending unless an active subscription or an active comp is recorded
**Inputs**
- the uploaded signed document
- the reviewer's authenticated identity
**Outputs**
- a verified document with verified_by set
- a transition to documents_verified, then payment_pending or activation_pending
**Exceptions that must be handled**
- Document unreadable or unsigned: reject with a reason rather than verifying
- An agent attempting this transition: structurally impossible, the edge at internshipStateMachine.ts:191 lists only the reviewer actor
- Comp granted instead of payment: hasActiveComp is deliberately separate from hasActiveSubscription so free access is auditable
- INTENDED_INTERN_ROSTER_2026-10-07.md:24-25: Ruth Kumera is at signed_documents_uploaded and must not be advanced or activated by this programme
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
**Application surfaces**
- /admin/internship?view=apps
- POST /api/admin/internship/documents/:documentId/verify (internshipRoutes.ts:780)
**Source modules**
- backend/src/services/internship/internshipDocumentService.ts
- backend/src/services/internship/internshipStateMachine.ts
**Dependencies**
- admissions.offer_document_package_generation
- internshipStateMachine.ts
- an authenticated human reviewer
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: Verification is the gate that converts an applicant into a person with paid programme access, and AI_INTERNSHIP_DISCOVERY.md:118-139 records that getting it wrong grants full paid training free and forever. It is reviewer-only on the state machine edge, so the agent's ceiling is autonomy:R2, answering questions about verifications already performed. An agent may never verify a document, and an agent may never self-verify a document it generated.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the verification gate, the payment gate and the comp-versus-subscription distinction.

Acceptance: The document names verification as a human decision and states the free-access failure mode from AI_INTERNSHIP_DISCOVERY.md:118-139.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
- whether payment_pending is reachable in production depends on a cohort requires_subscription setting whose default was not read, so the live gate's behaviour is unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/routes/admin/internshipRoutes.ts:780 (POST /api/admin/internship/documents/:documentId/verify)
- backend/src/services/internship/internshipDocumentService.ts:405 (verifyDocument)
- backend/src/services/internship/internshipStateMachine.ts:191 (signed_documents_uploaded to documents_verified, reviewer actor only)
- backend/src/services/internship/internshipStateMachine.ts:345 (stateAfterDocumentsVerified)
- backend/src/services/internship/internshipStateMachine.ts:318-344 (hasActiveSubscription and hasActiveComp kept separate so who got in free is auditable)
- backend/src/services/internship/internshipStateMachine.ts:48-54 (why payment_pending was added)
- backend/src/models/InternshipDocument.ts:78 (verified_by)
- docs/AI_INTERNSHIP_DISCOVERY.md:118-139 (built literally, document verification granted full paid training free, forever)
- docs/architecture/ai-workforce-management/INTENDED_INTERN_ROSTER_2026-10-07.md:24-25 (Ruth Kumera's documents are uploaded, awaiting staff verification)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document names verification as a human decision and states the free-access failure mode from AI_INTERNSHIP_DISCOVERY.md:118-139.

When every box above is ticked, stop and show the demo.
