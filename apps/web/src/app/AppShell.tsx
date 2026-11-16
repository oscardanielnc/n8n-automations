import { Icon, IconName } from '@panel/ui/icons/Icon';
import { navPillClass } from '@panel/ui/navigation/navPill';
import type { Tone } from '@panel/ui/tone';
import { NavLink, Outlet } from 'react-router';
import { useOverview } from '../lib/queries';

const NAV: { to: string; label: string; icon: IconName; tone: Tone }[] = [
  { to: '/', label: 'Home', icon: 'home', tone: 'lav' },
  { to: '/errors', label: 'Errors', icon: 'alert', tone: 'sand' },
];

export function AppShell() {
  const failures = useOverview().data?.openFailures ?? 0;
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span aria-hidden className="inline-flex size-[34px] items-center justify-center rounded-[10px] bg-ink text-bg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="5" cy="12" r="2.5" />
                <circle cx="19" cy="6" r="2.5" />
                <circle cx="19" cy="18" r="2.5" />
                <path d="M7.5 12h4l5-5M11.5 12l5 5" />
              </svg>
            </span>
            <span className="font-serif text-xl font-semibold">Automations</span>
          </div>
          <nav aria-label="Sections" className="flex flex-wrap gap-1">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => navPillClass(isActive, n.tone)}>
                <Icon name={n.icon} />
                {n.label}
                {n.to === '/errors' && failures > 0 && (
                  <span aria-label={`${failures} open`} className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-fail-dot px-1.5 text-[11px] text-white">
                    {failures}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-4 pb-18 pt-7 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
