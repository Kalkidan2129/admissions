# admissions.CAP.admissions_funnel_anomaly_detection — Admissions funnel anomaly detection

A break in the admissions funnel, a form that stopped submitting, a channel that stopped delivering, a queue that stopped moving, is caught in hours by its own absence of activity rather than in weeks by a missing number.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
- it depends on admissions.escalation_threshold_governance, whose implementation_state is absent, so there is nowhere to store an expected range today

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions funnel anomaly detection
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.admissions_funnel_anomaly_detection`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
A break in the admissions funnel, a form that stopped submitting, a channel that stopped delivering, a queue that stopped moving, is caught in hours by its own absence of activity rather than in weeks by a missing number.
Intended users: admissions_operations, platform_reliability.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Track each funnel stage count over a rolling window
- Compare against the expected range
- Report a departure, including a departure to zero
- Escalate once per anomaly, not once per run
**Inputs**
- funnel stage counts over time
- expected ranges or a human-set threshold
- component activity signals
**Outputs**
- an anomaly finding naming the stage, the expected range and the observed value
**Exceptions that must be handled**
- A legitimate quiet period (a holiday, a paused campaign): without an exemption the alert becomes noise and stops being read, which is how real outages get missed
- A zero caused by a scope change rather than an outage: Lead.ts:396-400 shows how a scope silently changes a count, so the finding must name the query it used
- A stage with no historical baseline: report as unmonitored rather than anomalous
- An anomaly in the detector itself: a detector that stops running produces no alerts, which looks identical to no anomalies, so it needs its own liveness signal
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_lead_records
- read_enrollment_records
- read_internship_application_queue
- render_html_report
**Application surfaces**
- none today
**Source modules**
_none recorded_
**Dependencies**
- admissions.visitor_insight_aggregation
- admissions.escalation_threshold_governance
- funnel stage counts
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Detection is read-only aggregate work that changes nothing, so autonomy:R7 is reachable for the 'report an anomaly' action class. The expected ranges stay human-set, because a detector that tunes its own thresholds can tune away the alert it does not want to raise.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'what do the funnel stage counts look like against their recent history'.

Acceptance: Every figure names the query that produced it, including the scope applied.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- nobody has requested this capability; it is drafted as a discovery candidate and must not be read as a requirement
- it depends on admissions.escalation_threshold_governance, whose implementation_state is absent, so there is nowhere to store an expected range today
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- composes admissions.visitor_insight_aggregation, admissions.lead_intake_dedup_and_qualification and admissions.application_queue_triage
- backend/src/services/agentRegistryAuditClassification.ts:36-43 (REPORTING_UNWIRED: seventeen agents whose source exists but which nothing can ever invoke, a class of silent zero)
- backend/src/models/Lead.ts:396-400 (defaultScope excluding campaign_test, a scope that silently changes a count)
- docs/architecture/ai-workforce-management/SUPERVISOR_HEALTH_AUDIT_2026-10-06.md:50 (Admissions: 17 registered, 11 enabled)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every figure names the query that produced it, including the scope applied.

When every box above is ticked, stop and show the demo.
