import type { ReactNode } from 'react';
import { Icon, IconName } from '../icons/Icon';
import { cx, Tone, toneBg } from '../tone';

export function Tag({ tone = 'sand', icon, children, className }: { tone?: Tone; icon?: IconName; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold', toneBg[tone], className)}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}
