# STADIA — Landing and Event Command Platform (`landing-page`)

## Landing branch operations access

The landing branch uses a dark operations theme and role-checked access. Create `.env.local` from [`.env.example`](.env.example) and set a random 32+ character session secret and distinct passwords for the executive, ground, transport, and hospitality accounts. Then run `npm run dev` or `npm run build && npm start`. Open `/login`; accounts have eight-hour HTTP-only signed sessions. Executive can open every operations console. Team accounts are restricted to their own page and permitted commands, including direct API calls.

`/setup` commits event name, venue coordinates, capacity, expected attendance, staffing, gate processing capacity, fleet size, and warning thresholds into the shared operations state. The new map toggle uses live OpenStreetMap/CARTO tiles. Gate pins are approximate and occupancy remains simulated. Hotel inventory is a seeded reference dataset. There is no connected turnstile, GPS, hotel, payment, or public-address provider, so those functions must not be presented as live field data. The operations state remains in server memory and does not persist across restarts or reliably synchronize across multiple server instances.

The six landing consoles are accessible from the post-flight platform section. A user can expand the journey and system cards with mouse, touch, or keyboard. Motion respects reduced-motion preferences.

The public 3D landing journey opens at `/`. The operations experience opens at `/command-center` after role sign-in. It implements the six supplied UI references in Next.js, with a connected crowd-response simulation, fire/medical tasks, parking controls, and outcome analytics.

```sh
npm ci
npm test
npm run build
npm start
```

Read [hc002 implementation and demo guide](MD/HC002_IMPLEMENTATION.md) for the original operations walkthrough and simulation boundaries. The fan experience is available at `/fan`; the earlier project documentation follows below.

---

# ⚽ FIFA Women's World Cup India 2026 — Hospitality & Crowd Orchestration Platform

Built to serve as the single official ticketing channel for the FIFA Women's World Cup India
(hosted at DY Patil Stadium, Nerul, Navi Mumbai) — doubling as a **crowd & capacity
orchestration system**. (Why "single channel" is the right model — see below.)

Two experiences in one app:

- **Visitor app** — seat selection → digital ticket (QR) → personalised arrival/exit routing.
  Local fans get parking zones + North/West gates; outstation/international fans get a partner
  hotel + shuttle slot + East/South gates, so the two crowds never mix.
- **Organizer dashboard** — live gate / parking / shuttle load with "approaching capacity" flags,
  a Leaflet gate map, and hotel + Airtel TV referral revenue tracking.

## Why a single ticketing channel?

Mega-events run on a single official ticketing partner — the way BookMyShow or Paytm Insider
hold exclusive rights for specific large events in India. FanFlow is architected to be that
single system of record for this tournament: every ticket, and therefore every visitor's
location and travel data, flows through one platform. That centralisation is what makes
real-time crowd orchestration possible — split ticket sources across multiple vendors and the
crowd model breaks down. The platform is designed to serve that role for an organiser who has
(or is negotiating) the exclusive ticketing mandate; it does not assume the mandate already
exists.

## Tech stack

| Layer    | Tech |
| -------- | ---- |
| Fullstack Platform | Next.js 15 (App Router), React 19, Tailwind CSS 4, Leaflet (OSM), `qrcode` |
| Backend & APIs | Native Next.js Route Handlers (`app/api/*`) |
| State & Domain Mesh | In-Memory Master Domain Registry (`lib/eventsData.js` & `lib/stadiaStore.js`) |
| Geospatial / Routing | Leaflet OpenStreetMap layers, Haversine route assignment, perimeter buffers |
| Notifications | Local WhatsApp message preview; no provider connected |

Payments, hotel inventory and partner referrals are mock stubs returning realistic mega-event data.

## Quick start

```bash
npm install        # installs platform dependencies
npm run dev        # starts Next.js App Router dev server on :3000
```

Then open **http://localhost:3000**.

All venue presets (DY Patil Stadium, Wankhede Stadium, MCA Pune), entry gates, shuttle corridors, and simulation scenarios initialize automatically in memory with zero database setup required.

### Production build

```bash
npm run build      # compiles Next.js App Router production bundle
npm start          # starts Next.js production server on :3000
```

## Demo script (5 minutes)

1. **Landing** (`/`) — tournament hero, local vs outstation explainer, match timeline.
2. **Book a ticket** — open *India vs Australia* → click a block on the SVG seat map → pick a
   seat in the live grid → checkout (any card details work) → ticket ID generated
   (`FWC-<matchId>-<block>-<6 chars>`).
3. **Local flow** — "I'm local" → *personal vehicle* → ticket shows parking zone (P1–P5), a
   **different entry and exit gate** on the North/West side, walking route on the map, and the
   Airtel TV offer. The tourism panel appears because the next match is ≥ 2 days away.
