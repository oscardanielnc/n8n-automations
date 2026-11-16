import { Injectable } from '@nestjs/common';
import type { Overview } from '@panel/contracts';
import { GetFlowStatuses } from '../../../runs/application/use-cases/get-flow-statuses.use-case';
import { ListOpenFailures } from '../../../runs/application/use-cases/list-open-failures.use-case';

/** Home header: composes other modules' use cases (composition happens here, never inside a module). */
@Injectable()
export class GetOverview {
  constructor(
    private readonly flows: GetFlowStatuses,
    private readonly failures: ListOpenFailures,
  ) {}

  async execute(): Promise<Overview> {
    const [flows, failures] = await Promise.all([this.flows.execute(), this.failures.execute()]);
    return {
      flows,
      openFailures: failures.length,
    };
  }
}
