# admissions.CAP.visitor_insight_aggregation — Admissions funnel insight aggregation

Taiwo can see what prospective applicants are actually asking about and where they stall, so admissions messaging is changed on evidence rather than on impression.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the stats surface is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146)
- the small-group suppression threshold is not defined anywhere in the repo, so the re-identification guard Taiwo would be confirming is unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions funnel insight aggregation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.visitor_insight_aggregation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
Taiwo can see what prospective applicants are actually asking about and where they stall, so admissions messaging is changed on evidence rather than on impression.
Intended users: admissions_operations, executive.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Aggregate across visitors
- Rank interests and intent bands
- Report counts and distributions only
- Suppress any group small enough to re-identify a person
**Inputs**
- admissions_memory interests and visitor_type
- conversation counts
- maya_conversation_outcomes rows
**Outputs**
- an aggregate insight set with no individual named
**Exceptions that must be handled**
- A group of one or two: suppress rather than report, because a count of one in a narrow segment names the person
- Window with no data: report zero explicitly rather than omitting the row
- Lead.ts:396-400 defaultScope: test-source leads must stay excluded or the funnel is overstated
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_visitor_analytics
- render_html_report
**Application surfaces**
- admin admissions stats surface (no sidebar nav entry found)
- GET /api/admin/admissions/stats (admissionsRoutes.ts:17)
**Source modules**
- backend/src/services/agents/admissions/admissionsInsightsAgent.ts
- backend/src/services/chatService.ts
- backend/src/models/MayaConversationOutcome.ts
**Dependencies**
- admissions.conversation_memory_summarization
- admissions.visitor_intent_scoring
- maya_conversation_outcomes table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Read-only aggregation with small-group suppression carries no individual exposure and changes nothing, so autonomy:R7 is reachable. It must never be allowed to drill from an aggregate down to a named person, because that would convert an aggregate_only capability into an applicant_identifiable one without a new approval.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers aggregate questions about the admissions funnel.

Acceptance: Every figure reconciles with a query a human can re-run; no figure is estimated.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the stats surface is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146)
- the small-group suppression threshold is not defined anywhere in the repo, so the re-identification guard Taiwo would be confirming is unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsInsightsAgent
- backend/src/services/agentRegistrySeed.ts:905
- backend/src/services/aiOpsScheduler.ts:235
- backend/src/services/agents/admissions/admissionsInsightsAgent.ts
- backend/src/services/chatService.ts:742 (getChatStats)
- backend/src/routes/admin/admissionsRoutes.ts:17 (GET /api/admin/admissions/stats)
- backend/src/models/MayaConversationOutcome.ts:125 (tableName 'maya_conversation_outcomes')

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every figure reconciles with a query a human can re-run; no figure is estimated.

When every box above is ticked, stop and show the demo.
