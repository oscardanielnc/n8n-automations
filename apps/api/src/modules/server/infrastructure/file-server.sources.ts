import { Injectable } from '@nestjs/common';
import type { JobRadar, ServerHealth } from '@panel/contracts';
import { SharedFiles } from '../../../shared/application/shared-files.port';
import { HealthSource, JobRadarSource } from '../application/ports/server.sources';

type HealthFile = {
  generatedAt?: number;
  backups?: Record<string, { ageH?: number | null }>;
  diskPct?: number;
  memAvailMB?: number;
  containersDown?: string[];
  n8nHealthz?: string;
};

@Injectable()
export class FileHealthSource extends HealthSource {
  constructor(private readonly files: SharedFiles) {
    super();
  }

  async read(): Promise<ServerHealth> {
    const h = (await this.files.readJson('status/health.json')) as HealthFile | null;
    return {
      checkedAt: h?.generatedAt ? new Date(h.generatedAt * 1000).toISOString() : null,
      diskPct: h?.diskPct ?? null,
      memAvailMb: h?.memAvailMB ?? null,
      backups: Object.entries(h?.backups ?? {}).map(([name, b]) => ({ name, ageHours: b.ageH ?? null })),
      containersDown: h?.containersDown ?? [],
      n8nHealthy: h?.n8nHealthz === 'ok',
    };
  }
}

type RadarFile = {
  fecha?: string;
  corridas?: { fresh?: number }[];
  candidatas?: { puesto?: string; empresa?: string; fuente?: string; puntaje?: number; url?: string }[];
};

const RADAR_DIR = 'radar';

@Injectable()
export class FileJobRadarSource extends JobRadarSource {
  constructor(private readonly files: SharedFiles) {
    super();
  }

  async latest(): Promise<JobRadar> {
    const path = await this.files.newest(RADAR_DIR, /^radar-\d{4}-\d{2}-\d{2}\.json$/);
    const r = path ? ((await this.files.readJson(path)) as RadarFile | null) : null;
    if (!r) return { date: null, fresh: 0, items: [] };
    return {
      date: r.fecha ?? null,
      fresh: r.corridas?.[0]?.fresh ?? 0,
      items: (r.candidatas ?? []).slice(0, 12).map((c) => ({
        title: c.puesto ?? '',
        company: c.empresa ?? '',
        source: c.fuente ?? '',
        score: c.puntaje ?? 0,
        url: c.url ?? '',
      })),
    };
  }
}
