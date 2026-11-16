import type { ReactNode } from 'react';
import { Icon, IconName } from '../icons/Icon';
import { cx, Tone, toneBg } from '../tone';

export function EmptyState({ tone = 'sand', icon = 'check', title, children }: { tone?: Tone; icon?: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-9 text-center">
      <span className={cx('inline-flex size-13 items-center justify-center rounded-2xl', toneBg[tone])}>
        <Icon name={icon} size={24} />
      </span>
      <div className="font-serif text-xl font-semibold">{title}</div>
      {children && <div className="text-[13px] text-muted">{children}</div>}
    </div>
  );
}
