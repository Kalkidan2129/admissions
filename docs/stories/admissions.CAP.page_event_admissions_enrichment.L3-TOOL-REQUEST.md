# admissions.CAP.page_event_admissions_enrichment.L3-TOOL-REQUEST — Visitor page-event admissions enrichment · 3 · request the tool

**Ask for the tool, and let a human decide whether the agent may have it.**

File a tool request for this capability, and let it be decided. This is a real governance gate with a real human on the other side of it, not paperwork.

**How to file it.** Open the Change Requests page in the admin and file one against `admissions`, the domain you own. It posts to `POST /api/admin/agent-domain-change-requests-mine`. Taiwo Oludimimu or an admin decides it at `POST /api/admin/agent-domain-change-requests/:id/decide`. You cannot decide your own.

**The tools this capability was recorded as needing**
- sandbox_postgres_read
- sandbox_postgres_write
- read_visitor_analytics

**What the request has to say**, and all of it comes from work you have already done:
- The exact thing the tool would do, in one sentence.
- Why it is needed, citing your step 1 run log -- what was slow, repetitive or error-prone.
- What you proved in step 2: that the product can already produce this outcome by hand, or exactly which gap stops it.
- The scope: what the tool may touch and what it must never touch.
- Who approves a run, and what happens when the tool is wrong.

Say explicitly which parts of the work the tool takes and which stay with a person.

**A declined request is a completed story.** The decision is the outcome, not the approval. Record what was decided and why, and if it was declined, what would have to change.

The four steps of this capability run in order. A later step opened before its predecessor is complete is the thing this ladder exists to prevent -- say so and go back rather than working ahead.

**Release:** autonomy:R0 · Legacy migration plan (weeks 0–0)
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

- [ ] A change request for a tool exists against this domain, filed by the builder, naming the tool, its scope, what it must never touch, and who approves a run.
- [ ] The request cites the step 1 run log and the step 2 result as its evidence.
- [ ] A named human other than the builder has recorded a decision on it. A decline counts; an undecided request does not.

When every box above is ticked, stop and show the demo.
