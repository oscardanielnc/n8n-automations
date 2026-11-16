import type { FlowStatus } from '@panel/contracts';
import { Icon, IconName } from '@panel/ui/icons/Icon';
import { StatusPill } from '@panel/ui/primitives/StatusPill';
import { Tone, toneBg } from '@panel/ui/tone';
import { Link } from 'react-router';
import { when } from '../../../lib/format';

const LOOK: Record<FlowStatus['key'], { icon: IconName; tone: Tone }> = {
  vigia: { icon: 'mail', tone: 'lav' },
  jobs: { icon: 'bag', tone: 'mint' },
  alerts: { icon: 'bell', tone: 'butter' },
  cleanup: { icon: 'broom', tone: 'sky' },
};
const PAGE_PATH = { home: '/' } as const;

/** One tile per flow: only the last run matters (no history bars). A failed tile opens the Errors page. */
export function FlowTiles({ flows }: { flows: FlowStatus[] }) {
  return (
    <section aria-label="Flow status" className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-3">
      {flows.map((f) => {
        const look = LOOK[f.key];
        return (
          <Link
            key={f.key}
            to={f.status === 'failed' ? '/errors' : PAGE_PATH[f.page]}
            className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-3.5 transition-colors hover:border-[#cfc8ba]"
          >
            <span className="flex items-center justify-between">
              <span className={`inline-flex size-[34px] items-center justify-center rounded-[10px] ${toneBg[look.tone]}`}>
                <Icon name={look.icon} />
              </span>
              <StatusPill state={f.status} small />
            </span>
            <span className="text-sm font-bold">{f.name}</span>
            <span className="text-xs leading-snug text-muted">
              {f.status === 'never' ? 'Never ran' : when(f.lastRunAt)} · next {when(f.nextRunAt)}
            </span>
          </Link>
        );
      })}
    </section>
  );
}
