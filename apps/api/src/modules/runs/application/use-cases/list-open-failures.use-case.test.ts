import { describe, expect, it } from 'vitest';
import type { Env } from '../../../../config/env';
import type { RunError, RunSummary } from '../../domain/run';
import { ExecutionsReader } from '../ports/executions-reader.port';
import { ListOpenFailures } from './list-open-failures.use-case';

class FakeExecutions extends ExecutionsReader {
  constructor(private readonly latest: Record<string, RunSummary>) {
    super();
  }
  async latestFinished(workflowId: string) {
    return this.latest[workflowId] ?? null;
  }
  async lastSuccess(workflowId: string): Promise<RunSummary> {
    return { id: '60', workflowId, outcome: 'ok', mode: 'trigger', startedAt: '2026-11-06T01:07:58.000Z' };
  }
  async errorOf(): Promise<RunError> {
    return { node: 'Send summary + .md', nodeType: 'n8n-nodes-base.telegram', errorType: 'NodeApiError',
      message: 'Gateway timed out', description: 'Gateway Timeout', stack: 'NodeApiError: x\n    at y', nodeInput: '[{"a":1}]' };
  }
}

const env = { N8N_PUBLIC_URL: 'https://n8n.example' } as Env;
const run = (workflowId: string, outcome: 'ok' | 'failed'): RunSummary => ({ id: '66', workflowId, outcome, mode: 'trigger', startedAt: '2026-11-09T13:00:00.000Z' });

describe('ListOpenFailures', () => {
  it('opens a failure only when the LATEST run of a flow failed', async () => {
    const uc = new ListOpenFailures(
      new FakeExecutions({ f4JobRadar000001: run('f4JobRadar000001', 'failed'), f2DailyWatch0001: run('f2DailyWatch0001', 'ok') }),
      env,
    );
    const failures = await uc.execute();
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({
      workflowName: 'F4 - Job radar (Mon/Thu)',
      node: 'Send summary + .md',
      executionUrl: 'https://n8n.example/workflow/f4JobRadar000001/executions/66',
    });
    expect(failures[0]?.report).toContain('Builder: workflows/build_f4.py');
    expect(failures[0]?.report).toContain('Last successful run: #60');
  });

  it('closes by itself once the next run succeeds', async () => {
    const uc = new ListOpenFailures(
      new FakeExecutions({ f4JobRadar000001: run('f4JobRadar000001', 'ok') }),
      env,
    );
    expect(await uc.execute()).toEqual([]);
  });

  it('ignores flows that never ran', async () => {
    const uc = new ListOpenFailures(new FakeExecutions({}), env);
    expect(await uc.execute()).toEqual([]);
  });
});
