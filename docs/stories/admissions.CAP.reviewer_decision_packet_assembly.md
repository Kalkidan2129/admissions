# admissions.CAP.reviewer_decision_packet_assembly — Reviewer decision packet assembly

A reviewer opens an application and finds one assembled packet (requirement checks, outstanding items, interview coverage, document status, prior history) instead of visiting five tabs, which shortens time-to-decision without moving the decision.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Reviewer decision packet assembly
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.reviewer_decision_packet_assembly`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
A reviewer opens an application and finds one assembled packet (requirement checks, outstanding items, interview coverage, document status, prior history) instead of visiting five tabs, which shortens time-to-decision without moving the decision.
Intended users: application_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Gather the already-computed components
- Present them in one ordered view
- Name what is missing as missing
- Stop before any statement of what the decision should be
**Inputs**
- the application
- requirement check results
- interview coverage
- document status
- decision history
**Outputs**
- one assembled, read-only decision packet carrying no score and no recommended outcome
**Exceptions that must be handled**
- A component unavailable: show it as unavailable rather than omitting the section, because a silently absent section reads as nothing-to-see
- Packet must carry no score and no rank, inheriting internshipRecommendation.ts:4-12
- Packet must never include reviewer_notes from a prior decision in a way that could reach the applicant, since InternshipDecision.ts:61 is internal
- A packet that leads with a suggested outcome is an automated decision in presentation form, and must be rejected in review
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_internship_application_queue
- read_applicant_interview_responses
- read_applicant_documents
- read_status_event_audit
**Application surfaces**
- /admin/internship?view=apps (proposed extension)
**Source modules**
_none recorded_
**Dependencies**
- admissions.applicant_assessment_preparation
- admissions.application_queue_triage
- a reviewer surface
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: This is the clearest expression of the domain's central rule: an agent may prepare a decision and may never make one. Shadow assembly against applications already decided (autonomy:R5) proves the packet is complete and unbiased without the packet ever carrying authority. It stops below automation because a packet produced unattended, read by a reviewer under time pressure, is functionally a decision.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the packet's sections, what it must never contain and who decides.

Acceptance: The document states that no score, rank or suggested outcome may appear and names the reviewer as the decision-maker.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership is contested between the admissions and internship domains
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- composes admissions.applicant_assessment_preparation, admissions.interview_progress_tracking, admissions.eligibility_attestation_blocking_flag and admissions.applicant_lifecycle_audit_trail
- backend/src/services/internship/internshipReviewQueue.ts:338 (applicationDetail, the surface a packet would extend)
- backend/src/services/internship/internshipRecommendation.ts:4-12 (the no-score, no-rank constraint a packet must inherit)
- docs/project-lifecycle/approval-and-change-policy.md (an AI identity never populates a product approval)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document states that no score, rank or suggested outcome may appear and names the reviewer as the decision-maker.

When every box above is ticked, stop and show the demo.
