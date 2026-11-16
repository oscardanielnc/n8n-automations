import { describe, expect, it } from 'vitest';
import { SharedFiles } from '../../../shared/application/shared-files.port';
import { FileHealthSource, FileJobRadarSource } from './file-server.sources';

class FakeFiles extends SharedFiles {
  constructor(private readonly files: Record<string, unknown>) {
    super();
  }
  async readJson(path: string) {
    return this.files[path.replace(/\\/g, '/')] ?? null;
  }
  async newest(dir: string, pattern: RegExp) {
    const names = Object.keys(this.files)
      .filter((p) => p.startsWith(`${dir}/`))
      .map((p) => p.slice(dir.length + 1))
      .filter((n) => pattern.test(n))
      .sort();
    return names.length ? `${dir}/${names.at(-1)}` : null;
  }
}

describe('FileHealthSource', () => {
  it('maps the VM health file to the contract', async () => {
    const source = new FileHealthSource(
      new FakeFiles({
        'status/health.json': {
          generatedAt: 1_763_300_000, diskPct: 64, memAvailMB: 2870, containersDown: ['old-app'], n8nHealthz: 'ok',
          backups: { n8n: { ageH: 9.4 }, 'app-db': { ageH: null } },
        },
      }),
    );
    expect(await source.read()).toEqual({
      checkedAt: new Date(1_763_300_000 * 1000).toISOString(), diskPct: 64, memAvailMb: 2870, containersDown: ['old-app'],
      n8nHealthy: true, backups: [{ name: 'n8n', ageHours: 9.4 }, { name: 'app-db', ageHours: null }],
    });
  });

  it('a missing file reads as "unknown", never as healthy', async () => {
    const health = await new FileHealthSource(new FakeFiles({})).read();
    expect(health).toMatchObject({ checkedAt: null, diskPct: null, n8nHealthy: false, backups: [] });
  });
});

describe('FileJobRadarSource', () => {
  it('reads only the newest report and keeps at most twelve candidates', async () => {
    const candidates = Array.from({ length: 15 }, (_, i) => ({ puesto: `Job ${i}`, empresa: 'Co', fuente: 'Board', puntaje: 90 - i, url: `u${i}` }));
    const source = new FileJobRadarSource(
      new FakeFiles({
        'radar/radar-2026-11-12.json': { fecha: '2026-11-12', candidatas: [] },
        'radar/radar-2026-11-16.json': { fecha: '2026-11-16', corridas: [{ fresh: 31 }], candidatas: candidates },
        'radar/radar-2026-11-16-finalistas.md': 'not json',
      }),
    );
    const radar = await source.latest();
    expect(radar.date).toBe('2026-11-16');
    expect(radar.fresh).toBe(31);
    expect(radar.items).toHaveLength(12);
    expect(radar.items[0]).toEqual({ title: 'Job 0', company: 'Co', source: 'Board', score: 90, url: 'u0' });
  });

  it('no report yet reads as an empty radar', async () => {
    expect(await new FileJobRadarSource(new FakeFiles({})).latest()).toEqual({ date: null, fresh: 0, items: [] });
  });
});
