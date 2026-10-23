# admissions.CAP.enterprise_high_intent_flagging — Enterprise and high-intent prospect flagging

A corporate buyer looking at the programme is recognised as such while they are still looking, so the enterprise conversation happens instead of the enquiry being handled as an individual sign-up.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- any follow-up to a flagged enterprise prospect by email needs the default-denied live_email capability (executionPolicy.ts:27) and stays human-sent

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Enterprise and high-intent prospect flagging
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.enterprise_high_intent_flagging`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
A corporate buyer looking at the programme is recognised as such while they are still looking, so the enterprise conversation happens instead of the enquiry being handled as an individual sign-up.
Intended users: admissions_operations, sales.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read leads with recent activity
- Classify the email domain as corporate or consumer
- Combine with enterprise-page visits
- Flag and surface for a human; take no outbound action
**Inputs**
- lead email domain
- pages visited
- lead_score and lead_temperature (Lead.ts:14, :36)
**Outputs**
- an enterprise flag on the lead
- a prioritised enterprise list for a human
**Exceptions that must be handled**
- Free-mail domain used by a real corporate buyer: the classifier will miss it, so the flag is a prompt for a human, never a filter that hides the lead
- Lead already flagged: no-op
- Lead.ts:396-400 defaultScope hides source='campaign_test', so a test lead must not appear in the enterprise list
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_lead_records
**Application surfaces**
- /admin/leads
**Source modules**
- backend/src/services/agents/admissions/admissionsHighIntentLeadAgent.ts
- backend/src/models/Lead.ts
**Dependencies**
- leads table
- page-event ingestion
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Flagging is additive and reversible and triggers no contact. Capped at autonomy:R7 for the 'flag a lead as enterprise' action class only; the enterprise conversation itself is human work.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Explains why a given lead looks like an enterprise prospect.

Acceptance: Every explanation cites the domain and at least one page visit; none cites a signal absent from the record.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- any follow-up to a flagged enterprise prospect by email needs the default-denied live_email capability (executionPolicy.ts:27) and stays human-sent
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsHighIntentLeadAgent
- backend/src/services/agentRegistrySeed.ts:885
- backend/src/services/aiOpsScheduler.ts:234
- backend/src/services/agents/admissions/admissionsHighIntentLeadAgent.ts
- backend/src/models/Lead.ts:7-11 (email, company, role, phone, title)
- backend/src/models/Lead.ts:394 (tableName 'leads')

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every explanation cites the domain and at least one page visit; none cites a signal absent from the record.

When every box above is ticked, stop and show the demo.
