import { describe, expect, it } from 'vitest';
import { FLOWS, nextRun } from './flow-catalog';

const flow = (key: string) => FLOWS.find((f) => f.key === key)!;

describe('nextRun', () => {
  it('reads the schedule in Lima time: from a Tuesday, the job radar runs on Thursday 08:00 Lima (13:00 UTC)', () => {
    expect(nextRun(flow('jobs'), new Date('2026-11-17T15:00:00.000Z'))).toBe('2026-11-19T13:00:00.000Z');
  });

  it('a monthly flow that already ran this month waits for day 1 of the next one', () => {
    expect(nextRun(flow('cleanup'), new Date('2026-11-16T15:00:00.000Z'))).toBe('2026-12-01T09:00:00.000Z');
  });

  it('every flow in the catalogue has a fixed workflow id and a builder', () => {
    for (const f of FLOWS) {
      expect(f.workflowId).toMatch(/^[A-Za-z0-9]{16}$/);
      expect(f.builder).toMatch(/^workflows\/build_\w+\.py$/);
    }
  });
});
