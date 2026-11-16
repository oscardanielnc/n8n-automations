import { cx } from '../tone';

export type SegmentOption<T extends string> = { value: T; label: string; count?: number };

/** Filter tabs (Today · Tomorrow · …). Keyboard: Tab to the group, buttons are real buttons. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
              on ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-sand-ink hover:border-[#cfc8ba] hover:text-ink',
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cx('rounded-full px-1.5 font-mono text-xs', on ? 'bg-surface text-ink' : 'bg-sand text-sand-ink')}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
