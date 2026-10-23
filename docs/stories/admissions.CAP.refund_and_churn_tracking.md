# admissions.CAP.refund_and_churn_tracking — Refund and churn tracking

Refunds and churn are visible as a trend with a reason attached, so a policy or delivery problem is caught as a pattern rather than as a series of individual complaints.

**Built today:** unknown. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- implementation_state is unknown: I did not locate a shipped refund or churn tracking report in this tree
- where a refund reason is recorded is unknown; EnrollmentLead.ts:25 lost_reason covers prospects who never enrolled, not refunded students

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Refund and churn tracking
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.refund_and_churn_tracking`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** unknown · **Source:** manager_defined
## The business outcome
Refunds and churn are visible as a trend with a reason attached, so a policy or delivery problem is caught as a pattern rather than as a series of individual complaints.
Intended users: admissions_operations, executive.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Count refunds and withdrawals per period
- Group by recorded reason
- Report the trend against prior periods
- Surface a reason concentration as a pattern for a human to interpret
**Inputs**
- refunds issued
- withdrawals
- recorded reasons
**Outputs**
- a refund and churn trend with reason breakdown
**Exceptions that must be handled**
- A refund with no recorded reason: report as unrecorded; an inferred reason would be presented to Ali as evidence for a policy change
- A withdrawal that is a cohort transfer rather than a loss: it must not be counted as churn
- Changing the refund policy is explicitly out of scope for this capability and for the agent: brief :69 reserves it for Ali
- The refund policy document itself is an outstanding human deliverable owned by Taiwo, so the rule being measured against may not exist in final form
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_enrollment_records
- render_html_report
**Application surfaces**
- /admin/revenue
- /admin/refunds
**Source modules**
- backend/src/models/Enrollment.ts
- backend/src/models/EnrollmentLead.ts
**Dependencies**
- the refund data source
- enrollments table
- the refund policy document
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Counting and trending refunds is read-only aggregate work, so autonomy:R7 is reachable for producing the report. The capability is bounded on the other side by the brief itself: proposing or changing refund policy is Ali's decision, so the agent reports the pattern and never recommends the remedy.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'how many refunds this period and for what recorded reasons'.

Acceptance: Unrecorded reasons are reported as unrecorded and never inferred.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- implementation_state is unknown: I did not locate a shipped refund or churn tracking report in this tree
- where a refund reason is recorded is unknown; EnrollmentLead.ts:25 lost_reason covers prospects who never enrolled, not refunded students
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:23 (refund plus churn tracking)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:69 (changing the refund policy is a strategic decision for Ali via Approval Queues)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:85 (pricing canon, especially the A11 refund policy)
- backend/src/models/Enrollment.ts:205 (status enum includes withdrawn)
- backend/src/models/EnrollmentLead.ts:25 (lost_reason: price, time, prereqs, timing)
- directives/cora-knowledge-base-gaps.md:38 (Taiwo owns uploading the finalized refund and cancellation agreement)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Unrecorded reasons are reported as unrecorded and never inferred.

When every box above is ticked, stop and show the demo.
