import { describe, expect, it } from 'vitest';
import type { N8nClient, RawExecution } from '../../../shared/infrastructure/n8n/n8n-client';
import { N8nExecutionsReader } from './n8n-executions-reader';

const exec = (id: number, status: string): RawExecution => ({
  id, workflowId: 'wf1', status, mode: 'trigger', startedAt: `2026-11-1${id}T13:00:00.000Z`,
});

/** Only the two calls the reader makes; everything else on the client stays unused. */
function fakeClient(list: RawExecution[], one?: RawExecution): N8nClient {
  return {
    executions: async ({ status, limit }: { status?: string; limit: number }) =>
      list.filter((e) => !status || e.status === status).slice(0, limit),
    execution: async () => one,
  } as unknown as N8nClient;
}

describe('N8nExecutionsReader', () => {
  it('skips a run still in progress and treats crashed or canceled runs as failed', async () => {
    const reader = new N8nExecutionsReader(fakeClient([exec(5, 'running'), exec(4, 'crashed'), exec(3, 'success')]));
    expect(await reader.latestFinished('wf1')).toMatchObject({ id: '4', outcome: 'failed' });
  });

  it('returns null for a workflow that never finished a run', async () => {
    const reader = new N8nExecutionsReader(fakeClient([exec(5, 'running')]));
    expect(await reader.latestFinished('wf1')).toBeNull();
  });

  it('reports the failed node with the input it received, secrets redacted and long strings cut', async () => {
    const failed: RawExecution = {
      ...exec(4, 'error'),
      data: {
        resultData: {
          error: { name: 'NodeApiError', message: 'Gateway timed out', node: { name: 'Send', type: 'n8n-nodes-base.telegram' } },
          runData: {
            Send: [{ source: [{ previousNode: 'Build' }] }],
            Build: [{ data: { main: [[{ json: { apiKey: 'sk-live-123', nested: { Authorization: 'Bearer x' }, body: 'a'.repeat(400) } }]] } }],
          },
        },
      },
    };
    const error = await new N8nExecutionsReader(fakeClient([], failed)).errorOf('4');

    expect(error).toMatchObject({ node: 'Send', nodeType: 'n8n-nodes-base.telegram', errorType: 'NodeApiError' });
    expect(error?.nodeInput).not.toContain('sk-live-123');
    expect(error?.nodeInput).not.toContain('Bearer x');
    expect(error?.nodeInput).toContain('[redacted]');
    expect(error?.nodeInput).toContain(`${'a'.repeat(300)}…`);
  });
});
