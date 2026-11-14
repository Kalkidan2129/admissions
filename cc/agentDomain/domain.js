// The domain this Command Center is for: its KEY, which every API path and every match on a
// response row uses, and its display NAME, which is only ever shown in headings.
//
// Why the key is a constant here and not read from plan.json: plan.json's `project.name` is a
// display name, and the platform renamed it from "admissions" to "Admissions & Applicant
// Experience" in the 13 November sync (commit 99a19f5). Building paths from it sent
// /api/admin/agent-domains-mine/Admissions%20%26%20Applicant%20Experience, which the portal
// refuses with HTTP 400. None of the files this page loads (plan, progress, manifest) carries a
// domain key. The one synced file that does, `.colaberry/agent-domain.json` ("domain_key":
// "admissions"), is not loaded by this page, so the key is fixed here and a test checks it still
// equals that file's domain_key.
export const DOMAIN_KEY = 'admissions';

export function domainOf(plan) {
  const name = plan?.project?.name;
  return { key: DOMAIN_KEY, displayName: typeof name === 'string' && name.trim() ? name : DOMAIN_KEY };
}
