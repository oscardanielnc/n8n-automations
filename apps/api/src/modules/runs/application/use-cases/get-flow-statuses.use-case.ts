import { Injectable } from '@nestjs/common';
import type { FlowStatus } from '@panel/contracts';
import { Clock } from '../../../../shared/application/clock.port';
import { FLOWS, nextRun } from '../../domain/flow-catalog';
import { ExecutionsReader } from '../ports/executions-reader.port';

@Injectable()
export class GetFlowStatuses {
  constructor(
    private readonly executions: ExecutionsReader,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<FlowStatus[]> {
    const now = this.clock.now();
    return Promise.all(
      FLOWS.map(async (flow): Promise<FlowStatus> => {
        const base = { key: flow.key, name: flow.name, schedule: flow.schedule, page: flow.page, nextRunAt: nextRun(flow, now) };
        const last = await this.executions.latestFinished(flow.workflowId);
        if (!last) return { ...base, status: 'never', lastRunAt: null };
        return { ...base, status: last.outcome, lastRunAt: last.startedAt };
      }),
    );
  }
}
