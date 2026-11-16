import type { ReactNode } from 'react';
import { Icon, IconName } from '../icons/Icon';
import { cx, Tone, toneBg, toneInk } from '../tone';

/**
 * The panel's signature block: a pastel header with an icon chip and a serif title (the section),
 * then white content (the items). Title and content never look alike.
 */
export function SectionCard({
  tone,
  icon,
  title,
  subtitle,
  aside,
  children,
  className,
}: {
  tone: Tone;
  icon: IconName;
  title: string;
  subtitle?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={title}
      className={cx('overflow-hidden rounded-[18px] border border-line bg-surface shadow-[0_1px_2px_rgba(31,29,26,.04),0_8px_24px_-12px_rgba(31,29,26,.10)]', className)}
    >
      <header className={cx('flex flex-wrap items-center justify-between gap-2.5 px-5 py-4', toneBg[tone])}>
        <div className="flex items-center gap-3">
          <span className={cx('inline-flex size-10 flex-none items-center justify-center rounded-xl bg-surface shadow-sm', toneInk[tone])}>
            <Icon name={icon} size={20} />
          </span>
          <div>
            <h2 className="font-serif text-[22px] font-semibold leading-tight">{title}</h2>
            {subtitle && <div className="text-xs font-medium opacity-85">{subtitle}</div>}
          </div>
        </div>
        {aside && <div className="flex flex-wrap items-center gap-1.5">{aside}</div>}
      </header>
      {children}
    </section>
  );
}
