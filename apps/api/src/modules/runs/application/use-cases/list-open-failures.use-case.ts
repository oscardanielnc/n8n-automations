import { Inject, Injectable } from '@nestjs/common';
import type { Failure } from '@panel/contracts';
import { ENV, Env } from '../../../../config/env';
import { failureReport } from '../../domain/failure-report';
import { FLOWS } from '../../domain/flow-catalog';
import { ExecutionsReader } from '../ports/executions-reader.port';

export const N8N_VERSION = '2.46.6';

/**
 * A failure is open while the LATEST finished run of its flow failed. There is no "resolve" button:
 * the next successful run closes it, a later failure reopens it.
 */
@Injectable()
export class ListOpenFailures {
  constructor(
    private readonly executions: ExecutionsReader,
    @Inject(ENV) private readonly env: Env,
  ) {}

  async execute(): Promise<Failure[]> {
    const found = await Promise.all(
      FLOWS.map(async (flow): Promise<Failure | null> => {
        const run = await this.executions.latestFinished(flow.workflowId);
        if (!run || run.outcome !== 'failed') return null;
        const [error, lastSuccess] = await Promise.all([
          this.executions.errorOf(run.id),
          this.executions.lastSuccess(flow.workflowId),
        ]);
        const executionUrl = `${this.env.N8N_PUBLIC_URL}/workflow/${flow.workflowId}/executions/${run.id}`;
        return {
          workflowId: flow.workflowId, workflowName: flow.n8nName, executionId: run.id, executionUrl,
          startedAt: run.startedAt, mode: run.mode, node: error?.node ?? 'unknown',
          errorType: error?.errorType ?? 'Error', message: error?.message ?? 'no message',
          report: failureReport({ flow, run, error, lastSuccess, executionUrl, n8nVersion: N8N_VERSION }),
        };
      }),
    );
    return found.filter((f): f is Failure => f !== null).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }
}
