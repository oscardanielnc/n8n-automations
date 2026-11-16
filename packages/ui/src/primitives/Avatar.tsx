import { cx, Tone, toneBg } from '../tone';

const sizes = { sm: 'size-8 rounded-[10px] text-xs', md: 'size-10 rounded-xl text-sm', lg: 'size-12 rounded-[14px] text-lg' };

/** First letter on a pastel square: a thumbnail when there is no image. */
export function Avatar({ text, tone = 'sand', size = 'md' }: { text: string; tone?: Tone; size?: keyof typeof sizes }) {
  return (
    <span aria-hidden className={cx('inline-flex flex-none items-center justify-center font-bold', sizes[size], toneBg[tone])}>
      {text.replace(/^@/, '').charAt(0).toUpperCase() || '?'}
    </span>
  );
}

const TONES: Tone[] = ['lav', 'peach', 'sky', 'mint', 'rose', 'butter'];
/** Same text, same colour, on every render. */
export function toneFor(text: string): Tone {
  let h = 0;
  for (const ch of text) h = (h + ch.charCodeAt(0)) % TONES.length;
  return TONES[h] ?? 'sand';
}
