# admissions.CAP.application_queue_triage — Application review queue triage

Every live application sits in exactly one bucket with a visible age, so no applicant waits unseen and the reviewer always knows what to pick up next.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so he cannot open this queue or approve an agent's access to it
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership of the internship applicant pipeline is contested: AI_INTERNSHIP_SPEC.md:113-116 and :186-198 assign intake, review and decision to Dhee, CLAUDE_CODE_AI_EMPLOYEE_CONSOLIDATION_LOOP_PROMPT.md:107 assigns internship intake and interviews to Dhee's domain, and AI_INTERNSHIP_DISCOVERY.md:194 assigns the mgmt_role literally named 'admissions' to Dhee rather than to Taiwo; whether this capability belongs to the admissions domain or the internship domain is unresolved
- no field-level minimisation rule exists for what an agent may read from a queue row, so the read is all-or-nothing today

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Application review queue triage
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.application_queue_triage`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
Every live application sits in exactly one bucket with a visible age, so no applicant waits unseen and the reviewer always knows what to pick up next.
Intended users: application_reviewer, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Resolve the caller's section grant (requireSection('internship'))
- Map the requested bucket to its state set (internshipReviewQueue.ts:105)
- Return counts and rows, excluding closed states (internshipApplicationService.ts:37)
- Present, never decide
**Inputs**
- internship_applications rows
- the requested bucket
- the reviewer's session identity
**Outputs**
- bucket counts
- a queue page
- an application detail view
**Exceptions that must be handled**
- Caller lacks the 'internship' section: 403, enforced server-side on every one of the 27 routes
- An applicant holds two application rows, one active and one withdrawn: the active row is the referent (verified-domain-registry.json:57 records exactly this for Kalkidan Bezabeh)
- internshipReviewQueue.ts:14-22 bans surfacing a hidden personality score in the queue, so no derived ranking may be added to it
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_internship_application_queue
**Application surfaces**
- /admin/internship?view=apps (AdminInternshipPage.tsx:36-53)
- frontend/src/pages/admin/internship/InternshipQueue.tsx
- GET /api/admin/internship/queue (internshipRoutes.ts:311)
- GET /api/admin/internship/applications/:id (internshipRoutes.ts:335)
**Source modules**
- backend/src/services/internship/internshipReviewQueue.ts
- backend/src/services/internship/internshipApplicationService.ts
- backend/src/models/InternshipApplication.ts
**Dependencies**
- internship_applications table
- enrollments table for the applicant's name and email
- requireSection('internship')
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Reading the queue means reading the applicant's name, email and phone from the joined enrollment, and mgmtRoles.ts:22-27 records that this is deliberately a wider grant than curriculum access. Until Taiwo has a surface on which to approve that read and a field-level minimisation rule exists, the ceiling is stateful sandbox work on fixtures (autonomy:R4). Reaching production reads is a separate approval, not an extension of this one.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Documents the bucket definitions, the queue's human decisions and its risks; writes nothing.

Acceptance: Every bucket in internshipReviewQueue.ts:105 is described and each is marked as a presentation state or a decision state.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so he cannot open this queue or approve an agent's access to it
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- domain ownership of the internship applicant pipeline is contested: AI_INTERNSHIP_SPEC.md:113-116 and :186-198 assign intake, review and decision to Dhee, CLAUDE_CODE_AI_EMPLOYEE_CONSOLIDATION_LOOP_PROMPT.md:107 assigns internship intake and interviews to Dhee's domain, and AI_INTERNSHIP_DISCOVERY.md:194 assigns the mgmt_role literally named 'admissions' to Dhee rather than to Taiwo; whether this capability belongs to the admissions domain or the internship domain is unresolved
- no field-level minimisation rule exists for what an agent may read from a queue row, so the read is all-or-nothing today
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/routes/admin/internshipRoutes.ts:311 (GET /api/admin/internship/queue)
- backend/src/routes/admin/internshipRoutes.ts:335 (GET /api/admin/internship/applications/:id)
- backend/src/routes/admin/internshipRoutes.ts:59-69 (queue buckets and queryQuerySchema)
- backend/src/services/internship/internshipReviewQueue.ts:125 (queueCounts)
- backend/src/services/internship/internshipReviewQueue.ts:153 (queue)
- backend/src/services/internship/internshipReviewQueue.ts:105 (BUCKET_STATES)
- backend/src/services/internship/internshipApplicationService.ts:37 (OPEN_STATES_EXCLUDED)
- backend/src/models/InternshipApplication.ts:79 (tableName 'internship_applications')
- backend/src/services/access/mgmtRoles.ts:22-27 (why 'internship' is its own section key)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every bucket in internshipReviewQueue.ts:105 is described and each is marked as a presentation state or a decision state.

When every box above is ticked, stop and show the demo.
