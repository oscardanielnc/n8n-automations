import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, IconName } from '../icons/Icon';
import { cx } from '../tone';

type Variant = 'primary' | 'ghost';

// Buttons never read as text: a dark pill (primary) or a bordered white pill (ghost), always with an icon.
const base =
  'inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-50';
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-[#3a3631]',
  ghost: 'border border-[#d9d3c7] bg-surface text-ink hover:bg-bg',
};

type Common = { variant?: Variant; icon?: IconName; children: ReactNode };

/** Opens an external page in a new tab (View post, Open email, Store…). */
export function LinkButton({ variant = 'primary', icon = 'arrow', children, className, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={cx(base, variants[variant], className)} {...rest}>
      {children}
      <Icon name={icon} size={14} />
    </a>
  );
}

export function Button({ variant = 'primary', icon, children, className, type = 'button', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cx(base, variants[variant], className)} {...rest}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}
