# admissions.CAP.conversation_continuity_stitching — Cross-session conversation continuity

A prospect who drops off and returns lands in one continuous conversation rather than several fragments, so the admissions picture of them is not split across rows.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the merge window and the fingerprint-collision policy are undocumented, so the rule Taiwo would be confirming is unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Cross-session conversation continuity
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.conversation_continuity_stitching`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** inherited
## The business outcome
A prospect who drops off and returns lands in one continuous conversation rather than several fragments, so the admissions picture of them is not split across rows.
Intended users: admissions_chat_assistant, admissions_operations.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Find consecutive short conversations for the same visitor inside the merge window
- Carry context forward onto the later conversation
- Record the stitch so the merge is auditable and reversible
**Inputs**
- consecutive short ChatConversation rows for one visitor_id
**Outputs**
- merged conversation context
- an auditable record of which conversations were stitched
**Exceptions that must be handled**
- Two visitors share a fingerprint: do not merge, because a wrong merge mixes two people's data
- At the merge-window boundary: prefer not merging, since the two failure modes are not symmetric
- Already-stitched pair: no-op
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_admissions_chat_conversations
**Application surfaces**
- /admin/visitors
**Source modules**
- backend/src/services/agents/admissions/admissionsConversationContinuityAgent.ts
- backend/src/models/ChatConversation.ts
**Dependencies**
- chatService.ts:598 updateConversationContext
- visitors fingerprint resolution
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R6**.
Why that ceiling: A wrong merge joins two different people's conversations into one record, which is a data-protection failure that re-running cannot cleanly undo. A supervised production pilot (autonomy:R6) is the ceiling until a verified no-false-merge rate exists.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R2)**
Reports which conversations look stitchable without merging them.

Acceptance: Every proposal names both conversation ids and the elapsed gap.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- the merge window and the fingerprint-collision policy are undocumented, so the rule Taiwo would be confirming is unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/legacy-slices/admissions.json row AdmissionsConversationContinuityAgent
- backend/src/services/agentRegistrySeed.ts:875
- backend/src/services/aiOpsScheduler.ts:233
- backend/src/services/agents/admissions/admissionsConversationContinuityAgent.ts
- backend/src/services/chatService.ts:598 (updateConversationContext)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Every proposal names both conversation ids and the elapsed gap.

When every box above is ticked, stop and show the demo.
