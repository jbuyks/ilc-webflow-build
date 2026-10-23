import { describe, expect, it } from 'vitest';
import { clockLabel, crewFor, duplicateAssignments, mapEvent, mapStaff, messagesUrl, roleLabel, type BpAssignment } from './beatpilot';
import { joinUrl, meetingsFrom, travelFor, type CalEvent } from './calendar';

// Shapes mirror what BeatPilot and Google Calendar return; the values are made up.

const assignments: BpAssignment[] = [
  { employee_id: 'dj1', assignment_role: 'DJ', event_id: 'e1' },
  { employee_id: 'drum', assignment_role: 'custom_drummer', event_id: 'e1' },
  { employee_id: 'drum', assignment_role: 'Drummer', event_id: 'e1' },
  { employee_id: 'sax', assignment_role: 'custom_saxaphone', event_id: 'e1' },
  { employee_id: 'dj2', assignment_role: 'DJ', event_id: 'e2' },
];

describe('BeatPilot', () => {
  it('cleans up role names', () => {
    expect(roleLabel('custom_saxaphone')).toBe('Saxophone');
    expect(roleLabel('custom_drummer')).toBe('Drummer');
    expect(roleLabel('Setup Crew')).toBe('Setup Crew');
  });

  it('links to the event\'s Messages tab', () => {
    expect(messagesUrl('https://planner.beatpilot.ai/events/e1')).toBe('https://planner.beatpilot.ai/events/e1?tab=messages');
  });

  it('formats 24-hour times', () => {
    expect(clockLabel('17:00:00')).toBe('5:00 pm');
    expect(clockLabel('00:30:00')).toBe('12:30 am');
    expect(clockLabel(null)).toBeNull();
  });

  it('lists each person once per role and counts the repeats', () => {
    expect(crewFor('e1', assignments)).toEqual([
      { memberId: 'dj1', role: 'DJ' },
      { memberId: 'drum', role: 'Drummer' },
      { memberId: 'sax', role: 'Saxophone' },
    ]);
    expect(duplicateAssignments('e1', assignments)).toBe(1);
  });

  it('skips shared inbox accounts and marks owners', () => {
    const team = mapStaff(
      [
        { id: 'x', first_name: 'info', last_name: '', role: 'DJ', email: 'info@example.com', phone: null },
        { id: 'a', first_name: 'Ari', last_name: 'Lane', role: 'DJ', email: null, phone: '+15550100' },
      ],
      ['a'],
    );
    expect(team).toEqual([{ id: 'a', name: 'Ari Lane', role: 'owner', title: 'DJ', phone: '+15550100', email: undefined }]);
  });

  it('turns an event into a gig with its DJ and crew', () => {
    const gig = mapEvent(
      { id: 'e1', name: 'Maya and Theo', event_date: '2026-11-07', event_type: 'Wedding', status: 'confirmed', start_time: '16:00:00', end_time: null, client_phone: '+15550111', venue_name: null, venue_address: 'The Overlook, Louisville, KY', app_url: 'https://planner.example/e1' },
      assignments,
    );
    expect(gig).toMatchObject({ couple: 'Maya & Theo', start: '4:00 pm', end: null, venue: 'The Overlook, Louisville, KY', djId: 'dj1', couplePhone: '+15550111' });
    expect(gig.crew).toHaveLength(3);
  });
});

describe('Google Calendar', () => {
  const zoomCall: CalEvent = {
    id: 'c1', summary: 'Planning call: Maya & Theo',
    description: '<a href="https://us02web.zoom.us/j/123456789?pwd=abc">join</a>',
    start: { dateTime: '2026-10-28T19:00:00-04:00' }, end: { dateTime: '2026-10-28T19:30:00-04:00' },
  };
  const shift: CalEvent = {
    id: 'c2', summary: 'DJ — Maya and Theo', description: 'View in BeatPilot: https://planner.example/e1 https://zoom.us/j/999',
    start: { dateTime: '2026-11-07T16:00:00-05:00' }, end: { dateTime: '2026-11-07T23:00:00-05:00' },
  };
  const hotel: CalEvent = {
    id: 'c3', summary: 'Stay at Riverside Inn', location: '1 River Rd, Louisville, KY', eventType: 'FROM_GMAIL',
    start: { date: '2026-11-06' }, end: { date: '2026-11-08' },
  };

  it('finds the Zoom link', () => {
    expect(joinUrl(zoomCall)).toBe('https://us02web.zoom.us/j/123456789?pwd=abc');
  });

  it('keeps calls, drops gig shifts, and links calls to the gig they mention', () => {
    const gig = { id: 'e1', couple: 'Maya & Theo' } as never;
    const meetings = meetingsFrom([zoomCall, shift, hotel], 'dj1', [gig]);
    expect(meetings.map((m) => [m.id, m.gigId])).toEqual([['c1', 'e1']]);
  });

  it('attaches a hotel stay to the gig it covers', () => {
    const gig = { date: '2026-11-07' } as never;
    expect(travelFor(gig, [hotel])).toEqual([{ label: 'Hotel: Riverside Inn', address: '1 River Rd, Louisville, KY' }]);
    expect(travelFor({ date: '2026-11-08' } as never, [hotel])).toEqual([]);
  });
});
