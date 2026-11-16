import { Injectable } from '@nestjs/common';
import type { ServerHealth } from '@panel/contracts';
import { HealthSource } from '../ports/server.sources';

@Injectable()
export class GetServerHealth {
  constructor(private readonly health: HealthSource) {}

  execute(): Promise<ServerHealth> {
    return this.health.read();
  }
}
