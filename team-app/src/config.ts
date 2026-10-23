// Company settings the office edits. Empty strings show as "not set" in the app.

export const config = {
  tools: [
    { name: 'HoneyBook', note: 'Bookings, contracts, payments', url: 'https://www.honeybook.com/app' },
    { name: 'Vibo', note: 'Couples’ music and timelines', url: 'https://app.vibodj.com' },
    { name: 'BeatPilot', note: 'Run sheets, crew and your schedule', url: 'https://planner.beatpilot.ai' },
    { name: 'Zoom', note: 'Planning calls and consults', url: 'https://zoom.us' },
  ],
  sendToCouples: [
    { name: 'Investment guide', note: 'For anyone asking about pricing', url: '' },
    { name: 'Enhancements menu', note: 'Hybrid Fusion, lighting, sparks', url: '' },
    { name: 'Google review link', note: 'For happy couples after the event', url: '' },
    { name: 'ifeluxecol.com', note: 'Our website', url: 'https://ifeluxecol.com' },
  ],
  officeContacts: [
    { label: 'Office', phone: '' },
    { label: 'Gear', phone: '' },
  ],
  /** Per-DJ booking link for planning calls; {name} is replaced with the DJ's first name. */
  planningLink: '',
  payRules: '',
};

/** Prep steps every gig gets, timed by days before the event (negative = after). */
export const checklistTemplate = [
  { id: 'intro', daysBefore: 30, text: 'Introduce yourself to the couple by text' },
  { id: 'call', daysBefore: 21, text: 'Planning call done or booked' },
  { id: 'vibo', daysBefore: 14, text: 'Music and timeline locked in Vibo: entrances, dances, cake, last song' },
  { id: 'confirm', daysBefore: 7, text: 'Confirm timeline with the planner, load-in, parking and crew call time' },
  { id: 'runsheet', daysBefore: 3, text: 'Run sheet final, name pronunciations recorded' },
  { id: 'gear', daysBefore: 1, text: 'Gear packed and tested, backup tracks loaded, couple and planner numbers saved' },
  { id: 'thanks', daysBefore: -1, text: 'Send a thank-you text with the Google review link' },
];
