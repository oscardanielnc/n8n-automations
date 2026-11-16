import { Controller, Get } from '@nestjs/common';
import { Overview } from '@panel/contracts';
import { GetOverview } from '../application/use-cases/get-overview.use-case';

@Controller('overview')
export class OverviewController {
  constructor(private readonly overview: GetOverview) {}

  @Get()
  async get() {
    return Overview.parse(await this.overview.execute());
  }
}
