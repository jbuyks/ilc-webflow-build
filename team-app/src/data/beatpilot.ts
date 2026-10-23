import type { CrewSlot, Gig, TeamMember } from './types';

// Converts BeatPilot records into the app's shapes. Field names follow what
// BeatPilot returns for staff, events and the staff schedule. The live sync
// fills in billing (HoneyBook) and vibo (Vibo) afterwards.

export interface BpStaff {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string | null;
  phone: string | null;
}

export interface BpEvent {
  id: string;
  name: string;
  event_date: string;
  event_type: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  client_phone: string | null;
  venue_name: string | null;
  venue_address: string | null;
  app_url: string;
}

export interface BpAssignment {
  employee_id: string;
  assignment_role: string;
  event_id: string;
}

/** "custom_saxaphone" → "Saxophone", "Setup Crew" → "Setup Crew". */
export function roleLabel(raw: string): string {
  const cleaned = raw.replace(/^custom_/i, '').replace(/_/g, ' ').trim();
  const fixed = cleaned.toLowerCase() === 'saxaphone' ? 'saxophone' : cleaned;
  return fixed.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "17:00:00" → "5:00 pm" */
export function clockLabel(time: string | null): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * The event's Messages tab in BeatPilot: client texts, emails and portal
 * messages in one thread. BeatPilot only shows the tab to staff given the
 * "manage client messages" permission.
 */
export function messagesUrl(eventUrl: string): string {
  const url = new URL(eventUrl);
  url.searchParams.set('tab', 'messages');
  return url.toString();
}

export function mapStaff(staff: BpStaff[], ownerIds: string[]): TeamMember[] {
  return staff
    .filter((s) => s.last_name || s.first_name.toLowerCase() !== 'info') // shared inbox accounts aren't people
    .map((s) => ({
      id: s.id,
      name: [s.first_name, s.last_name].filter(Boolean).join(' '),
      role: ownerIds.includes(s.id) ? 'owner' : 'dj',
      title: roleLabel(s.role),
      phone: s.phone ?? undefined,
      email: s.email ?? undefined,
    }));
}

/**
 * One crew slot per person per gig. BeatPilot can list the same person twice
 * under two spellings of a role ("custom_drummer" and "Drummer"), so labels are
 * normalized before de-duplicating.
 */
export function crewFor(eventId: string, assignments: BpAssignment[]): CrewSlot[] {
  const seen = new Set<string>();
  const crew: CrewSlot[] = [];
  for (const a of assignments) {
    if (a.event_id !== eventId) continue;
    const role = roleLabel(a.assignment_role);
    const key = `${a.employee_id}|${role.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    crew.push({ memberId: a.employee_id, role });
  }
  return crew;
}

/** How many assignments on this event repeat a person in the same role. */
export function duplicateAssignments(eventId: string, assignments: BpAssignment[]): number {
  const all = assignments.filter((a) => a.event_id === eventId).length;
  return all - crewFor(eventId, assignments).length;
}

export function mapEvent(e: BpEvent, assignments: BpAssignment[]): Gig {
  const crew = crewFor(e.id, assignments);
  const dj = crew.find((c) => c.role === 'DJ');
  return {
    id: e.id,
    couple: e.name.replace(/\band\b/, '&'),
    type: e.event_type,
    date: e.event_date,
    start: clockLabel(e.start_time),
    end: clockLabel(e.end_time),
    venue: e.venue_name ?? e.venue_address ?? 'Venue not set',
    address: e.venue_name && e.venue_address ? e.venue_address : undefined,
    couplePhone: e.client_phone ?? undefined,
    djId: dj?.memberId ?? null,
    crew,
    beatpilotUrl: e.app_url,
    booked: [],
    vibo: null,
    djPayCents: null,
  };
}
