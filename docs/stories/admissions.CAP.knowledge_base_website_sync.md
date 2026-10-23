# admissions.CAP.knowledge_base_website_sync — Admissions knowledge base website sync

What the admissions assistant tells a prospect matches what the website says, because the knowledge base is reconciled against the live site daily and drift is flagged rather than discovered by an applicant.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- fetching arbitrary pages risks the default-denied unbounded_network capability (executionPolicy.ts:31); the fetch must be restricted to an explicit allow-list of Colaberry pages, which is not recorded anywhere today
- the knowledge review surface is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146)

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions knowledge base website sync
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.knowledge_base_website_sync`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
What the admissions assistant tells a prospect matches what the website says, because the knowledge base is reconciled against the live site daily and drift is flagged rather than discovered by an applicant.
Intended users: admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Fetch the tracked public pages
- Diff against the stored entry content
- Flag divergence and draft the correction
- Leave activation of a changed entry to a human review step
**Inputs**
- live public page content
- existing admissions_knowledge_entries rows
**Outputs**
- updated or newly drafted knowledge entries
- a stale-entry flag list for a human
**Exceptions that must be handled**
- Page unreachable: flag as unverified rather than marking the entry stale, because an outage is not evidence of drift
- Page changed in a way that contradicts a price or a date: this must escalate rather than auto-publish, since a wrong price reaches applicants
- Entry has no source page: it cannot be synced, so it must be reported as unsourced
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- read_public_page_content
- sandbox_postgres_read
- sandbox_postgres_write
- read_admissions_knowledge
- write_admissions_knowledge_draft
**Application surfaces**
- admin admissions knowledge surface (no sidebar nav entry found)
- GET /api/admin/admissions/knowledge (admissionsRoutes.ts:19)
- PUT /api/admin/admissions/knowledge/:id (admissionsRoutes.ts:21)
**Source modules**
- backend/src/services/agents/admissions/admissionsKnowledgeSyncAgent.ts
- backend/src/models/AdmissionsKnowledgeEntry.ts
**Dependencies**
- public website availability
- admissions_knowledge_entries table
- admissions.admissions_knowledge_curation
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R6**.
Why that ceiling: The knowledge base is what the assistant quotes to applicants, so an unreviewed auto-update propagates straight into applicant-facing claims. Drafting and flagging may reach autonomy:R6 under supervision; activating a changed entry stays a human step, which is why this does not reach autonomy:R7.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Reports which entries differ from their source page.

Acceptance: Every reported divergence quotes both the stored text and the live text.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- fetching arbitrary pages risks the default-denied unbounded_network capability (executionPolicy.ts:31); the fetch must be restricted to an explicit allow-list of Colaberry pages, which is not recorded anywhere today
- the knowledge review surface is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146)
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsKnowledgeSyncAgent
- backend/src/services/agentRegistrySeed.ts:2117
- backend/src/services/aiOpsScheduler.ts:338
- backend/src/services/agents/admissions/admissionsKnowledgeSyncAgent.ts
- backend/src/models/AdmissionsKnowledgeEntry.ts:90 (tableName 'admissions_knowledge_entries')
- backend/src/services/admissionsKnowledgeSeed.ts

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every reported divergence quotes both the stored text and the live text.

When every box above is ticked, stop and show the demo.
