// SAMPLE DATA. Made up, to show the shape of a filled-in Command Center.
// It has the same shape as the .colaberry files and knowledge/notes.json and is never
// mixed with them: app.js uses either this or the real files, and labels every screen
// when it is this. Nothing here describes the admissions project.

const story = (id, title, release, role, due, baseline, acceptance, fulfills) => ({
  id, title, release, due_on: due, due_baseline_on: baseline, fulfills, owner_agent: 'sample_intake_agent',
  narrative: `As a ${role}, I want ${title.replace('Sample story: ', '')}, so that the sample flow works end to end.`,
  acceptance, failure_paths: ['Sample: the upstream service times out.'],
});
const verified = (passed, total, points) => ({
  state: 'verified', criteria_passed: passed, criteria_total: total, points_awarded: points, commit_url: null,
});

export function sampleData(now = new Date()) {
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString();
  const a = (n) => [`Sample criterion ${n}a.`, `Sample criterion ${n}b.`, `Sample criterion ${n}c.`];
  return {
    plan: {
      schema_version: 2,
      project: {
        name: 'Sample project (made up)',
        descriptor: 'An example system, used only to show what a filled-in page looks like.',
        repo_url: null, plan_version: 1,
      },
      schedule: {
        build_start: '2030-01-07', build_end: '2030-02-15', demo_day: '2030-02-20', demo_release_key: 's1',
        prep: [{ key: 'SAMPLE-PREP-1', title: 'Sample rehearsal', due_on: '2030-02-18' }],
      },
      releases: [
        { key: 's0', name: 'Sample release 0', goal: 'Sample goal.', demo: 'Sample demo.', starts_on: '2030-01-07',
          ends_on: '2030-01-24', is_demo_target: false, story_ids: ['SAMPLE-1', 'SAMPLE-2'] },
        { key: 's1', name: 'Sample release 1', goal: 'Sample goal.', demo: 'Sample demo.', starts_on: '2030-01-27',
          ends_on: '2030-02-15', is_demo_target: true, story_ids: ['SAMPLE-3', 'SAMPLE-4'] },
      ],
      stories: [
        story('SAMPLE-1', 'Sample story: intake form', 's0', 'sample applicant', '2030-01-17', '2030-01-17', a(1), ['SAMPLE-REQ-1']),
        story('SAMPLE-2', 'Sample story: weekly report', 's0', 'sample reviewer', '2030-01-24', '2030-01-20', a(2), ['SAMPLE-REQ-2']),
        story('SAMPLE-3', 'Sample story: reviewer queue', 's1', 'sample reviewer', '2030-02-06', '2030-02-06', a(3), ['SAMPLE-REQ-2']),
        story('SAMPLE-4', 'Sample story: decision letters', 's1', 'sample reviewer', '2030-02-15', '2030-02-13', a(4), ['SAMPLE-REQ-3']),
      ],
      requirements: [
        { id: 'SAMPLE-REQ-1', statement: 'Sample: an applicant can submit the intake form.', kind: 'FUNC', priority: 'must', cluster: 'Sample intake', fulfilled_by: ['SAMPLE-1'] },
        { id: 'SAMPLE-REQ-2', statement: 'Sample: reviewers see a queue and a weekly report.', kind: 'FUNC', priority: 'must', cluster: 'Sample review', fulfilled_by: ['SAMPLE-2', 'SAMPLE-3'] },
        { id: 'SAMPLE-REQ-3', statement: 'Sample: never send a decision letter without a named human approver.', kind: 'SAFE', priority: 'must', cluster: 'Sample review', fulfilled_by: ['SAMPLE-4'] },
        { id: 'SAMPLE-REQ-4', statement: 'Sample: reply to every applicant within two working days.', kind: 'NFR', priority: 'must', cluster: 'Sample intake', fulfilled_by: [] },
      ],
      agents: [{
        id: 'sample_intake_agent', name: 'Sample intake agent', purpose: 'Sample: sorts incoming forms.',
        trigger_type: 'event', trigger: 'Sample form submitted', inputs: ['sample form'], outputs: ['sample queue item'],
        autonomy_level: 'R1', approval_gates: ['Sample human approval before any email'], escalation_rules: [],
        skills: [], owns: ['SAMPLE-1', 'SAMPLE-2', 'SAMPLE-3', 'SAMPLE-4'],
      }],
      derived: {
        measures: [{ id: 'SAMPLE-REQ-4', statement: 'Sample: reply to every applicant within two working days.' }],
        guardrails: [{ id: 'SAMPLE-REQ-3', statement: 'Sample: never send a decision letter without a named human approver.' }],
        systems: ['Sample CRM', 'Sample email service'],
        roles: ['sample applicant', 'sample reviewer'],
        counts: { agents_by_autonomy: { R1: 1 } },
      },
    },
    progress: {
      schema_version: 2,
      totals: {
        stories_total: 4, stories_verified: 2, stories_submitted: 0, stories_in_progress: 1,
        stories_not_started: 1, criteria_total: 12, criteria_passed: 7, points_awarded: 30,
      },
      stories: [
        { id: 'SAMPLE-1', criteria: a(1).map((text) => ({ text, passed: true })), verification: verified(3, 3, 15) },
        { id: 'SAMPLE-2', criteria: a(2).map((text) => ({ text, passed: true })), verification: verified(3, 3, 15) },
        { id: 'SAMPLE-3', criteria: a(3).map((text, i) => ({ text, passed: i === 0 })), verification: {
          state: 'in_progress', criteria_passed: 1, criteria_total: 3, points_awarded: null, commit_url: null } },
        { id: 'SAMPLE-4', criteria: a(4).map((text) => ({ text, passed: false })), verification: null },
      ],
    },
    manifest: { generated_at: twoDaysAgo },
    notes: { error: null, entries: [
      { date: '2030-01-10', kind: 'decision', title: 'Sample decision', text: 'Sample: poll the sample CRM hourly.' },
      { date: '2030-01-08', kind: 'question', title: 'Sample open question', text: 'Sample: who approves letters?' },
    ] },
  };
}
