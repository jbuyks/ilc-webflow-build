import type { Gig } from './types';

export type Severity = 'urgent' | 'warn';

export interface Flag {
  gigId: string;
  severity: Severity;
  /** Short chip text, e.g. "Vibo 30%". */
  label: string;
  /** One-sentence explanation for lists. */
  detail: string;
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole days from `today` to `date` (both YYYY-MM-DD). 0 = today, 1 = tomorrow. */
export function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / DAY);
}

export function isoToday(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Moments that happen at the end of the night; an AM time on one is almost always a typo.
const LATE_MOMENTS = /exit|last dance|end of night|send.?off/i;

export function flagsFor(gig: Gig, today: string): Flag[] {
  const days = daysUntil(gig.date, today);
  if (days < 0) return [];
  const flags: Flag[] = [];
  const add = (severity: Severity, label: string, detail: string) =>
    flags.push({ gigId: gig.id, severity, label, detail });

  if (!gig.start && days <= 14) {
    add(days <= 3 ? 'urgent' : 'warn', 'Times missing', 'No start or end time in HoneyBook.');
  }
  if (!gig.djId) {
    add('warn', 'No DJ assigned', 'The HoneyBook booking has no DJ line item.');
  }
  if (gig.balanceDueCents > 0 && days <= 14) {
    add('urgent', 'Balance due', `${money(gig.balanceDueCents)} still owed.`);
  }

  const v = gig.vibo;
  if (!v) {
    if (days <= 45) add('warn', 'Not in Vibo', 'No Vibo event found for this booking.');
    return flags;
  }
  const pct = Math.round(v.progress * 100);
  if (v.status === 'pending') {
    add('warn', 'Vibo invite pending', 'The couple hasn’t accepted their Vibo invite.');
  }
  if (v.progress < 0.4 && days <= 30) {
    const open = v.questionsTotal - v.questionsAnswered;
    add(days <= 7 ? 'urgent' : 'warn', `Vibo ${pct}%`, `${open} of ${v.questionsTotal} Vibo questions unanswered.`);
  }
  const quietDays = daysUntil(today, v.lastUpdated.slice(0, 10));
  if (quietDays >= 30 && v.progress < 0.8 && days <= 45) {
    add('warn', `Quiet ${quietDays} days`, `No Vibo changes since ${shortDate(v.lastUpdated.slice(0, 10))}.`);
  }
  for (const t of v.timeline) {
    if (LATE_MOMENTS.test(t.name) && /am$/i.test(t.time.trim())) {
      add('warn', `${t.name.replace(/[^\w\s'&-]/g, '').trim()} at ${t.time.toUpperCase()}`, `Vibo has ${t.name.trim()} at ${t.time}. Probably meant PM.`);
    }
  }
  return flags;
}

export function worst(flags: Flag[]): Severity | null {
  if (flags.some((f) => f.severity === 'urgent')) return 'urgent';
  return flags.length ? 'warn' : null;
}

export function money(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 ? 2 : 0 });
}

export function shortDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function longDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function relativeDay(date: string, today: string): string {
  const d = daysUntil(date, today);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d < 7) return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  return `In ${d} days`;
}
