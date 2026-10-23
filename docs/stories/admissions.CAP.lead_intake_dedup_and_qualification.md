# admissions.CAP.lead_intake_dedup_and_qualification — Lead intake de-duplication and qualification

Every enquiry becomes exactly one lead record with its first-touch attribution intact, so the same person is never worked twice and the channel that actually found them keeps the credit.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- no lead_ingestion route enforces requireSection: grep of backend/src/routes for 'lead_ingestion' returns zero hits, so the section is defended only by the prefix table in mgmtSectionGate.ts:67-68 and any new unmapped lead path is deny-by-default for the admissions role
- contacting a qualified lead requires the default-denied live_email capability (executionPolicy.ts:27) and stays human-sent

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Lead intake de-duplication and qualification
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.lead_intake_dedup_and_qualification`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
Every enquiry becomes exactly one lead record with its first-touch attribution intact, so the same person is never worked twice and the channel that actually found them keeps the credit.
Intended users: admissions_operations, sales.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Validate the payload against its schema
- Tier 1: match on (strapi_lead_id, source) for true retry idempotency
- Tier 2: match on email across sources, first touch wins
- Tier 3: create, then record the raw payload for audit
**Inputs**
- an inbound lead payload
- existing leads rows
- the lead source and its HMAC secret
**Outputs**
- one leads row
- a raw_lead_payloads audit row
- a was_duplicate result
**Exceptions that must be handled**
- Duplicate on tier 1: return 200 rather than 201, with was_duplicate set
- Existing row on tier 2: do not merge the incoming attribution, which externalLeadIngestService.ts:48-56 records as a deliberate do-not-change decision
- Lead.ts:396-400 defaultScope hides source campaign_test, so any count built on an unscoped query will overstate the funnel
- raw_lead_payloads stores whole untrusted request bodies, headers and remote IPs, so any summary built from it can re-expose data the leads row deliberately does not hold
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_lead_records
**Application surfaces**
- /admin/sources
- /admin/ingest-logs
- /admin/routing-rules
- /admin/apollo
- /admin/import
- POST /api/v1/leads (v1LeadController.ts:19)
- GET /api/admin/ingest-logs (gated at mgmtSectionGate.ts:67)
**Source modules**
- backend/src/services/externalLeadIngestService.ts
- backend/src/controllers/v1LeadController.ts
- backend/src/models/Lead.ts
- backend/src/models/RawLeadPayload.ts
**Dependencies**
- leads table
- lead_sources table
- raw_lead_payloads table
- the lead_ingestion section grant
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R6**.
Why that ceiling: Ingest is already deterministic and idempotent by design, which is what makes a high ceiling arguable. It stops at a supervised production pilot (autonomy:R6) because a wrong tier-2 match writes one person's enquiry onto another person's record, and because raw_lead_payloads holds whole untrusted bodies that no field-level restriction currently fences off.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'is this person already a lead, and from which source' from the existing rows.

Acceptance: Every answer honours the default scope so no campaign_test lead is reported as a real one.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- no lead_ingestion route enforces requireSection: grep of backend/src/routes for 'lead_ingestion' returns zero hits, so the section is defended only by the prefix table in mgmtSectionGate.ts:67-68 and any new unmapped lead path is deny-by-default for the admissions role
- contacting a qualified lead requires the default-denied live_email capability (executionPolicy.ts:27) and stays human-sent
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/controllers/v1LeadController.ts:19 (createExternalLead)
- backend/src/services/externalLeadIngestService.ts:66 (ingestExternalLead)
- backend/src/services/externalLeadIngestService.ts:41-65 (the three-tier dedup order, first-touch-wins)
- backend/src/services/externalLeadIngestService.ts:68-76 (tier 1: strapi_lead_id plus source)
- backend/src/services/externalLeadIngestService.ts:78-86 (tier 2: email, no source filter, first touch wins)
- backend/src/services/externalLeadIngestService.ts:48-56 (incoming attribution is deliberately not merged; documented as do-not-change)
- backend/src/models/Lead.ts:404-409 (case-insensitive unique index leads_email_unique on LOWER(email))
- backend/src/models/Lead.ts:394 (tableName 'leads')
- backend/src/models/RawLeadPayload.ts:23-25 (headers, body, remote_ip)
- backend/src/models/RawLeadPayload.ts:79 (tableName 'raw_lead_payloads')
- backend/src/services/access/mgmtRoles.ts:60 (the admissions role holds lead_ingestion)
- backend/src/middlewares/mgmtSectionGate.ts:67-68 (the lead_ingestion path rows)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every answer honours the default scope so no campaign_test lead is reported as a real one.

When every box above is ticked, stop and show the demo.
