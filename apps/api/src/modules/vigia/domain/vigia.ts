import type { Vigia, VigiaItem } from '@panel/contracts';

export type VigiaRow = {
  runAt: string;
  kind: string;
  inbox: string;
  from: string;
  subject: string;
  link: string;
  why: string;
  scam: boolean;
  extra: string;
};

const KINDS = new Set(['reply', 'win', 'prize', 'job', 'attention']);
const ORDER: Record<string, number> = { reply: 0, win: 1, prize: 2, job: 3, attention: 4 };

/** One run of the Vigía: the meta row carries counts and notes, every other row is a mail worth showing. */
export function buildVigia(rows: VigiaRow[]): Vigia {
  const meta = rows.find((r) => r.kind === 'meta');
  let parsed: { counts?: Record<string, number>; notes?: string[] };
  try {
    parsed = meta?.extra ? JSON.parse(meta.extra) : {};
  } catch {
    parsed = {};
  }
  const items: VigiaItem[] = rows
    .filter((r) => KINDS.has(r.kind))
    .sort((a, b) => (ORDER[a.kind] ?? 9) - (ORDER[b.kind] ?? 9))
    .map((r) => ({
      kind: r.kind as VigiaItem['kind'],
      inbox: r.inbox,
      from: r.from,
      subject: r.subject,
      link: r.link,
      summary: r.why,
      phishing: r.scam,
      note: r.extra,
    }));
  return {
    runAt: meta?.runAt ?? rows[0]?.runAt ?? null,
    counts: {
      outlook: parsed.counts?.Outlook ?? 0,
      gmail: parsed.counts?.Gmail ?? 0,
      work: parsed.counts?.Work ?? 0,
    },
    notes: parsed.notes ?? [],
    items,
  };
}
