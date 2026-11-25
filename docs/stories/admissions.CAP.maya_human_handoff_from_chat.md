# admissions.CAP.maya_human_handoff_from_chat — Handoff of a conversation to a person on the admissions team

**CANDIDATE -- not started, not assigned.** This is one line on this domain's list of everything its agent could eventually do. It becomes real work only when the builder picks it and their manager agrees, at which point it opens as four stories. Until then it is deliberately inert, and the honest status of it is "not started" rather than "behind".

A learner who asks for a person, or asks something only a person may answer, is handed to the admissions team as a real row they will see, and is told someone will follow up only when that row actually exists.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm what the admissions team commits to when a handoff row appears, including how quickly and by which surface

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- GROWTH_JOURNEY_HANDOFFS off yields handed_off false with nothing queried, so the capability is inert wherever that flag is unset

Full build prompt is attached to this story.

**Release:** autonomy:R0 · Legacy migration plan (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Handoff of a conversation to a person on the admissions team
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.maya_human_handoff_from_chat`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
A learner who asks for a person, or asks something only a person may answer, is handed to the admissions team as a real row they will see, and is told someone will follow up only when that row actually exists.
Intended users: enrolled_learner, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Recognise a request for a person, or a question only a person may answer (mayaPortalPrompt.ts:61)
- Create the handoff bound to the sender, with a fixed reason code and no free text from the conversation
- Return handed_off true only when a row exists; otherwise offer the booking calendar
- Say someone will follow up only on handed_off true, and never promise a time
**Inputs**
- the sender's enrollment, bound by the caller
- a fixed reason code
- whether a handoff for this subject is already open
**Outputs**
- a growth-journey handoff row, or an honest refusal
- handed_off true or false, which is the only thing the reply may be built on
**Exceptions that must be handled**
- The handoff writer is disabled or unavailable: handed_off false and nothing was written, so the reply must not say anyone will reach out
- A handoff is already open for this subject: the same handoff twice yields one row, because a learner asking twice must not become two tickets
- A previous handoff is closed: a later day opens a new one rather than reopening a settled conversation
- Maya promises a follow-up on a false result: the failure this capability exists to prevent, because a promise nobody received is worse than a refusal
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- create_journey_handoff
**Application surfaces**
- /portal/campus
- the admissions handoff queue
**Source modules**
- backend/src/services/maya/mayaJourneyHandoff.ts
- backend/src/services/maya/mayaPortalTools.ts
- backend/src/services/campus/campusTourHandoff.ts
**Dependencies**
- the growth-journey handoff writer
- admissions' acceptance of the handoff (dispositionService.acceptHandoff)
- the Explorer governor, which stops proposing contact while a handoff is human-owned
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: Handing a person to a human is the safe direction of travel and must never wait on an approval, so the ceiling is autonomy:R7 for the narrow action class 'create a handoff bound to the sender with a fixed reason code'. The risk here is not the write, which is idempotent and carries no free text; it is the sentence Maya says afterwards, which the prompt binds to the returned handed_off value.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Creates the handoff and reports only what the writer returned.

Acceptance: Across all five writer outcomes, a follow-up is promised on created and already_open only, and never on closed, disabled or unavailable.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- GROWTH_JOURNEY_HANDOFFS off yields handed_off false with nothing queried, so the capability is inert wherever that flag is unset
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/maya/mayaJourneyHandoff.ts:10 (M33: the single path, with its five outcomes)
- backend/src/services/maya/mayaPortalTools.ts:87 (the create_journey_handoff tool definition)
- backend/src/services/maya/mayaPortalTools.ts:183 (the handler: bound to the sender, the model's free text is not stored)
- backend/src/services/maya/mayaToolGovernance.ts:163 (create_journey_handoff -> createJourneyHandoff, effectClass in_product)
- backend/src/services/maya/mayaPortalPrompt.ts:61 (say someone will follow up ONLY if it returns handed_off true)
- backend/src/services/maya/mayaPortalPrompt.ts:62 (never state a seat count, deadline, cohort or anything about consent: use this instead)
- backend/src/services/campus/campusTourHandoff.ts:14 (the tour opt-in caller this was generalised from)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.


When every box above is ticked, stop and show the demo.
