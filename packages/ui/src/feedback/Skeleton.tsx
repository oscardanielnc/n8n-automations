import { cx } from '../tone';

export function Skeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div aria-busy="true" aria-label="Loading" className={cx('flex flex-col gap-3 px-5 py-4', className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3.5">
          <div className="size-10 animate-pulse rounded-xl bg-sand" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/5 animate-pulse rounded bg-sand" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-line-soft" />
          </div>
        </div>
      ))}
    </div>
  );
}
