import type { ReactNode } from 'react';

/** One item inside a SectionCard: thumbnail · title (bold) · summary (plain) · meta (grey + tags) · action. */
export function ListRow({
  leading,
  title,
  summary,
  meta,
  action,
}: {
  leading?: ReactNode;
  title: ReactNode;
  summary?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 border-t border-line-soft px-5 py-3.5 first:border-t-0">
      {leading}
      <div className="min-w-0 flex-1">
        <div className="break-words text-[15px] font-semibold leading-snug text-ink">{title}</div>
        {summary && <div className="mt-1 text-[13.5px] leading-normal text-ink-2">{summary}</div>}
        {meta && <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted">{meta}</div>}
      </div>
      {action}
    </div>
  );
}
