import { Controller, Get } from '@nestjs/common';
import { JobRadar, ServerHealth } from '@panel/contracts';
import { GetJobRadar } from '../application/use-cases/get-job-radar.use-case';
import { GetServerHealth } from '../application/use-cases/get-server-health.use-case';

@Controller()
export class ServerController {
  constructor(
    private readonly health: GetServerHealth,
    private readonly radar: GetJobRadar,
  ) {}

  @Get('server')
  async getHealth() {
    return ServerHealth.parse(await this.health.execute());
  }

  @Get('jobs')
  async getJobs() {
    return JobRadar.parse(await this.radar.execute());
  }
}
