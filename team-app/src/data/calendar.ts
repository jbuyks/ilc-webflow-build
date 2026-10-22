import type { Gig, Meeting } from './types';

// Reads a DJ's Google Calendar for two things the other systems don't have:
// calls (with their Zoom link) and travel (hotel stays near a gig).

export interface CalEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  eventType?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] };
}

const ZOOM = /https:\/\/[\w.-]*zoom\.us\/j\/[^\s"<>]+/i;

/** The Zoom (or Meet) join link from the conference data, location or description. */
export function joinUrl(e: CalEvent): string | undefined {
  const video = e.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')?.uri;
  if (video) return video;
  return (e.location?.match(ZOOM) ?? e.description?.match(ZOOM))?.[0]?.replace(/&amp;/g, '&');
}

/** Gig shifts BeatPilot pushes to the calendar look like "DJ — Maya and Theo". */
export function isGigShift(e: CalEvent): boolean {
  return /^[\w ]+ — /.test(e.summary ?? '') && /beatpilot/i.test(e.description ?? '');
}

/** Calls worth showing: anything with a join link that isn't a gig shift. */
export function meetingsFrom(events: CalEvent[], memberId: string, gigs: Gig[]): Meeting[] {
  return events
    .filter((e) => !isGigShift(e) && e.start.dateTime && joinUrl(e))
    .map((e) => ({
      id: e.id,
      memberId,
      title: e.summary ?? 'Call',
      start: e.start.dateTime!,
      end: e.end.dateTime ?? e.start.dateTime!,
      joinUrl: joinUrl(e),
      gigId: gigs.find((g) => mentionsCouple(e, g.couple))?.id,
    }));
}

/** Hotel stays that cover a gig's date get attached to that gig as travel. */
export function travelFor(gig: Gig, events: CalEvent[]): { label: string; address?: string }[] {
  return events
    .filter((e) => /^stay at /i.test(e.summary ?? '') && e.start.date && e.end.date)
    .filter((e) => e.start.date!.slice(0, 10) <= gig.date && gig.date < e.end.date!.slice(0, 10))
    .map((e) => ({ label: e.summary!.replace(/^stay at /i, 'Hotel: '), address: e.location }));
}

function mentionsCouple(e: CalEvent, couple: string): boolean {
  const names = couple.split(/\s*&\s*/).map((n) => n.trim().toLowerCase()).filter((n) => n.length > 2);
  const text = `${e.summary ?? ''} ${e.description ?? ''}`.toLowerCase();
  return names.length > 0 && names.every((n) => text.includes(n));
}
