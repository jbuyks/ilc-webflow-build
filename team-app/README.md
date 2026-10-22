# Ife Luxe Team App

A phone web app for the Ife Luxe DJ team, with an owner view. It brings each DJ's
gigs together from BeatPilot (events, crew, run sheets), HoneyBook (packages and
payments), Vibo (planning progress) and each person's Google Calendar (calls and travel). Each gig gets a prep checklist and warnings for anything falling behind.
Phones can install it to the home screen.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # warning rules
npm run build      # typecheck + production build in dist/
```

The app runs on made-up sample data until a real data source is connected. A
banner at the top says so.

## Screens

| Tab | What it shows |
|---|---|
| Home | Next gig, warnings, upcoming calls, this week, links to tools and things to send couples |
| Gigs | Upcoming gigs with Vibo %, payment and warning chips; a "Needs attention" filter |
| Gig detail | Times, venue, travel, couple, crew with their roles, BeatPilot run sheet, what they booked (no client prices), the DJ’s pay, Vibo progress and open sections, prep checklist, "Text them" with a drafted message |
| Pay | Pay per gig (blank until pay rules are set) |
| Planning | Upcoming calls with Join Zoom, Vibo status for the next 45 days and the DJ's planning call link |
| Time off | Request dates off; see request status |
| Team (owner only) | 30-day summary, "Fix this first" list, gigs per DJ, time-off approvals, every gig by DJ |

## Warnings

`src/data/flags.ts` decides what gets flagged. The rules are covered by `flags.test.ts`:

- No start time in HoneyBook within 14 days (urgent within 3)
- No DJ on the booking
- Live music booked (Hybrid Fusion, violin, sax) but no musician on the team
- Balance still due within 14 days
- No Vibo event, or the Vibo invite not accepted yet
- Vibo under 40% within 30 days (urgent within 7)
- No Vibo changes for 30+ days on a gig that isn't mostly planned
- An end-of-night moment (grand exit, last dance) set to AM

## Data

Everything the screens read goes through the `DataSource` interface in
`src/data/types.ts`. There are three ways to fill it:

1. **Sample data** (`src/data/sampleSource.ts`, the default). Made-up names, dated relative to today.
2. **Local snapshot.** Put a real export at `src/data/local/snapshot.json`, shaped as
   `{ generatedAt, team, gigs, meetings }`. That folder is git-ignored, so client data never gets committed.
3. **Live sync (to build).** A small backend that pulls from the systems below on a schedule,
   joins them and serves each signed-in person only what they should see.

Where each piece comes from:

| System | Gives the app | Code |
|---|---|---|
| **BeatPilot** (the backbone) | Staff and their roles; events with times, venue, address and couple phone; who's assigned (DJ, musicians, crew); run sheet link | `src/data/beatpilot.ts` |
| **HoneyBook** | What was booked (packages, enhancements); what the client paid and owes, owner only | — |
| **Vibo** | Planning progress, unanswered questions, last change, invite status, timeline times | — |
| **Google Calendar** | Calls with their Zoom link; hotel stays attached to the gig they cover | `src/data/calendar.ts` |
| **Zoom** | Join links, read from calendar invites (no direct Zoom connection yet) | `src/data/calendar.ts` |

`beatpilot.ts` and `calendar.ts` turn those systems' records into the app's
shapes, and `sources.test.ts` covers them with made-up records in the same format.
Notes:

- BeatPilot already imports signed and paid HoneyBook bookings and pushes each DJ's
  gigs to their Google Calendar. The calendar reader skips those gig entries so they
  don't show up as calls.
- BeatPilot can list the same person twice on one gig under two spellings of a role
  ("custom_drummer" and "Drummer"). `crewFor()` lists each person once.
- Shared inbox staff accounts (like an `info@` login) aren't treated as people.
- Vibo events are matched to BeatPilot events by date plus couple names, since spellings
  differ ("Jules and Nora" vs "Nora & Jules").
- Each person sees only the gigs they're on the BeatPilot team for. Musicians and crew
  get the same app as DJs.

## Before launch

- [ ] **Sign-in.** The sign-in screen just picks a name right now. Replace it with real
      logins (e.g. Supabase Auth or Clerk) before any real data goes in.
- [ ] **API access.** Confirm API access with BeatPilot, HoneyBook and Vibo. Connect Google
      Calendar per person with Google sign-in. Optionally connect Zoom directly for calls
      booked outside the calendar.
- [ ] **Backend.** Build the sync backend and a `liveSource` that implements `DataSource`.
- [ ] **Keep client money owner-only.** The backend must leave `billing` out of anything it sends a DJ. The app already hides it, but the browser shouldn't receive it at all.
- [ ] **Shared storage.** Store time-off requests and checklist ticks there. They're
      kept in the browser for now.
- [ ] **Pay.** Fill in pay rules and compute `djPayCents`.
- [ ] **Settings.** Fill in the empty links and phone numbers in `src/config.ts`.
- [ ] **Hosting.** Pick a host (Vercel, Netlify) and a domain.
