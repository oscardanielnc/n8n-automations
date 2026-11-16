import { Module } from '@nestjs/common';
import { ExecutionsReader } from './application/ports/executions-reader.port';
import { GetFlowStatuses } from './application/use-cases/get-flow-statuses.use-case';
import { ListOpenFailures } from './application/use-cases/list-open-failures.use-case';
import { N8nExecutionsReader } from './infrastructure/n8n-executions-reader';
import { RunsController } from './presentation/runs.controller';

@Module({
  controllers: [RunsController],
  providers: [
    GetFlowStatuses,
    ListOpenFailures,
    { provide: ExecutionsReader, useClass: N8nExecutionsReader },
  ],
  exports: [GetFlowStatuses, ListOpenFailures],
})
export class RunsModule {}
