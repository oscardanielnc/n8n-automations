import { Controller, Get } from '@nestjs/common';
import { Failure, FlowStatus } from '@panel/contracts';
import { z } from 'zod';
import { GetFlowStatuses } from '../application/use-cases/get-flow-statuses.use-case';
import { ListOpenFailures } from '../application/use-cases/list-open-failures.use-case';

@Controller()
export class RunsController {
  constructor(
    private readonly flows: GetFlowStatuses,
    private readonly failures: ListOpenFailures,
  ) {}

  @Get('flows')
  async listFlows() {
    return z.array(FlowStatus).parse(await this.flows.execute());
  }

  @Get('failures')
  async listFailures() {
    return z.array(Failure).parse(await this.failures.execute());
  }
}
