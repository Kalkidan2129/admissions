# admissions.CAP.maya_campus_tour_offer — Campus guided-tour offer in the portal conversation

**CANDIDATE -- not started, not assigned.** This is one line on this domain's list of everything its agent could eventually do. It becomes real work only when the builder picks it and their manager agrees, at which point it opens as four stories. Until then it is deliberately inert, and the honest status of it is "not started" rather than "behind".

A signed-in learner who asks what is on campus or where something is gets the link that starts the campus guided tour, so they are walked through the places their enrollment opens instead of being told about them.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm which learners may be offered a tour and what the tour is allowed to claim about what their enrollment opens

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)

Full build prompt is attached to this story.

**Release:** autonomy:R0 · Legacy migration plan (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Campus guided-tour offer in the portal conversation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.maya_campus_tour_offer`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
A signed-in learner who asks what is on campus or where something is gets the link that starts the campus guided tour, so they are walked through the places their enrollment opens instead of being told about them.
Intended users: enrolled_learner, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Recognise a request for a tour, a walkthrough or where things are (mayaPortalPrompt.ts:60)
- Return the fixed tour link; the capability itself starts nothing
- Include the link verbatim in the reply and say in a sentence what the tour shows
**Inputs**
- the learner's request for a tour or for where something is
- the sender's enrollment, bound by the caller and never taken from the model
**Outputs**
- a markdown link that starts the guided tour
- a note that staff accounts have no tour
**Exceptions that must be handled**
- A staff account asks: there is no tour for them, and the reply must say so rather than returning a link that does nothing
- Maya writes her own tour link instead of calling the tool: refused by the link guard, because an invented link is a broken promise to the learner
- She offers a call in place of a tour: forbidden by the prompt, because it answers a different question than the one asked
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- start_campus_tour
**Application surfaces**
- /portal/campus
- /portal/campus?tour=start
**Source modules**
- backend/src/services/maya/mayaPortalTools.ts
- backend/src/services/maya/mayaLinkGuard.ts
- backend/src/services/maya/mayaReplyService.ts
**Dependencies**
- the campus map and its existing guided tour
- the chat dock that turns the deep link into the tour
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R7**.
Why that ceiling: This is the lowest-risk capability of the four and carries the highest ceiling for that reason: it returns a fixed, reviewed link, writes nothing, contacts nobody and makes no claim of its own. The residual risk is a wrong or invented link, which the link guard already refuses, so autonomy:R7 is appropriate for the narrow action class 'offer the campus tour link'.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Offers the tour link when a tour is asked for.

Acceptance: Every tour offer in a fixture set contains the exact TOUR_PATH string and no hand-written link passes the guard.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/maya/mayaPortalTools.ts:101 (the start_campus_tour tool definition)
- backend/src/services/maya/mayaPortalTools.ts:172 (the handler: returns a link and changes nothing)
- backend/src/services/maya/mayaPortalTools.ts:32 (TOUR_PATH /portal/campus?tour=start)
- backend/src/services/maya/mayaToolGovernance.ts:162 (start_campus_tour -> runCampusTour, effectClass in_product)
- backend/src/services/maya/mayaPortalPrompt.ts:60 (include the link exactly as the tool returns it)
- backend/src/services/maya/mayaLinkGuard.ts:6 (the guard written because she invented a tour link instead of calling the tool)
- backend/src/services/maya/mayaReplyService.ts:120 (tourOffered)
- frontend/src/components/campus/tourLink.ts

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.


When every box above is ticked, stop and show the demo.
