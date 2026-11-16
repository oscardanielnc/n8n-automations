import { Injectable } from '@nestjs/common';
import type { Vigia } from '@panel/contracts';
import { buildVigia } from '../../domain/vigia';
import { VigiaRepository } from '../ports/vigia.repository';

@Injectable()
export class GetVigia {
  constructor(private readonly repo: VigiaRepository) {}

  async execute(): Promise<Vigia> {
    return buildVigia(await this.repo.findLatestRun());
  }
}
