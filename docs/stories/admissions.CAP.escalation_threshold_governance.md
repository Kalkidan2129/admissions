# admissions.CAP.escalation_threshold_governance — Escalation threshold governance

Admissions alerts fire on thresholds a named human set and can change, so an escalation means something and the reporting layer does not quietly set its own definition of a problem.

**Built today:** absent. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the human who must own every threshold has no surface on which to set one
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- implementation_state is absent: no threshold store, no threshold surface and no escalation routing table was located anywhere in this tree, so every threshold the brief refers to is currently either unimplemented or embedded as a constant somewhere I did not find
- which approval surface Taiwo would use is unknown; the brief names Approval Queues but that surface's reachability for a manager with no login was not established

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Escalation threshold governance
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.escalation_threshold_governance`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** absent · **Source:** manager_defined
## The business outcome
Admissions alerts fire on thresholds a named human set and can change, so an escalation means something and the reporting layer does not quietly set its own definition of a problem.
Intended users: admissions_operations, executive.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- A human records a threshold against a metric
- The reporting capabilities read it rather than embedding a constant
- A trip escalates to the named recipient
- A threshold change is recorded with who changed it and when
**Inputs**
- the metric
- the threshold value and direction
- who is escalated to
**Outputs**
- a stored, auditable threshold
- an escalation routed to a named human
**Exceptions that must be handled**
- No threshold recorded for a metric: the report must say the metric is unmonitored rather than applying a default, because an invented default is the agent setting policy
- A threshold that would silence an existing alert: that is a restriction of monitoring and needs the same approval as creating one
- An agent proposing a threshold: permitted as a proposal only; MANAGER_AUTHORIZATION_MAP.md:3 holds that manager instructions may only restrict, never expand, and the same asymmetry applies to the agent's own suggestions
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
**Application surfaces**
- none today
**Source modules**
_none recorded_
**Dependencies**
- a threshold store that does not exist today
- the reporting capabilities that would read it
- an approval surface for Taiwo
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: A threshold is the definition of what counts as a problem, so an agent that can set its own threshold can decide what it never has to report. The agent may read thresholds and propose one with evidence; setting or changing one is always a human write. The ceiling is autonomy:R2 and this is a structural limit rather than a staged one.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Documents every metric that needs a threshold, who owns it, and who is escalated to.

Acceptance: Every reporting capability in this matrix that mentions a threshold is listed with its owner named and its current value recorded as unset where that is true.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151), so the human who must own every threshold has no surface on which to set one
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- implementation_state is absent: no threshold store, no threshold surface and no escalation routing table was located anywhere in this tree, so every threshold the brief refers to is currently either unimplemented or embedded as a constant somewhere I did not find
- which approval surface Taiwo would use is unknown; the brief names Approval Queues but that surface's reachability for a manager with no login was not established
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:68 (operational reports and thresholds he can set autonomously; loop Ali in on the what-gets-escalated call)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:69 (strategic decisions go to Ali via Approval Queues)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:25 (give the column list plus thresholds for alerting Ali)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:50 (post to Approval Queues if any threshold tripped)
- docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md:3 (manager instructions may only restrict an agent, never expand its authority)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every reporting capability in this matrix that mentions a threshold is listed with its owner named and its current value recorded as unset where that is true.

When every box above is ticked, stop and show the demo.
