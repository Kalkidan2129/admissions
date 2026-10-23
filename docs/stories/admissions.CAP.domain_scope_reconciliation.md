# admissions.CAP.domain_scope_reconciliation — Admissions domain scope reconciliation

The admissions AI employee is built against one agreed scope, so work is not done twice across two domains and no part of the applicant journey is left with no owner.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- this is itself the blocker that most of the applicant-pipeline capabilities in this matrix carry: fourteen of the 47 name contested ownership between the admissions and internship domains
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so he cannot participate in the reconciliation on any surface
- Taiwo's own role brief cites a source section that does not exist, so his authoritative scope statement is unverifiable from documents alone

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions domain scope reconciliation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.domain_scope_reconciliation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
The admissions AI employee is built against one agreed scope, so work is not done twice across two domains and no part of the applicant journey is left with no owner.
Intended users: executive, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Lay the conflicting statements side by side with their citations
- Identify every capability whose owner is ambiguous
- Put the boundary question to Ali, who owns the domain assignment
- Record the decision as the scope of record
**Inputs**
- the conflicting scope statements
- the role-to-section map
- the two domains' legacy slices
**Outputs**
- one agreed scope boundary between the admissions and internship domains
- a decision on which mgmt_role Taiwo holds
**Exceptions that must be handled**
- The collision is structural, not merely textual: the mgmt_role string 'admissions' and the domain_key 'admissions' are different objects with different intended holders, and renaming either one has downstream effects
- A capability left on both sides of the boundary will be built twice; one left on neither side will be built by nobody, and the second failure is quieter
- No document reconciles the two scope statements, so this cannot be resolved by reading more; it needs a decision
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_static_read
**Application surfaces**
- none
**Source modules**
_none recorded_
**Dependencies**
- Ali as the decision-maker
- the internship domain's capability matrix
- mgmtRoles.ts
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: Which responsibilities belong to which AI employee is a governance decision about accountability, and an agent that could set its own scope could extend it. The agent may lay out the conflict with citations (autonomy:R2); the boundary is Ali's to draw.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents both scope statements with citations, the role-versus-domain name collision, and every ambiguous capability.

Acceptance: Every capability in this matrix whose ownership is contested is listed, and the count matches the number of capabilities carrying the contested-ownership blocker.
## Before you start
- this is itself the blocker that most of the applicant-pipeline capabilities in this matrix carry: fourteen of the 47 name contested ownership between the admissions and internship domains
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so he cannot participate in the reconciliation on any surface
- Taiwo's own role brief cites a source section that does not exist, so his authoritative scope statement is unverifiable from documents alone
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- CLAUDE_CODE_AI_EMPLOYEE_CONSOLIDATION_LOOP_PROMPT.md:105 (Taiwo's scope given as applicant journey, lead qualification, admissions communications, appointments, interviews, admissions conversion)
- CLAUDE_CODE_AI_EMPLOYEE_CONSOLIDATION_LOOP_PROMPT.md:107 (the internship domain's scope given as internship intake, interviews, onboarding, project placement, progress, completion and employment readiness)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:3 (his brief instead gives enrollment monitoring, retention tracking, subscription growth and student lifecycle reporting, and mentions none of intake, communications, appointments or interviews)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:89 (cites TRAINING_INTEGRATION_PLAN.md Section 4 as its source, which does not exist in that file)
- backend/src/services/access/mgmtRoles.ts:60 (the mgmt_role named 'admissions' holds dashboard, lead_ingestion and internship)
- docs/AI_INTERNSHIP_DISCOVERY.md:194 (the recommendation that Dhee gets the 'admissions' role)
- docs/AI_INTERNSHIP_SPEC.md:113-116 (the portal replaces the email intake entirely and is managed by Dhee)
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/internship.json (the internship domain carries exactly one legacy row, WorkforceCareerDirector)
- PROGRESS.md:11185 (an intent to assign Taiwo the 'revenue' mgmt role rather than 'admissions')

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every capability in this matrix whose ownership is contested is listed, and the count matches the number of capabilities carrying the contested-ownership blocker.

When every box above is ticked, stop and show the demo.
