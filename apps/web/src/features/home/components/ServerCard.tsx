import { SectionCard } from '@panel/ui/data-display/SectionCard';
import { ErrorState } from '@panel/ui/feedback/ErrorState';
import { Skeleton } from '@panel/ui/feedback/Skeleton';
import { when } from '../../../lib/format';
import { useServerHealth } from '../api/queries';

function Meter({ label, value, pct, bad }: { label: string; value: string; pct: number; bad: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={`mb-1.5 mt-0.5 text-base font-bold ${bad ? 'text-fail-ink' : ''}`}>{value}</div>
      <div className="h-1.5 rounded bg-slate" role="presentation">
        <div className={`h-1.5 rounded ${bad ? 'bg-fail-dot' : 'bg-slate-ink'}`} style={{ width: `${Math.min(100, Math.max(4, pct))}%` }} />
      </div>
    </div>
  );
}

export function ServerCard() {
  const q = useServerHealth();
  const h = q.data;
  const oldBackup = h?.backups.some((b) => b.ageHours === null || b.ageHours > 26) ?? false;
  const ok = h && h.n8nHealthy && h.containersDown.length === 0 && (h.diskPct ?? 0) <= 85 && !oldBackup;
  return (
    <SectionCard tone="slate" icon="server" title="Server" subtitle={h ? `Checked ${when(h.checkedAt)} · ${ok ? 'all good' : 'needs a look'}` : 'VM health'}>
      {q.isPending && <Skeleton rows={2} />}
      {q.isError && <ErrorState what="server health" onRetry={() => void q.refetch()} />}
      {h && (
        <div className="grid grid-cols-2 gap-3.5 px-5 py-4">
          <Meter label="Disk" value={h.diskPct === null ? '—' : `${h.diskPct} %`} pct={h.diskPct ?? 0} bad={(h.diskPct ?? 0) > 85} />
          <Meter
            label="RAM free"
            value={h.memAvailMb === null ? '—' : `${(h.memAvailMb / 1024).toFixed(1)} GB`}
            pct={((h.memAvailMb ?? 0) / 5642) * 100}
            bad={(h.memAvailMb ?? 9999) < 700}
          />
          <Meter
            label="Backups"
            value={oldBackup ? 'one is late' : `all < ${Math.ceil(Math.max(0, ...h.backups.map((b) => b.ageHours ?? 0)))} h`}
            pct={100}
            bad={oldBackup}
          />
          <Meter
            label="Containers"
            value={h.containersDown.length ? `down: ${h.containersDown.join(', ')}` : 'all up'}
            pct={100}
            bad={h.containersDown.length > 0}
          />
        </div>
      )}
    </SectionCard>
  );
}
