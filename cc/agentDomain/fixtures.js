// SAMPLE endpoint responses. Made up, in the response shapes of platform commit 92d103b, so
// Sample mode can show a filled-in Agent domain tab and the tests can exercise every panel.
// Never shown in Real mode, and every name here says "Sample".
import { OK } from './session.js';
import { ENDPOINT_PATHS } from './api.js';

export function sampleEndpoints(domainKey, loadedAt = new Date()) {
  const p = ENDPOINT_PATHS(domainKey);
  const ok = (key, data) => ({ status: OK, path: p[key], httpStatus: 200, data, loadedAt });
  return {
    mine: ok('mine', {
      domains: [{
        domain_key: domainKey, agent_id: 'sample-agent-0001', agent_display_name: 'Sample employee',
        agent_enabled: false, agent_autonomy_level: 'observe', agent_autonomy_level_set_at: '2030-01-05T15:00:00Z',
        agent_autonomy_level_source: 'auto', agent_tools_granted: [], agent_tools_granted_count: 0,
      }],
      not_recorded: [{ field: 'agent.autonomy_level_set_by', reason: 'Sample: the platform does not store who set it.' }],
    }),
    domain: ok('domain', { accountable_human: 'Sample Manager', researched_at: '2030-01-02' }),
    coverage: ok('coverage', {
      summary: { headline: 'Sample: 0 of 3 capabilities confirmed.' },
      rows: [
        { capability_id: 'sample.intake', capability_name: 'Sample intake', current_state: 'partial', validation_state: 'draft', target_autonomy: 'autonomy:R4', effective_authority: null },
        { capability_id: 'sample.report', capability_name: 'Sample weekly report', current_state: 'missing', validation_state: 'draft', target_autonomy: 'autonomy:R7', effective_authority: 'autonomy:R7' },
        { capability_id: 'sample.decision', capability_name: 'Sample decision', current_state: 'implemented', validation_state: 'confirmed', target_autonomy: 'autonomy:R2', effective_authority: null },
      ],
    }),
    governance: ok('governance', {
      change_requests: [
        { kind: 'change', title: 'Sample: rename the agent', status: 'pending', requested_by_identity: 'sample builder', requested_at: '2030-01-06T15:00:00Z', approved_by_identity: null, approved_at: null, declined_reason: null },
        { kind: 'tool', title: 'Sample: request read_lead_records', status: 'approved', requested_by_identity: 'sample builder', requested_at: '2030-01-06T16:00:00Z', approved_by_identity: 'Sample Manager', approved_at: '2030-01-07T15:00:00Z', declined_reason: null },
      ],
    }),
  };
}
