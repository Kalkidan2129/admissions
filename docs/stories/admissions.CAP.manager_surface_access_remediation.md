# admissions.CAP.manager_surface_access_remediation — Manager surface access remediation

Taiwo can actually open, question and supervise the AI employee he is accountable for, which is the precondition every other capability in this matrix is waiting on.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- Ali's approval is required for the admin_users row (MANAGER_ACCESS_PLAN.md:19), and no agent may substitute for it
- Taiwo's identity is ambiguous across documents (taiwooludimimu@gmail.com in org_members versus taiwo@colaberry.com elsewhere, plus a differently-surnamed Taiwo at the second address), so which address the row should carry is unknown without a human confirming it
- which section set his scoped mgmt_role should hold is undecided: the role literally named 'admissions' (mgmtRoles.ts:60) is recommended for Dhee in AI_INTERNSHIP_DISCOVERY.md:194, while PROGRESS.md:11185 records an intent to assign Taiwo the 'revenue' role
- this programme's execution contract forbids any access grant (execution-contract.md:117-119), so remediation is recorded here and performed elsewhere

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Manager surface access remediation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.manager_surface_access_remediation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
Taiwo can actually open, question and supervise the AI employee he is accountable for, which is the precondition every other capability in this matrix is waiting on.
Intended users: admissions_operations, executive, platform_reliability.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Gate one: create one admin_users row for Taiwo through the existing admin-user path, role admin with a scoped mgmt_role, is_ai_operated false, approved by Ali
- Gate two: map the admissions and agent paths into PATH_SECTION so the scoped token is not denied by default
- Gate three: requireAgentManagerOrAdmin already exists and already refuses any agent outside the manager's reporting chain, so it needs nothing
- Verify by having Taiwo actually open his employee's surface, not by asserting that he can
**Inputs**
- Taiwo's org_members identity
- the section set his role needs
- Ali's approval
**Outputs**
- a reachable manager surface
- a verified end-to-end access check
**Exceptions that must be handled**
- Granting role admin without a scoped mgmt_role would give him everything, which is wider than his accountability and must not be the fix
- Mapping a path widens nobody's authority by itself: it only lets the section gate hand the request on to the manager check
- Taiwo's identity is ambiguous across documents: org_members holds taiwooludimimu@gmail.com while several files use taiwo@colaberry.com, and one mockup names a different person, Taiwo Arowojiola, at that address; the row must be created against the measured org_members email and nothing else
- Verification must be an observed login, because HUMAN_OWNERSHIP_MAP.md:44-46 requires Phase 5 to verify the manager actually did reach it
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_static_read
- read_rbac_section_map
**Application surfaces**
- /admin/dashboard
- /admin/internship
- the Agent Detail and Talk surfaces
**Source modules**
- backend/src/middlewares/agentManagerAuthMiddleware.ts
- backend/src/middlewares/mgmtSectionGate.ts
- backend/src/services/access/mgmtRoles.ts
**Dependencies**
- Ali as approver
- the existing admin-user creation path
- admissions.admissions_rbac_path_coverage_audit
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: Creating an identity that can read applicant data is an access grant, and an agent that can grant access can grant itself access. The agent's ceiling is autonomy:R2: report the blocker, name the three gates and name the approver. The grant is Ali's write and the verification is an observed human login.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents the three gates, the measured blocker, the approver and the rollback.

Acceptance: The document names all three gates in order, cites the admissions blocker at agentDomainRegistry.ts:148-151, names Ali as approver and states that rollback is deleting the row.
## Before you start
- Ali's approval is required for the admin_users row (MANAGER_ACCESS_PLAN.md:19), and no agent may substitute for it
- Taiwo's identity is ambiguous across documents (taiwooludimimu@gmail.com in org_members versus taiwo@colaberry.com elsewhere, plus a differently-surnamed Taiwo at the second address), so which address the row should carry is unknown without a human confirming it
- which section set his scoped mgmt_role should hold is undecided: the role literally named 'admissions' (mgmtRoles.ts:60) is recommended for Dhee in AI_INTERNSHIP_DISCOVERY.md:194, while PROGRESS.md:11185 records an intent to assign Taiwo the 'revenue' role
- this programme's execution contract forbids any access grant (execution-contract.md:117-119), so remediation is recorded here and performed elsewhere
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/agentDomain/agentDomainRegistry.ts:148-151 (the admissions blocker: org_members row and four reporting agents, but no admin_users row)
- backend/src/services/agentDomain/agentDomainRegistry.ts:146 (manager_identity_id 1fbb5316-1381-4b8a-81a8-3a7325b39d5f)
- docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:15 (Taiwo's row: login none)
- docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:39 (four agents report to him)
- docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:44-46 (program prerequisite: Phase 1 must state how the manager will reach it, Phase 5 must verify)
- docs/architecture/ai-workforce-management/employees/curriculum/MANAGER_ACCESS_PLAN.md:7-13 (the three gates in order)
- docs/architecture/ai-workforce-management/employees/curriculum/MANAGER_ACCESS_PLAN.md:19 (M1: one admin_users row, role admin, a scoped mgmt_role, is_ai_operated false, created through the existing admin-user path, approver Ali, rollback is deleting the row)
- docs/architecture/ai-workforce-management/employees/curriculum/MANAGER_ACCESS_PLAN.md:26 (Aleem, Taiwo, Kes and Roselyn are in the same position)
- backend/src/middlewares/agentManagerAuthMiddleware.ts:50 (requireAgentManagerOrAdmin exists; MANAGER_AUTHORIZATION_MAP.md:19 is the older document and says it does not)
- docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:64 (a decision on how managers without an admin login reach their employee is a precondition)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document names all three gates in order, cites the admissions blocker at agentDomainRegistry.ts:148-151, names Ali as approver and states that rollback is deleting the row.

When every box above is ticked, stop and show the demo.
