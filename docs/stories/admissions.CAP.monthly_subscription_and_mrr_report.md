# admissions.CAP.monthly_subscription_and_mrr_report — Monthly subscription and MRR report

Subscription growth is reported monthly with new, cancelled and net-new counts and a retention curve by cohort, so membership revenue is managed on a trend rather than on a snapshot.

**Built today:** unknown. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- emailing the report requires the default-denied live_email capability (executionPolicy.ts:27)
- implementation_state is unknown: I did not locate a shipped subscription or MRR report script in this tree, and the brief's 2026-06-17 date predates this run without a verifiable receipt
- which system is the authoritative source for an active subscription is unknown; enrollments carries PaySimple identifiers but no subscription-state column was located

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Monthly subscription and MRR report
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.monthly_subscription_and_mrr_report`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** unknown · **Source:** manager_defined
## The business outcome
Subscription growth is reported monthly with new, cancelled and net-new counts and a retention curve by cohort, so membership revenue is managed on a trend rather than on a snapshot.
Intended users: admissions_operations, executive.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Count starts and cancellations in the month
- Compute MRR from the plan prices
- Build the retention curve by cohort
- Report the figures with the prior month for comparison
**Inputs**
- subscription starts and cancellations
- plan prices
- cohort membership for the retention curve
**Outputs**
- new, cancelled and net-new counts
- MRR and ARR trends
- a retention curve by cohort
**Exceptions that must be handled**
- An annual plan: it must not be counted as twelve times its monthly equivalent without the conversion being stated
- A failed payment attempt: a PaySimple schedule counter counts attempts rather than successes, so a retry must not be read as a new subscription
- A month with no cancellations: report an explicit zero
- Prices in the brief may have changed since it was written, so a price must be read from a current source rather than from the brief
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- read_enrollment_records
- render_html_report
**Application surfaces**
- /admin/revenue
**Source modules**
- backend/src/models/Enrollment.ts
**Dependencies**
- the subscription and payment data source
- enrollments table
- cohort membership
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: An aggregate internal revenue report changes nothing and names nobody, so autonomy:R7 is reachable for the 'produce the monthly report' action class. The price table stays a human input, because a revenue figure computed from a price the agent inferred is a fabricated revenue figure.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Answers 'how many active subscriptions by plan' from the authoritative source once named.

Acceptance: Every count reconciles with a re-runnable query and the source system is named in the answer.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- emailing the report requires the default-denied live_email capability (executionPolicy.ts:27)
- implementation_state is unknown: I did not locate a shipped subscription or MRR report script in this tree, and the brief's 2026-06-17 date predates this run without a verifiable receipt
- which system is the authoritative source for an active subscription is unknown; enrollments carries PaySimple identifiers but no subscription-state column was located
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:3 (he owns subscription growth)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:30-31 (Architect Network Membership at 79 per month or 790 per year; Architect Pro at 149 per month including mentorship)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:33-36 (new, cancellations, net new; MRR and ARR trends; retention curve by cohort)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:52 (Monthly: subscription and MRR trends, to Ali)
- docs/training-program-2026-q3/launch-briefs/16-taiwo-admissions.md:59 (critical-path date 2026-06-17)
- backend/src/models/Enrollment.ts:80-83 (paysimple invoice, customer, external and payment ids)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every count reconciles with a re-runnable query and the source system is named in the answer.

When every box above is ticked, stop and show the demo.
