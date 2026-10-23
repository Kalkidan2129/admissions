# admissions.CAP.applicant_pii_minimization_review — Applicant PII minimization review

The organisation knows exactly which applicant fields each surface and each role can reach, so a widening of access is a deliberate decision rather than a side effect of adding a route.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
- whether any of these columns are encrypted at rest is unknown; no encryption attribute appears in the model definitions and the migrations were not inspected

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Applicant PII minimization review
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.applicant_pii_minimization_review`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
The organisation knows exactly which applicant fields each surface and each role can reach, so a widening of access is a deliberate decision rather than a side effect of adding a route.
Intended users: compliance_reviewer, admissions_operations, platform_reliability.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Enumerate the applicant-PII columns across every model in scope
- Map each surface to the columns it returns
- Map each role to the surfaces it reaches
- Report fields reachable by a role with no stated need for them
**Inputs**
- the model and column inventory
- the route and section map
- the role definitions
**Outputs**
- a field-level exposure matrix per role and per surface
- a named list of fields no role currently needs
**Exceptions that must be handled**
- A JSON blob column: LeadRecommendation.ts:27 lead_data cannot be redacted at column level, so it must be reported as un-minimisable rather than as compliant
- accommodation_request is free text likely to carry disability or health disclosure, so it is the highest-sensitivity field in the schema and needs its own named rule
- work_auth_category carries immigration category, which has adverse-impact implications if it reaches an assessment path
- A field with no reader: report it, because a stored field nobody reads is pure liability
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_static_read
- read_rbac_section_map
**Application surfaces**
- none today
**Source modules**
_none recorded_
**Dependencies**
- the model definitions
- mgmtSectionGate PATH_SECTION
- mgmtRoles MGMT_ROLE_DEFS
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: This capability reads code and configuration, never applicant data, which is why its own pii_exposure is none. Producing the matrix is an authorizable action class at autonomy:R7. Acting on it, by narrowing a grant or dropping a column, is a human decision with a migration behind it, which is why human_decision is true.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R1)**
Builds the exposure matrix from the static definitions with baseline tests.

Acceptance: Every applicant-PII column named in this matrix's evidence appears in the output; a deliberately omitted column causes the completeness test to fail.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
- whether any of these columns are encrypted at rest is unknown; no encryption attribute appears in the model definitions and the migrations were not inspected
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/access/mgmtRoles.ts:22-27 (the queue carries an applicant's resume, phone number and interview transcript, a materially wider grant than editing curriculum)
- backend/src/models/InternshipAdministrativeIntake.ts:61-77 (legal_name, phone, resume_document_id, linkedin_url, work_auth_category, accommodation_request)
- backend/src/models/InternshipAdministrativeIntake.ts:72 (work_auth_category)
- backend/src/models/InternshipAdministrativeIntake.ts:76 (accommodation_request, free text)
- backend/src/models/InternshipInterviewSession.ts:53 (transcript)
- backend/src/models/InternshipDocument.ts:70-71 (storage_key, original_filename)
- backend/src/models/RawLeadPayload.ts:23-25 (headers, body, remote_ip)
- backend/src/models/LeadRecommendation.ts:27 (lead_data as an unstructured JSON blob, so column-level redaction is impossible)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every applicant-PII column named in this matrix's evidence appears in the output; a deliberately omitted column causes the completeness test to fail.

When every box above is ticked, stop and show the demo.
