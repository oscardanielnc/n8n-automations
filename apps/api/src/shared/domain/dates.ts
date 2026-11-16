export const LIMA = 'America/Lima';

/** YYYY-MM-DD of an instant, in Lima. */
export function limaDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: LIMA }).format(d);
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 1 = Monday … 7 = Sunday, for a YYYY-MM-DD date. */
export function isoWeekday(isoDate: string): number {
  const day = new Date(`${isoDate}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}
