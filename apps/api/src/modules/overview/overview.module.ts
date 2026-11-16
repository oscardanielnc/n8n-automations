import { Module } from '@nestjs/common';
import { RunsModule } from '../runs/runs.module';
import { GetOverview } from './application/use-cases/get-overview.use-case';
import { OverviewController } from './presentation/overview.controller';

@Module({
  imports: [RunsModule],
  controllers: [OverviewController],
  providers: [GetOverview],
})
export class OverviewModule {}