4. **Outstation flow** — book *Brazil vs Japan* → "travelling from elsewhere" → pick a partner
   hotel → ticket shows hotel, **shuttle zone + departure slot (T-2h)** and East/South gates,
   with the hotel → shuttle → gate → seat route on the map. The 10% hotel offer is unique to
   this flow.
5. **Organizer** (`/organizer`) — gates flagged ⚠ "approaching capacity" (≥ 80% predicted
   load), parking loads, shuttle corridor fill by slot, and revenue totals. `/organizer/gates`
   shows the Leaflet gate map with a **crowd-flow simulation**: slide the arrival time from
   T-3h to kickoff and watch local (sky) vs outstation (rose) approach paths swell as the
   arrival curve builds, plus ⚠ **mixing-point flags** where the two crowds' paths come within
   220 m of each other (e.g. the north-east corner: parking/rail approach vs the East Gate C
   shuttle corridor). Below the map, the **arrival forecast** section shows each gate's
   predicted load curve (tickets × arrival curve, 15-min slots) with the predicted peak and a
   red flag for peaks > 90%.
6. **Routing decision proof** — book a west-side seat as a local driver and the ticket shows
   the load-aware assignment in action, e.g. *"P3 was 88% full — reassigned to P4 (60%)"*,
   also logged to the server console.
7. **WhatsApp preview** — the ticket page generates a message preview. It does not send a message.

## WhatsApp delivery

The current routes are preview-only. Connecting a verified WhatsApp Business account and delivery API is future integration work.

## Project layout

```
app/                    Next.js 15 App Router pages & route handlers
  page.jsx              Landing, hero, ingress safety telemetry, corridor visualizer
  matches/              Match fixtures catalog with filter chips
  match/[id]/           Interactive SVG stadium seat map & block selector
  checkout/             Reservation & checkout funnel
  ticket/[ticketId]/    Travel questionnaire & digital matchday pass confirmation
  journey-planner/      Trip companion wizard & early arrival incentives
  hospitality-hub/      Hospitality & dining zone saturation & overflow dispersal
  simulator/            Stress scenario simulator & AI mitigation actions
  command-center/       Leaflet tactical command map with multi-layer overlays
  organizer/            Organizer console (gates, shuttles, KPIs)
  tourism/              Host city fan discovery & partner experiences
  api/                  Next.js backend API routes (routes, tickets, events, hotels)
components/             Shared UI components (Navbar, Footer, SeatMap, RouteMap, etc.)
lib/                    Master domain mesh (eventsData.js), store (stadiaStore.js), formatters
docs/                   Interactive architecture diagrams & platform briefs
```

## Key model decisions

- **Gate split**: gates A/B/G/H (North/West) are the local flow; C/D/E/F (East/South) are the
  outstation flow — stored on `gates.side` and kept physically separate in assignment + routing.
- **Assignment** (`lib/assignment.js`): `assignRoute()` is the explicit route engine — nearest
  gate by Haversine on the visitor's side, then the nearest parking zone *with spare capacity*
  (zones > 85% full are skipped for the next-nearest; the fallthrough is logged and stored on
  the ticket as `routing_decision`). Outstation visitors get the shuttle zone nearest their
  hotel, the least-loaded (T-2h preferred) departure slot, and gates on the shuttle side.
- **Predicted load** (`lib/load.js`): `tickets_assigned / capacity` plus a small deterministic
  arrival-wave factor; ≥ 80% flags "approaching capacity", ≥ 95% is "critical".
- **Forecasting** (`lib/forecast.js`): `predicted_load(gate, t) = tickets × arrival_curve(t)`
  over 15-min slots from T-3h to kickoff (10% arrive > 2h early, ~50% in the 90-30 min
  window, ~30% in the last half hour). `GET /api/dashboard/gates/forecast-summary` returns
  each gate's predicted peak + time, flagged when the peak > 90%.
- **Crowd-flow simulation** (`path_segments` + `GET /api/dashboard/flow`): reference lat/lng
  polylines for every approach path — local (parking zone → North/West gate, station → gate)
  and outstation (shuttle drop → East/South gate) — animated with the arrival curve at a
  simulated time. Pairs that approach within 220 m are flagged as potential mixing points.
- **Revenue**: hotel referrals pay the partner commission on a mock 2-night stay; Airtel TV is a
  flat ₹149/signup — both tracked per ticket ID (`referral_events`, unique per ticket + type).
- **Tourism**: shown on the ticket page whenever the gap to the visitor's next match is ≥ 2 days.

## Out of scope (by design)

Real payments, real hotel/Airtel APIs, live traffic data, per-user vehicle routing, real SMS/OTP,
production auth hardening.
