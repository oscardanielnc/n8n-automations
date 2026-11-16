import { cx } from '../tone';

export type RunState = 'ok' | 'failed' | 'never';

const styles: Record<RunState, { pill: string; dot: string; label: string }> = {
  ok: { pill: 'bg-ok text-ok-ink', dot: 'bg-ok-dot', label: 'OK' },
  failed: { pill: 'bg-fail text-fail-ink', dot: 'bg-fail-dot', label: 'Failed' },
  never: { pill: 'bg-sand text-sand-ink', dot: 'bg-muted', label: 'Never ran' },
};

/** Colour + dot + word: the state never depends on colour alone. */
export function StatusPill({ state, children, small }: { state: RunState; children?: string; small?: boolean }) {
  const s = styles[state];
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 font-semibold', small ? 'h-[22px] text-[11px]' : 'h-[26px] text-xs', s.pill)}>
      <span aria-hidden className={cx('size-2 rounded-full', s.dot)} />
      {children ?? s.label}
    </span>
  );
}
