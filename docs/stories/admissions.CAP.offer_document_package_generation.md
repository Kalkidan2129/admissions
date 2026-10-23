# admissions.CAP.offer_document_package_generation — Offer document package generation

An approved applicant receives a correct, versioned offer package promptly, and the organisation can show exactly which template version each person signed.

**Built today:** implemented. **Requirement validated:** draft -- Taiwo Oludimimu must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- delivering the package to the applicant by mail requires the default-denied live_email capability (executionPolicy.ts:27)
- domain ownership is contested between the admissions and internship domains

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Offer document package generation
**Domain:** Admissions & Applicant Experience · **Capability:** `admissions.offer_document_package_generation`
**Accountable human:** Taiwo Oludimimu · **Validation state:** draft
**Built today:** implemented · **Source:** existing_application
## The business outcome
An approved applicant receives a correct, versioned offer package promptly, and the organisation can show exactly which template version each person signed.
Intended users: application_reviewer, prospective_applicant.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Generate the package only for an application already in an approved state
- Stamp template_id and template_version on each document
- Expose it for download to the applicant and to the reviewer
- Record the signed upload separately, with checksum
**Inputs**
- the approved application
- the document template and its version
- the applicant's legal name from the administrative intake
**Outputs**
- generated offer documents with template_version recorded
- an outstanding-requirement ledger
**Exceptions that must be handled**
- Application not approved: no package, because generating an offer for an undecided applicant is the error that matters here
- Template version changed after generation: the stored template_version is the record of what the person actually signed and must never be back-filled
- Upload allow-list: signed documents use their own upload instance; widening the shared allow-list is explicitly warned against
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_postgres_read
- sandbox_postgres_write
- read_applicant_documents
- render_pdf_from_template
**Application surfaces**
- /admin/internship?view=apps
- /portal/internship
- frontend/src/pages/portal/internship/InternshipDocuments.tsx
- GET /api/admin/internship/applications/:id/documents (internshipRoutes.ts:707)
- GET /api/admin/internship/documents/:documentId/file (internshipRoutes.ts:754)
- GET /api/portal/internship/documents (participantRoutes.ts:357)
**Source modules**
- backend/src/services/internship/internshipDocumentService.ts
- backend/src/services/internship/internshipDocumentTemplates.ts
- backend/src/services/internship/internshipPdf.ts
- backend/src/models/InternshipDocument.ts
**Dependencies**
- admissions.admission_decision_recording
- backend/src/config/upload.ts SIGNED_DOC_DIR
- internshipPdf.ts
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: An offer document is a quasi-contractual artifact carrying a named person's legal name and a start date. Generating one in production is a commitment the organisation makes, so the agent's ceiling is sandbox generation against fixtures (autonomy:R4). Production generation and delivery stay with the reviewer who made the decision the document expresses.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Documents the template set, the versioning rule and the approval precondition.

Acceptance: The document states that template_version is never back-filled and that generation requires an approved state.
## Before you start
- manager_has_no_admin_login: Taiwo Oludimimu has no admin_users row (agentDomainRegistry.ts:148-151)
- no AI employee exists for this domain (agentDomainRegistry.ts:155)
- delivering the package to the applicant by mail requires the default-denied live_email capability (executionPolicy.ts:27)
- domain ownership is contested between the admissions and internship domains
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Taiwo Oludimimu evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/internship/internshipDocumentService.ts:101 (generatePackage)
- backend/src/services/internship/internshipDocumentService.ts:214 (readGeneratedDocument)
- backend/src/services/internship/internshipDocumentService.ts:260 (recordSignedUpload)
- backend/src/services/internship/internshipDocumentService.ts:349 (outstandingRequirements)
- backend/src/services/internship/internshipDocumentTemplates.ts
- backend/src/services/internship/internshipPdf.ts
- backend/src/models/InternshipDocument.ts:70 (storage_key)
- backend/src/models/InternshipDocument.ts:71 (original_filename)
- backend/src/models/InternshipDocument.ts:86 (tableName 'internship_documents')
- backend/src/routes/admin/internshipRoutes.ts:707 (GET /api/admin/internship/applications/:id/documents)
- backend/src/routes/participantRoutes.ts:371-376 (POST /api/portal/internship/documents/:documentType/signed)
- docs/AI_INTERNSHIP_DISCOVERY.md:59 (signed offer letters get their own upload instance; the shared allowlist must not be widened)

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The document states that template_version is never back-filled and that generation requires an approved state.

When every box above is ticked, stop and show the demo.
