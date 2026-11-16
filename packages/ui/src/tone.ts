// Literal class names (Tailwind only generates classes it can read in the source).
export type Tone = 'lav' | 'peach' | 'rose' | 'mint' | 'butter' | 'sky' | 'slate' | 'sand' | 'ok' | 'fail' | 'warn';

export const toneBg: Record<Tone, string> = {
  lav: 'bg-lav text-lav-ink',
  peach: 'bg-peach text-peach-ink',
  rose: 'bg-rose text-rose-ink',
  mint: 'bg-mint text-mint-ink',
  butter: 'bg-butter text-butter-ink',
  sky: 'bg-sky text-sky-ink',
  slate: 'bg-slate text-slate-ink',
  sand: 'bg-sand text-sand-ink',
  ok: 'bg-ok text-ok-ink',
  fail: 'bg-fail text-fail-ink',
  warn: 'bg-warn text-warn-ink',
};

export const toneInk: Record<Tone, string> = {
  lav: 'text-lav-ink',
  peach: 'text-peach-ink',
  rose: 'text-rose-ink',
  mint: 'text-mint-ink',
  butter: 'text-butter-ink',
  sky: 'text-sky-ink',
  slate: 'text-slate-ink',
  sand: 'text-sand-ink',
  ok: 'text-ok-ink',
  fail: 'text-fail-ink',
  warn: 'text-warn-ink',
};

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
