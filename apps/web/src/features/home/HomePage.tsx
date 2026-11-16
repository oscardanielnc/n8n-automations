import { Link } from 'react-router';
import { PageTitle } from '../../components/PageTitle';
import { useOverview } from '../../lib/queries';
import { FlowTiles } from './components/FlowTiles';
import { JobRadarCard } from './components/JobRadarCard';
import { ServerCard } from './components/ServerCard';
import { VigiaCard } from './components/VigiaCard';

const today = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Lima', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

const chip = 'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold';

export function HomePage() {
  const o = useOverview().data;
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        eyebrow="Today"
        title={today()}
        aside={
          o && (
            <>
              {o.openFailures > 0 && (
                <Link to="/errors" className={`${chip} border-[#f7c9c9] bg-fail text-fail-ink`}>
                  <span aria-hidden className="size-2 rounded-full bg-fail-dot" />
                  {o.openFailures} {o.openFailures === 1 ? 'flow needs' : 'flows need'} a look
                </Link>
              )}
            </>
          )
        }
      />
      {o && <FlowTiles flows={o.flows} />}
      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[999_1_560px]">
          <VigiaCard />
        </div>
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-6">
          <JobRadarCard />
          <ServerCard />
        </div>
      </div>
    </div>
  );
}
