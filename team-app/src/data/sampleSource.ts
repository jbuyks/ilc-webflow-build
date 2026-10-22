import { isoToday } from './flags';
import type { DataSource, Gig, TeamMember, TimeOffRequest } from './types';

// Made-up people and events, dated relative to today so the app always has
// something to show. Real client data never belongs in this file.

const team: TeamMember[] = [
  { id: 'dj-ari', name: 'Ari', role: 'owner', phone: '(555) 010-0101' },
  { id: 'dj-sol', name: 'Sol', role: 'dj', phone: '(555) 010-0102' },
  { id: 'dj-rae', name: 'Rae', role: 'dj', phone: '(555) 010-0103' },
];

function dayOffset(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoToday(d);
}

function daysAgoIso(n: number): string {
  return dayOffset(-n) + 'T15:00:00.000Z';
}

const sampleTimeline = [
  { name: 'Cocktail Hour', time: '05:00 pm' },
  { name: 'Grand Entrance', time: '06:00 pm' },
  { name: 'First Dance', time: '06:05 pm' },
  { name: 'Last Dance', time: '10:45 pm' },
];

function buildGigs(): Gig[] {
  return [
    {
      id: 'g1', couple: 'Maya & Theo', type: 'Wedding', date: dayOffset(1), start: null, end: null,
      venue: 'Orchard House', djId: 'dj-ari', booked: ['Luxe Experience'],
      billing: { clientTotalCents: 300000, balanceDueCents: 0, paymentStatus: 'paid' }, djPayCents: null,
      vibo: { progress: 1, status: 'locked', questionsAnswered: 54, questionsTotal: 54, lastUpdated: daysAgoIso(2), openSections: [], timeline: sampleTimeline },
    },
    {
      id: 'g2', couple: 'Priya & Sam', type: 'Wedding', date: dayOffset(1), start: '4:30 pm', end: '10:30 pm',
      venue: 'Willow Creek Barn', address: 'Miamisburg, OH', couplePhone: '(555) 010-0202', djId: 'dj-sol', booked: ['Ceremony Audio'],
      billing: { clientTotalCents: 239500, balanceDueCents: 0, paymentStatus: 'paid' }, djPayCents: null,
      vibo: { progress: 0.3, status: 'active', questionsAnswered: 25, questionsTotal: 82, lastUpdated: daysAgoIso(24), openSections: ['The Details', 'Wedding party intros', 'Parent dances', 'Ceremony details'], timeline: sampleTimeline },
    },
    {
      id: 'g3', couple: 'Lena & Marcus', type: 'Wedding', date: dayOffset(2), start: '2:00 pm', end: null,
      venue: 'The Lyceum', djId: 'dj-ari', booked: ['Celebration Experience'],
      billing: { clientTotalCents: 240000, balanceDueCents: 0, paymentStatus: 'paid' }, djPayCents: null,
      vibo: { progress: 0.91, status: 'locked', questionsAnswered: 77, questionsTotal: 85, lastUpdated: daysAgoIso(7), openSections: ['Wedding party intros', 'Ceremony details'], timeline: sampleTimeline },
    },
    {
      id: 'g4', couple: 'Grace & Owen', type: 'Wedding', date: dayOffset(9), start: '5:00 pm', end: '10:00 pm',
      venue: 'Riverside Hall', address: 'Louisville, KY', couplePhone: '(555) 010-0204', djId: 'dj-ari', booked: ['Photobooth', 'Venue Uplighting'],
      billing: { clientTotalCents: 544000, balanceDueCents: 0, paymentStatus: 'paid' }, djPayCents: null,
      vibo: {
        progress: 0.32, status: 'active', questionsAnswered: 26, questionsTotal: 81, lastUpdated: daysAgoIso(18),
        openSections: ['Share Your Details', 'Wedding party entrance', 'Toasts', 'Ceremony songs', 'Must plays'],
        timeline: [{ name: 'Reception Begins', time: '06:00 pm' }, { name: 'Grand Exit', time: '10:00 am' }],
      },
    },
    {
      id: 'g5', couple: 'Nora & Jules', type: 'Wedding', date: dayOffset(15), start: '4:30 pm', end: '10:30 pm',
      venue: 'Hillcrest Reserve', djId: null, booked: ['Luxe Experience'],
      billing: { clientTotalCents: 320000, balanceDueCents: 0, paymentStatus: 'paid' }, djPayCents: null,
      vibo: { progress: 0.77, status: 'active', questionsAnswered: 72, questionsTotal: 93, lastUpdated: daysAgoIso(0), openSections: ['Toasts'], timeline: sampleTimeline },
    },
    {
      id: 'g6', couple: 'Iris & Ben', type: 'Wedding', date: dayOffset(16), start: '4:00 pm', end: '11:00 pm',
      venue: 'The Overlook', couplePhone: '(555) 010-0206', djId: 'dj-ari', booked: ['Elevated Experience', 'Hybrid Fusion (DJ + Musician)', 'Photobooth'],
      billing: { clientTotalCents: 619600, balanceDueCents: 0, paymentStatus: 'paid' }, djPayCents: null,
      vibo: { progress: 0.1, status: 'active', questionsAnswered: 10, questionsTotal: 101, lastUpdated: daysAgoIso(45), openSections: ['First dance', 'Parent dances', 'Wedding party intros', 'Ceremony details', 'Cocktail and dinner music'], timeline: [] },
    },
    {
      id: 'g7', couple: 'Ella & Jonah', type: 'Wedding', date: dayOffset(23), start: '4:00 pm', end: '11:00 pm',
      venue: 'Peach Hill Estate', djId: 'dj-rae', booked: ['Celebration Experience', 'Ceremony Violin', 'Hybrid Fusion (DJ + Musician)'],
      billing: { clientTotalCents: 599500, balanceDueCents: 150000, paymentStatus: 'partial' }, djPayCents: null,
      vibo: { progress: 0.69, status: 'active', questionsAnswered: 69, questionsTotal: 100, lastUpdated: daysAgoIso(6), openSections: ['Mother-son dance', 'Unity ceremony'], timeline: sampleTimeline },
    },
    {
      id: 'g8', couple: 'Zoe & Liam', type: 'Wedding', date: dayOffset(30), start: '4:00 pm', end: '9:30 pm',
      venue: 'The Loft on Fifth', couplePhone: '(555) 010-0208', djId: 'dj-ari', booked: ['Venue Uplighting', 'Velvet Drift', 'Signature Spark'],
      billing: { clientTotalCents: 410000, balanceDueCents: 0, paymentStatus: 'paid' }, djPayCents: null,
      vibo: { progress: 0.11, status: 'pending', questionsAnswered: 9, questionsTotal: 83, lastUpdated: daysAgoIso(2), openSections: ['The Details', 'Your Vendor Dream Team', 'Wedding party intros', 'Parent dances'], timeline: sampleTimeline },
    },
  ];
}

