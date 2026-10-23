# admissions.CAP.page_event_admissions_enrichment — Visitor page-event admissions enrichment

Every page view by a prospective applicant carries admissions context (interest signals, programme affinity), so a later conversation starts from what the person already looked at instead of from zero.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has an org_members row and is the reports_to target for 4 agents but no admin_users row (agentDomainRegistry.ts:148-151), so he cannot review, approve or supervise this capability on any surface today
- no AI employee exists for this domain: agentDomainRegistry.ts:155 agent_id is null and requested_capabilities is [] (:157)
- agent-to-agent handoff is absent from the platform (execution-contract.md:116), so autonomy:R8 is unreachable for every capability in this domain
- visitors.ip_address and user_agent (Visitor.ts:38-39) sit in the same row this capability writes to; no column-level read restriction exists today

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Visitor page-event admissions enrichment
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.page_event_admissions_enrichment`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
Every page view by a prospective applicant carries admissions context (interest signals, programme affinity), so a later conversation starts from what the person already looked at instead of from zero.
Intended users: admissions_operations, admissions_chat_assistant.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read page events since the last run watermark
- Resolve each event to a visitors row by fingerprint
- Classify the page into an admissions interest signal
- Write the tag only; never write an identity column
**Inputs**
- PageEvent rows since the last watermark
- visitors.fingerprint / utm_* / referrer_domain (Visitor.ts:31-56)
**Outputs**
- interest-signal tags on the visitor record
- enriched admissions context consumed by prompt assembly
**Exceptions that must be handled**
- No matching visitors row: skip, do not create one
- Unrecognised page slug: record as unclassified rather than guessing a programme
- Backlog larger than one window: process oldest first, idempotent on (visitor_id, event_id)
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_visitor_analytics
**Application surfaces**
- /admin/visitors
**Source modules**
- backend/src/services/agents/admissions/admissionsVisitorActivityAgent.ts
- backend/src/models/Visitor.ts
- backend/src/models/VisitorSession.ts
**Dependencies**
- visitors table
- PageEvent ingestion
- aiOpsScheduler cron registration
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: The write is a derived tag on a record that already exists, reversible by re-running, and it touches no applicant-facing surface, so an explicitly authorized 'tag a visitor interest signal' action class at autonomy:R7 is defensible. It stops there because autonomy:R8 handoffs do not exist on this platform.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'what did this visitor look at' from already-written tags, no writes.

Acceptance: 20 sampled visitor summaries match the underlying page events with zero fabricated page titles.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has an org_members row and is the reports_to target for 4 agents but no admin_users row (agentDomainRegistry.ts:148-151), so he cannot review, approve or supervise this capability on any surface today
- no AI employee exists for this domain: agentDomainRegistry.ts:155 agent_id is null and requested_capabilities is [] (:157)
- agent-to-agent handoff is absent from the platform (execution-contract.md:116), so autonomy:R8 is unreachable for every capability in this domain
- visitors.ip_address and user_agent (Visitor.ts:38-39) sit in the same row this capability writes to; no column-level read restriction exists today
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsVisitorActivityAgent
- backend/src/services/agentRegistrySeed.ts:805
- backend/src/services/aiOpsScheduler.ts:229
- backend/src/services/agents/admissions/admissionsVisitorActivityAgent.ts
- backend/src/models/Visitor.ts:172 (tableName 'visitors')

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] 20 sampled visitor summaries match the underlying page events with zero fabricated page titles.

When every box above is ticked, stop and show the demo.
