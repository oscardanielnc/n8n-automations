import type { ReactNode } from 'react';

export function PageTitle({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[.08em] text-muted">{eyebrow}</div>
        <h1 className="mt-1 font-serif text-[40px] font-semibold leading-none">{title}</h1>
      </div>
      {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
    </div>
  );
}
