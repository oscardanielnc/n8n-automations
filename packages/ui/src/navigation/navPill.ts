import { cx, Tone, toneBg } from '../tone';

/** Class for a top navigation link; the app passes it to its router's link component. */
export function navPillClass(active: boolean, tone: Tone): string {
  return cx(
    'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
    active ? toneBg[tone] : 'text-sand-ink hover:bg-[#efebe3] hover:text-ink',
  );
}
