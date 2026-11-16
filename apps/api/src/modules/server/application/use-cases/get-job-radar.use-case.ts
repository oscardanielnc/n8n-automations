import { Injectable } from '@nestjs/common';
import type { JobRadar } from '@panel/contracts';
import { JobRadarSource } from '../ports/server.sources';

@Injectable()
export class GetJobRadar {
  constructor(private readonly radar: JobRadarSource) {}

  async execute(): Promise<JobRadar> {
    const r = await this.radar.latest();
    return { ...r, items: [...r.items].sort((a, b) => b.score - a.score) };
  }
}
