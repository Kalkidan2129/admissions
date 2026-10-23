# admissions.CAP.appointment_booking_assistance — Admissions appointment booking assistance

A prospect who wants to talk to a person gets a slot while they are still interested, instead of a promise of a callback.

**Built today:** partial. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- sending a booking confirmation or a reminder requires the default-denied live_email capability (executionPolicy.ts:27)
- implementation_state is partial: the booking routes are live but the agent that was to automate scheduling is ADMISSIONS_ON_DEMAND_UNWIRED and confirmed_dead with disable set (agentRegistryAuditClassification.ts:56-62, :117-123)
- the execution contract for this programme forbids any meeting booking (execution-contract.md:117-119), so no story in this run may book one

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Admissions appointment booking assistance
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.appointment_booking_assistance`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
A prospect who wants to talk to a person gets a slot while they are still interested, instead of a promise of a callback.
Intended users: prospective_applicant, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read availability
- Offer slots to the prospect
- The prospect chooses and books
- Record the booking outcome against the conversation
**Inputs**
- available slots
- the prospect's chosen time
- their contact details
**Outputs**
- a booked appointment
- booking_offered, booking_clicked and booking_completed on the conversation outcome
**Exceptions that must be handled**
- Slot taken between offer and booking: re-offer rather than double-booking a human's calendar
- No availability: say so rather than offering a slot that does not exist
- Booking confirmation to the prospect requires outbound mail, which is default-denied
- The legacy agent that automated this is classified confirmed_dead with disable set, so the automated path does not currently exist
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- read_calendar_availability
- sandbox_postgres_read
- read_lead_records
**Application surfaces**
- public booking page served by the calendar routes
- GET /api/calendar/availability (calendarRoutes.ts:6)
- POST /api/calendar/book (calendarRoutes.ts:7)
- GET /api/calendar/prefill/:lid (calendarRoutes.ts:10)
**Source modules**
- backend/src/routes/calendarRoutes.ts
- backend/src/services/agents/admissions/admissionsAppointmentAgent.ts
- backend/src/models/MayaConversationOutcome.ts
**Dependencies**
- the calendar provider
- admissions.conversation_action_request_detection
- maya_conversation_outcomes table
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Booking writes into a named colleague's calendar and schedules a real person's time, which is an external side effect on two people at once. Offering slots and simulating the booking in sandbox (autonomy:R4) is the ceiling, and the booking itself stays with the prospect's own click on the live public route.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Documents the booking flow, who owns the calendar and what the agent may never do.

Acceptance: The document names the human whose calendar is written to and records booking as their commitment.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- sending a booking confirmation or a reminder requires the default-denied live_email capability (executionPolicy.ts:27)
- implementation_state is partial: the booking routes are live but the agent that was to automate scheduling is ADMISSIONS_ON_DEMAND_UNWIRED and confirmed_dead with disable set (agentRegistryAuditClassification.ts:56-62, :117-123)
- the execution contract for this programme forbids any meeting booking (execution-contract.md:117-119), so no story in this run may book one
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/routes/calendarRoutes.ts:6 (GET /api/calendar/availability)
- backend/src/routes/calendarRoutes.ts:7 (POST /api/calendar/book)
- backend/src/routes/calendarRoutes.ts:10 (GET /api/calendar/prefill/:lid)
- backend/src/services/agents/admissions/admissionsAppointmentAgent.ts
- backend/src/services/agentRegistrySeed.ts:957 (AdmissionsAppointmentSchedulingAgent, source_file admissionsAppointmentAgent.ts)
- backend/src/services/agentRegistryAuditClassification.ts:56-62 (ADMISSIONS_ON_DEMAND_UNWIRED)
- backend/src/models/MayaConversationOutcome.ts:42-45 (booking_offered, booking_clicked, booking_completed, booking_id)
- backend/src/routes/participantRoutes.ts:350 (POST /api/portal/internship/interview/call/schedule)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document names the human whose calendar is written to and records booking as their commitment.

When every box above is ticked, stop and show the demo.
