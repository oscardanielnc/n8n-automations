import { describe, expect, it } from 'vitest';
import { failureReport } from './failure-report';
import { FLOWS } from './flow-catalog';

const flow = FLOWS.find((f) => f.key === 'jobs')!;
const run = { id: '66', workflowId: flow.workflowId, outcome: 'failed' as const, mode: 'trigger', startedAt: '2026-11-09T13:00:00.000Z' };

describe('failureReport', () => {
  it('carries what a fix needs: builder, node, message, first 20 stack lines and the time in Lima', () => {
    const stack = Array.from({ length: 30 }, (_, i) => `at line ${i}`).join('\n');
    const text = failureReport({
      flow, run, lastSuccess: null, executionUrl: 'https://n8n.example/x', n8nVersion: '2.46.6',
      error: { node: 'Send', nodeType: 'n8n-nodes-base.telegram', errorType: 'NodeApiError', message: 'Gateway timed out',
        description: '', stack, nodeInput: '' },
    });
    expect(text).toContain('Builder: workflows/build_f4.py');
    expect(text).toContain('Failed node: Send [n8n-nodes-base.telegram]');
    expect(text).toContain('9 Nov 2026, 08:00 Lima');
    expect(text).toContain('at line 19');
    expect(text).not.toContain('at line 20');
    expect(text).toContain('Last successful run: none in the kept history (14 days)');
    expect(text).not.toContain('Description:');
  });
});
