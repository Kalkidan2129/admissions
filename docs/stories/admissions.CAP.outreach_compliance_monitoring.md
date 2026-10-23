# admissions.CAP.outreach_compliance_monitoring — Outreach compliance monitoring

Nobody at Colaberry contacts the same prospect twice in a day or across two campaigns at once, which protects both the sender reputation and the applicant's experience.

**Built today:** partial. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- implementation_state is partial because the governance half of this rule lives in admissionsCallGovernanceAgent.ts, which agentRegistryAuditClassification.ts:56-62 classifies as ADMISSIONS_ON_DEMAND_UNWIRED, confirmed_dead with disable=true; the rule exists in code but has no live caller
- the call-log review surface is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146)

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Outreach compliance monitoring
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.outreach_compliance_monitoring`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** partial · **Source:** inherited
## The business outcome
Nobody at Colaberry contacts the same prospect twice in a day or across two campaigns at once, which protects both the sender reputation and the applicant's experience.
Intended users: admissions_operations, compliance_reviewer.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read the contact history per person across channels
- Apply the 24-hour rule and the campaign-conflict rule
- Report violations and near-violations
- Escalate a pattern rather than a single incident
**Inputs**
- CallContactLog history
- campaign membership
- email_send_ledger entries
**Outputs**
- duplicate-outreach and campaign-conflict findings
- a compliance report for a human
**Exceptions that must be handled**
- A person legitimately contacted twice (they replied asking for a call): the rule must distinguish inbound-triggered from outbound-initiated contact
- Channel history missing for one channel: report the gap, do not report compliance
- A violation already reported: do not re-report, which would turn one incident into a daily alarm
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_call_logs
- read_email_send_ledger
- render_html_report
**Application surfaces**
- admin admissions operations surface (no sidebar nav entry found)
- GET /api/admin/admissions/call-log (admissionsRoutes.ts:24)
- GET /api/admin/admissions/operations (admissionsRoutes.ts:22)
**Source modules**
- backend/src/services/agents/admissions/admissionsCallComplianceAgent.ts
- backend/src/services/agents/admissions/admissionsCallGovernanceAgent.ts
- backend/src/services/internship/internshipCallService.ts
**Dependencies**
- CommunicationLog
- email_send_ledger
- call governance rules
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: This capability only reads and reports; it changes nothing. That makes autonomy:R7 reachable for the 'produce a compliance finding' action class. It must never acquire the power to approve an outbound contact, because a monitor that can grant its own exemptions is not a monitor.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'when were we last in touch with this person' from the contact ledger.

Acceptance: Every answer is reproducible from CommunicationLog and email_send_ledger rows alone.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- implementation_state is partial because the governance half of this rule lives in admissionsCallGovernanceAgent.ts, which agentRegistryAuditClassification.ts:56-62 classifies as ADMISSIONS_ON_DEMAND_UNWIRED, confirmed_dead with disable=true; the rule exists in code but has no live caller
- the call-log review surface is unreachable by a scoped 'admissions' mgmt token because '/api/admin/admissions' is absent from PATH_SECTION (mgmtSectionGate.ts:21-146)
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsCallComplianceMonitor
- backend/src/services/agentRegistrySeed.ts:987
- backend/src/services/aiOpsScheduler.ts:237
- backend/src/services/agents/admissions/admissionsCallComplianceAgent.ts
- backend/src/services/agents/admissions/admissionsCallGovernanceAgent.ts
- backend/src/routes/admin/admissionsRoutes.ts:24 (GET /api/admin/admissions/call-log)
- backend/src/services/internship/internshipCallService.ts:16-22 (the four hard refusals)
- backend/src/db/ensureEmailSendLedgerSchema.ts:42 (email_send_ledger)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every answer is reproducible from CommunicationLog and email_send_ledger rows alone.

When every box above is ticked, stop and show the demo.
