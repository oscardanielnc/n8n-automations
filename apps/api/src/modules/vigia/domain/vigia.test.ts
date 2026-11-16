import { describe, expect, it } from 'vitest';
import { buildVigia, VigiaRow } from './vigia';

const row = (over: Partial<VigiaRow>): VigiaRow => ({
  runAt: '2026-11-10T23:48:51.000Z', kind: 'attention', inbox: 'Outlook', from: 'BCP', subject: 's', link: 'l',
  why: '', scam: false, extra: '', ...over,
});

describe('buildVigia', () => {
  it('reads counts and notes from the meta row and orders mails by importance', () => {
    const v = buildVigia([
      row({ kind: 'meta', extra: JSON.stringify({ counts: { Outlook: 19, Gmail: 15, Work: 7 }, notes: ['Get on Board: none'] }) }),
      row({ kind: 'attention', subject: 'bank' }),
      row({ kind: 'reply', subject: 'company wrote you', why: 'Answer today' }),
      row({ kind: 'attention', subject: 'phish', scam: true }),
    ]);
    expect(v.counts).toEqual({ outlook: 19, gmail: 15, work: 7 });
    expect(v.notes).toEqual(['Get on Board: none']);
    expect(v.items.map((i) => i.subject)).toEqual(['company wrote you', 'bank', 'phish']);
    expect(v.items[2]?.phishing).toBe(true);
    expect(v.items[0]?.summary).toBe('Answer today');
  });

  it('survives an empty table', () => {
    expect(buildVigia([])).toEqual({ runAt: null, counts: { outlook: 0, gmail: 0, work: 0 }, notes: [], items: [] });
  });
});
