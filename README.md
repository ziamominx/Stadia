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
| Frontend | React 19 + Vite 6, Tailwind CSS 4, Leaflet (OSM, no API key), `qrcode` |
| Backend  | Node 20 + Express 4 (REST) |
| Database | SQLite via `better-sqlite3` (same schema ports to Postgres) |
| Notifications | WhatsApp Cloud API (mock fallback logs to the server console) |
| Auth     | Mock OTP + JWT endpoints (demo-grade only) |

Payments, hotel inventory and the Airtel partnership are **mocked stubs** returning realistic data.

## Quick start

```bash
npm install        # installs server + client workspaces
npm run dev        # starts API (:4000) + Vite dev server (:5173) together
```

Then open **http://localhost:5173**.

The database auto-seeds the first time the server starts (9 matches, 8 gates, 5 parking zones,
12 hotels, 4 shuttle zones × 3 slots per match, ~38k sample tickets, ~13k referral events).
To re-seed from scratch: `npm run seed`.

### Production build

```bash
npm run build      # builds client into client/dist
npm start          # Express serves API + built client on :4000
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
7. **WhatsApp** — every booking/completion triggers the WhatsApp sender; without env vars it
   prints a formatted message to the server console (also resendable from the ticket page).

## WhatsApp Cloud API (optional)

Set these env vars to send real messages via Meta's sandbox instead of the mock log:

```
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_ID=...
WHATSAPP_TO=<verified recipient number>
```

## Project layout

```
server/
  src/
    index.js            Express app (routes + static client serving)
    db.js               SQLite connection + schema (matches, gates, tickets, …)
    seed.js             Idempotent seed: demo data + ~38k sample tickets
    routes/             matches, hotels, bookings, notifications, dashboard,
                        tourism, referrals, auth
    lib/                assignment (gate/parking/shuttle logic), forecast
                        (arrival-curve prediction), whatsapp, ticket detail +
                        route geometry, load model, referrals
client/
  src/
    pages/              Landing, MatchDetail, Checkout, TravelInfo, Confirmation,
                        Tourism, Organizer, OrganizerGates, OrganizerShuttles
    components/         SeatMap (SVG), SeatPicker, RouteMap (Leaflet), QRCode, LoadBar
    api.js              fetch wrapper + useApi hook
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