const TIME_OFF_KEY = 'ilc.sample.timeoff';

function loadTimeOff(): TimeOffRequest[] {
  try {
    return JSON.parse(localStorage.getItem(TIME_OFF_KEY) ?? '[]') as TimeOffRequest[];
  } catch {
    return [];
  }
}

function saveTimeOff(list: TimeOffRequest[]) {
  try {
    localStorage.setItem(TIME_OFF_KEY, JSON.stringify(list));
  } catch {
    // Private mode or storage blocked: requests last until reload.
  }
}

let timeOffCache: TimeOffRequest[] | null = null;

export const sampleSource: DataSource = {
  label: 'Sample data',
  async team() {
    return team;
  },
  async gigs() {
    return buildGigs();
  },
  async timeOff() {
    timeOffCache ??= loadTimeOff();
    return timeOffCache;
  },
  async requestTimeOff(req) {
    const list = await this.timeOff();
    const created: TimeOffRequest = { ...req, id: `t${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
    timeOffCache = [created, ...list];
    saveTimeOff(timeOffCache);
    return created;
  },
  async decideTimeOff(id, status) {
    const list = await this.timeOff();
    timeOffCache = list.map((r) => (r.id === id ? { ...r, status } : r));
    saveTimeOff(timeOffCache);
  },
};
