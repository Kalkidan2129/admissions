# admissions.CAP.admissions_rbac_path_coverage_audit — Admissions RBAC path coverage audit

The admissions role can actually reach its own surfaces and no others, because every admissions API path is mapped to a section deliberately rather than falling through a deny-by-default gate nobody noticed.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
- the measured finding this capability exists to catch is already live: a scoped 'admissions' token 403s on all nine /api/admin/admissions routes, while the internship queue is correctly mapped at mgmtSectionGate.ts:101 and additionally guarded per-route

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions RBAC path coverage audit
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.admissions_rbac_path_coverage_audit`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
The admissions role can actually reach its own surfaces and no others, because every admissions API path is mapped to a section deliberately rather than falling through a deny-by-default gate nobody noticed.
Intended users: platform_reliability, admissions_operations, compliance_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Enumerate every mounted /api/admin path
- Resolve each through pathToSection
- Report every unmapped path and name which scoped roles it denies
- Report every path whose per-route guard is broader than its section mapping implies
**Inputs**
- the admin route inventory
- PATH_SECTION
- MGMT_ROLE_DEFS
**Outputs**
- a list of unmapped admin paths with the roles they silently deny
- a list of paths a role reaches that its section grant does not describe
**Exceptions that must be handled**
- An unmapped path is deny-by-default for a scoped role and wide open to a legacy full admin, so the same gap reads as two different defects depending on who calls it, and both must be reported
- A path guarded only by requireAdmin passes any bridge-minted mgmt token, because mgmtBridgeService.ts:89 signs them all with role 'admin'; the section gate is the only thing that narrows them
- A newly added route is unmapped until someone maps it, so this audit must run on change rather than on a schedule to be useful
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
- mgmtSectionGate.ts
- mgmtRoles.ts
- the admin route inventory
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Auditing route-to-section coverage reads only code and changes nothing, so autonomy:R7 is reachable. Adding a PATH_SECTION row changes who can reach applicant data, so that write is always a human decision reviewed by someone who can say which section a surface belongs to.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R1)**
Enumerates admin paths and resolves them through the gate, with baseline tests.

Acceptance: The nine /api/admin/admissions routes and /api/admin/agents are reported as unmapped; a fixture path added to PATH_SECTION disappears from the unmapped list, which is the mutation proof.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
- the measured finding this capability exists to catch is already live: a scoped 'admissions' token 403s on all nine /api/admin/admissions routes, while the internship queue is correctly mapped at mgmtSectionGate.ts:101 and additionally guarded per-route
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/middlewares/mgmtSectionGate.ts:21-146 (PATH_SECTION; verified by grep that no '/api/admin/admissions' row exists)
- backend/src/middlewares/mgmtSectionGate.ts:214-215 (scoped roles: allow only mapped sections, otherwise 403)
- backend/src/middlewares/mgmtSectionGate.ts:44-56 (the gate's own warning that an unmapped path is a latent 403 with nothing explaining why)
- backend/src/routes/admin/admissionsRoutes.ts:17-25 (nine routes, all requireAdmin only, no requireSection)
- backend/src/routes/adminRoutes.ts:257 (router.use(admissionsRoutes), no section guard at the mount)
- backend/src/services/access/mgmtBridgeService.ts:89 (a bridge-minted non-owner mgmt token is signed with role 'admin', so it passes requireAdmin)
- backend/src/middlewares/authMiddleware.ts:55 (ADMIN_ROLES is admin and super_admin)
- verified by grep: '/api/admin/agents' is also absent from PATH_SECTION
- docs/architecture/ai-workforce-management/employees/curriculum/MANAGER_ACCESS_PLAN.md:20 (the same fix, M2, proposed for /api/admin/agents)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The nine /api/admin/admissions routes and /api/admin/agents are reported as unmapped; a fixture path added to PATH_SECTION disappears from the unmapped list, which is the mutation proof.

When every box above is ticked, stop and show the demo.
