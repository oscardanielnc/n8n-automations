import { Icon } from '../icons/Icon';
import { cx } from '../tone';

/**
 * The eye button. Unread: outlined eye ("mark as read"). Read: dark filled, crossed eye ("mark as unread").
 * A read item stays on screen today, dimmed, and is gone tomorrow; unmarking keeps it for tomorrow.
 */
export function ReadToggle({ read, onToggle, label }: { read: boolean; onToggle: () => void; label: string }) {
  const action = read ? `Mark as unread: ${label}` : `Mark as read: ${label}`;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={read}
      aria-label={action}
      title={read ? 'Read · click to mark as unread' : 'Mark as read'}
      className={cx(
        'inline-flex size-9 flex-none items-center justify-center rounded-full border transition-colors',
        read ? 'border-ink bg-ink text-white hover:bg-[#3a3631]' : 'border-[#d9d3c7] bg-surface text-sand-ink hover:border-ink hover:text-ink',
      )}
    >
      <Icon name={read ? 'eyeOff' : 'eye'} size={17} />
    </button>
  );
}
