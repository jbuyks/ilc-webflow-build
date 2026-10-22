# Ife Luxe Team App

A phone web app for the Ife Luxe DJ team, with an owner view. It brings each DJ's
gigs together from HoneyBook (bookings, packages, payments) and Vibo (planning
progress). Each gig gets a prep checklist and warnings for anything falling behind.
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
| Home | Next gig, warnings, this week, links to tools and things to send couples |
| Gigs | Upcoming gigs with Vibo %, payment and warning chips; a "Needs attention" filter |
| Gig detail | Times, venue, couple, what they booked (no client prices), the DJ’s pay, Vibo progress and open sections, prep checklist, "Text them" with a drafted message |
| Pay | Pay per gig (blank until pay rules are set) |
| Planning | Vibo status for the next 45 days and the DJ's planning call link |
| Time off | Request dates off; see request status |
| Team (owner only) | 30-day summary, "Fix this first" list, gigs per DJ, time-off approvals, every gig by DJ |

## Warnings

`src/data/flags.ts` decides what gets flagged. The rules are covered by `flags.test.ts`:

- No start time in HoneyBook within 14 days (urgent within 3)
- No DJ on the booking
- Balance still due within 14 days
- No Vibo event, or the Vibo invite not accepted yet
- Vibo under 40% within 30 days (urgent within 7)
- No Vibo changes for 30+ days on a gig that isn't mostly planned
- An end-of-night moment (grand exit, last dance) set to AM

## Data

Everything the screens read goes through the `DataSource` interface in
`src/data/types.ts`. There are three ways to fill it:

1. **Sample data** (`src/data/sampleSource.ts`, the default). Made-up names, dated relative to today.
2. **Local snapshot.** Put a real export at `src/data/local/snapshot.json` shaped as
   `{ generatedAt, team, gigs }`. That folder is git-ignored, so client data never gets committed.
3. **Live sync (to build).** A small backend that pulls from HoneyBook and Vibo on a
   schedule, joins them and serves `team` and `gigs` to signed-in users.

How the two systems join up:

- HoneyBook project → gig: date, times, venue, packages and the DJ, taken from the line
  item that names them. Payment status and balance come from the project's invoice.
- Vibo event → `gig.vibo`: progress, questions answered, last update, invite status,
  open sections, timeline times.
- The two are matched by date plus couple names, since Vibo can spell names differently
  ("Jules and Nora" vs "Nora & Jules").
- A DJ only sees gigs where they're assigned in HoneyBook. Every event appears under
  the company's Vibo account, so Vibo can't tell whose gig is whose.

## Before launch

- [ ] **Sign-in.** The sign-in screen just picks a name right now. Replace it with real
      logins (e.g. Supabase Auth or Clerk) before any real data goes in.
- [ ] **API access.** Confirm API access with HoneyBook and with Vibo.
- [ ] **Backend.** Build the sync backend and a `liveSource` that implements `DataSource`.
- [ ] **Keep client money owner-only.** The backend must leave `billing` out of anything it sends a DJ. The app already hides it, but the browser shouldn't receive it at all.
- [ ] **Shared storage.** Store time-off requests and checklist ticks there. They're
      kept in the browser for now.
- [ ] **Pay.** Fill in pay rules and compute `djPayCents`.
- [ ] **Settings.** Fill in the empty links and phone numbers in `src/config.ts`.
- [ ] **Hosting.** Pick a host (Vercel, Netlify) and a domain.
