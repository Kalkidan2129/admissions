# admissions.CAP.admissions_knowledge_curation — Admissions knowledge curation

Every answer given to a prospective applicant traces to an approved, current knowledge entry, so what the organisation says about its programme is one thing rather than several.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the curation surface is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146) and mgmtSectionGate.ts:214-215 is deny-by-default for scoped roles; these three routes use only requireAdmin (admissionsRoutes.ts:19-21)
- no entry-level owner or review-by date exists on admissions_knowledge_entries, so there is no mechanism that makes a stale price or date surface on its own

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions knowledge curation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.admissions_knowledge_curation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
Every answer given to a prospective applicant traces to an approved, current knowledge entry, so what the organisation says about its programme is one thing rather than several.
Intended users: admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Draft or correct the entry
- Set category, keywords and priority so retrieval can find it
- A human activates it
- Retire the superseded entry rather than leaving two answers live
**Inputs**
- a proposed or corrected entry
- its category, keywords and priority
**Outputs**
- an active knowledge entry the assistant can retrieve
- a deactivated superseded entry
**Exceptions that must be handled**
- Two active entries contradict each other: this is the failure mode that reaches applicants, so a contradiction must block activation
- An entry states a price, a date or a guarantee: it needs a named human owner, because an outdated commitment is quoted to applicants as current
- Entry with no keywords: it will never be retrieved, so it must be reported as unreachable rather than counted as coverage
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_admissions_knowledge
- write_admissions_knowledge_draft
- llm_text_generation
**Application surfaces**
- admin admissions knowledge surface (no sidebar nav entry found)
- GET /api/admin/admissions/knowledge (admissionsRoutes.ts:19)
- POST /api/admin/admissions/knowledge (admissionsRoutes.ts:20)
- PUT /api/admin/admissions/knowledge/:id (admissionsRoutes.ts:21)
**Source modules**
- backend/src/services/admissionsKnowledgeService.ts
- backend/src/services/admissionsKnowledgeSeed.ts
- backend/src/models/AdmissionsKnowledgeEntry.ts
**Dependencies**
- admissions.knowledge_base_website_sync
- admissions.maya_applicant_chat_response
- admissions_knowledge_entries table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R6**.
Why that ceiling: Drafting carries no PII and is reversible, but activating an entry changes what the organisation tells every subsequent applicant, which makes activation a human decision. Supervised drafting (autonomy:R6) is the ceiling, and the active flag stays a human write.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R2)**
Answers which entry covers a given question and which questions have no coverage.

Acceptance: Every coverage claim cites an entry id; every gap is reported rather than filled with a generated answer.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the curation surface is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146) and mgmtSectionGate.ts:214-215 is deny-by-default for scoped roles; these three routes use only requireAdmin (admissionsRoutes.ts:19-21)
- no entry-level owner or review-by date exists on admissions_knowledge_entries, so there is no mechanism that makes a stale price or date surface on its own
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/routes/admin/admissionsRoutes.ts:19 (GET /api/admin/admissions/knowledge)
- backend/src/routes/admin/admissionsRoutes.ts:20 (POST /api/admin/admissions/knowledge)
- backend/src/routes/admin/admissionsRoutes.ts:21 (PUT /api/admin/admissions/knowledge/:id)
- backend/src/models/AdmissionsKnowledgeEntry.ts:30-36 (category, title, content, keywords, priority, active)
- backend/src/models/AdmissionsKnowledgeEntry.ts:90 (tableName 'admissions_knowledge_entries')
- backend/src/services/admissionsKnowledgeService.ts:8 (findRelevantKnowledge)
- backend/src/services/admissionsKnowledgeService.ts:75 (buildKnowledgeContext)
- backend/src/services/admissionsKnowledgeSeed.ts

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every coverage claim cites an entry id; every gap is reported rather than filled with a generated answer.

When every box above is ticked, stop and show the demo.
