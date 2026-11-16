const LIMA = 'America/Lima';

/** "Today 10:00", "Mon 9 · 18:47", "Tue 1 Dec · 04:00" in Lima time. */
export function when(iso: string | null, now = new Date()): string {
  if (!iso) return 'never';
  const d = new Date(iso);
  const day = (x: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: LIMA }).format(x);
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: LIMA, hour: '2-digit', minute: '2-digit' }).format(d);
  const tomorrow = new Date(now.getTime() + 86_400_000);
  if (day(d) === day(now)) return `Today ${time}`;
  if (day(d) === day(tomorrow)) return `Tomorrow ${time}`;
  const label = new Intl.DateTimeFormat('en-GB', { timeZone: LIMA, weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  return `${label} · ${time}`;
}

export function shortDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}
