import { Injectable } from '@nestjs/common';
import { N8nClient } from '../../../shared/infrastructure/n8n/n8n-client';
import { VigiaRepository } from '../application/ports/vigia.repository';
import type { VigiaRow } from '../domain/vigia';

@Injectable()
export class N8nVigiaRepository extends VigiaRepository {
  constructor(private readonly n8n: N8nClient) {
    super();
  }

  async findLatestRun(): Promise<VigiaRow[]> {
    const rows = await this.n8n.rows('vigia');
    const latest = Math.max(0, ...rows.map((r) => Number(r.run_ts) || 0));
    return rows
      .filter((r) => Number(r.run_ts) === latest)
      .map((r) => ({
        runAt: new Date(String(r.run_at)).toISOString(),
        kind: String(r.kind ?? ''),
        inbox: String(r.inbox ?? ''),
        from: String(r.from_name ?? ''),
        subject: String(r.subject ?? ''),
        link: String(r.link ?? ''),
        why: String(r.why ?? ''),
        scam: r.scam === true,
        extra: String(r.extra ?? ''),
      }));
  }
}
