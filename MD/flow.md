# STADIA — Complete Product Flow Assessment

> Written on branch `hc001` — 26 Sep 2026  
> This document captures the full product architecture, what currently exists in the codebase, what is missing, and the exact build sequence for the hackathon.

---

## Table of Contents

1. [The Core Product Idea](#1-the-core-product-idea)
2. [System Architecture](#2-system-architecture)
3. [Role Definitions](#3-role-definitions)
4. [The 14-Step Event Flow](#4-the-14-step-event-flow)
5. [The 90-Second Hackathon Demo](#5-the-90-second-hackathon-demo)
6. [Current Codebase Assessment — What Exists](#6-current-codebase-assessment--what-exists)
7. [Gap Analysis — What Is Missing](#7-gap-analysis--what-is-missing)
8. [What Should Be Cut or Demoted](#8-what-should-be-cut-or-demoted)
9. [Recommended Build Sequence](#9-recommended-build-sequence)
10. [Critical Design Decisions](#10-critical-design-decisions)

---

## 1. The Core Product Idea

Stadia is **not** a ticketing platform, a hospitality marketplace, or a generic analytics dashboard.

Stadia is a **shared live event state engine with three role-specific operational layers on top of it**.

The single most important sentence:

> **An action in one place changes what everyone else sees — immediately.**

The Executive Organizer triggers a crowd redirect. The Ground team receives a deployment task. The Transport team receives a route diversion. The crowd density drops. The incident closes. That full chain, visible in real time, is the product.

Everything in the UI exists to serve that chain. Nothing else matters.

---

## 2. System Architecture

```
                         STADIA
                           │
                ┌──────────┴──────────┐
                │                     │
        EXECUTIVE ORGANIZER       LIVE DATA ENGINE
        Full Control / Authority        │
                │                       │
        ┌───────┼────────┬──────────────┤
        ↓       ↓        ↓              ↓
      CROWD   GROUND   TRANSPORT    INCIDENTS
    INTEL     TEAM       TEAM
```

### Shared Live Event State

This is the backbone. Every role reads from and writes to the same state object.

```js
eventState = {
  event: { name, date, capacity, status },
  crowd: { inside, zones: { density, trend, status } },
  gates: [ { id, load, threshold, status, trend } ],
  parking: [ { id, occupancy, status } ],
  transport: { buses: [ { id, route, load, status } ] },
  personnel: {
    security:   { total, deployed, available },
    police:     { total, deployed, available },
    volunteers: { total, deployed, available },
    medical:    { total, deployed, available }
  },
  incidents: [ { id, zone, severity, status, timeline } ],
  tasks: {
    ground:     [ { id, type, zone, status } ],
    transport:  [ { id, type, route, status } ]
  }
}
```

Every simulation tick, every role action, every threshold breach mutates this state. All dashboards subscribe to it.

---

## 3. Role Definitions

### EXECUTIVE ORGANIZER

**Authority level:** Complete.

**Before the event (INPUT):**
- Event details: name, date, time, venue, expected attendance, max capacity
- Venue layout: gates, zones, entry/exit points, emergency zones, VIP/restricted zones
- Crowd thresholds: warning %, critical % per gate and zone
- Ground resources: security count, police count, staff count, volunteer count, medical count
- Initial deployment assignments per zone
- Transport: bus count, cab/taxi count, pickup zones, drop zones, routes, vehicle assignments
- Alert rules: what triggers an incident, at what thresholds

**During the event (MONITOR):**
- Live crowd count: inside, exiting, entering
- Zone density and trend velocity
- Gate throughput (people/hour)
- Personnel deployment status
- Active incidents
- Bus/transport locations and loads
- Parking occupancy
- System-generated alerts and recommendations

**During the event (ACT):**
- Deploy volunteers / security / police to a zone
- Redirect transport (buses, cabs) from one zone to another
- Open additional gates
- Broadcast announcements to fans
- Request police reinforcement
- Create custom tasks for ground or transport teams
- Apply or override AI-recommended actions
- Activate emergency mode

---

### GROUND TEAM

**Authority level:** Operational (zone-scoped).

**Flow:**
```
RECEIVE TASK → ACCEPT → NAVIGATE/DEPLOY → EXECUTE → UPDATE STATUS → COMPLETE
```

What they see:
- Assigned zones and their current crowd status
- Incoming tasks from Executive with priority and reason
- Current deployed personnel count in their zones
- Incident feed for their zones only

What they do NOT see:
- Full event configuration
- Transport network
- Revenue or analytics
- Other teams' zones

---

### TRANSPORT TEAM

**Authority level:** Operational (fleet-scoped).

**Flow:**
```
RECEIVE ROUTE/TASK → CONFIRM → DISPATCH VEHICLE → MOVE/DIVERT → UPDATE → COMPLETE
```

What they see:
- All active buses/cabs with current location, route, and passenger load
- Incoming route change instructions from Executive with reason
- Pickup zone queue levels
- Drop zone capacity

What they do NOT see:
- Ground team tasks
- Zone-level crowd density (only pickup queue levels)
- Event configuration

---

## 4. The 14-Step Event Flow

### Step 01 — Event Setup (Pre-Event)

Executive configures the event in 6 sub-steps:

1. **Event basics:** Name, date, time, venue, expected attendance, max capacity
2. **Venue layout:** Define gates (A–H), entry/exit points, zones (North/East/West/South), emergency zones, VIP zones, parking lots, pickup/drop zones
3. **Crowd rules:** Set warning and critical thresholds per gate and zone
   - Example: Gate B → Warning: 75%, Critical: 90%
4. **Ground resources:** Input total headcount per role: Security, Police, Staff, Volunteers, Medical. Assign initial deployment zones.
5. **Transport:** Input bus/cab counts. Define routes, pickup zones, drop zones, vehicle assignments.
6. **Launch:** `[ START EVENT ]` — pushes all configuration into the live shared state and activates all monitoring.

> **Hackathon note:** Pre-seed this. Walk into the demo with India vs Australia already configured. Event Setup should exist in the product but should not consume demo time. Skip straight to `0:20`.

---

### Step 02 — Command Center (Normal State)

Executive's home base during the event. They should almost never leave this screen.

Normal state appearance:
```
42,184 inside       78% occupancy
3 critical alerts   12 min avg entry
68% transport util

[ LIVE VENUE MAP — zones color-coded ]

North   62%   NORMAL
East    68%   NORMAL
West    71%   NORMAL
South   48%   NORMAL

All systems normal.
```

The map is the hero. Zones are colored:
- Green: below warning threshold
- Amber: between warning and critical
- Red: at or above critical threshold

Nothing screams for attention when things are normal. The screen breathes.

---

### Step 03 — Live Data Changes (Simulation)

The event is running. Data is flowing — simulated for the hackathon.

**Crowd data:**
- P3 shuttle zone: 800 people/min arriving
- West Gate: 4,820 people/hour entering
- Zone density ticking upward

**Ground data:**
- Security: 84/100 deployed
- Volunteers: 118/150 deployed

**Transport data:**
- Bus 14: P3 → Stadium, 74/80 passengers

**All of these write to the shared event state on every tick.**

The simulation engine needs a visible `[ SIMULATE INFLOW SPIKE ]` button — something the presenter can click during the demo to artificially push P3 and West Gate from normal to critical. Without a deliberate trigger, the demo cannot be controlled in a live setting.

---

### Step 04 — Detection

Stadia continuously evaluates the shared state against configured thresholds.

```
West Gate

Current density:    82%
Warning threshold:  75%     ← BREACHED (monitoring)
Critical threshold: 90%

Trend: +14% per 5 minutes
```

System calculates: at current trend rate, critical threshold will be crossed in ~8 minutes. No incident created yet — system is watching.

Then at the next tick:

```
Current density: 92%
Critical threshold: 90%     ← BREACHED
```

**Incident trigger fires.**

---

### Step 05 — Intelligence Layer

This is what separates Stadia from a simple threshold monitor.

The system does not just say `"92%"`. It investigates:

**Root cause analysis:**
- Where is the crowd coming from? → Shuttle Zone P3
- How many are approaching? → 3,200 attendees in transit from P3
- Contributing transport: Bus 11, 12, 14 all inbound to West Gate via P3

**Prediction:**
```
West Gate

Current density:  92%
Trend:            ↑ 14% / 5 min
Time to critical: ALREADY CRITICAL
Estimated peak:   97% in 4 min (if no action)
```

**Pre-action prediction:**
Before the Executive acts, show what will happen IF they take the recommended actions:
```
If you redirect P3 → P4 + deploy 6 volunteers:

Estimated outcome:  92% → ~81%
Time to stabilize:  ~6 min
Confidence:         84%
```

**Generated recommendations:**
1. Redirect incoming shuttles from P3 → P4
2. Deploy 6 volunteers to West Gate
3. Open South Gate as overflow

---

### Step 06 — Incident Creation

Threshold breach creates an incident in the shared state.

```
INCIDENT #048

Zone:      West Gate
Priority:  CRITICAL
Status:    DETECTED
Created:   18:42
```

The Executive does NOT need to navigate away from Command Center. The alert surfaces directly:

```
🔴 West Gate congestion
   Critical in 08:42
   [ View situation → ]
```

---

### Step 07 — Executive Decision

Executive clicks `View situation`. A panel opens (no page navigation) showing:

```
WEST GATE

Current density:  92%
Trend:            ↑ 14% / 5 min
Critical in:      08:42

CAUSE DETECTED
High inflow from Shuttle Zone P3
3,200 attendees approaching

PREDICTED OUTCOME (if you act now)
92% → ~81% in ~6 min   [84% confidence]

RECOMMENDED RESPONSE
1. Redirect P3 → P4 buses
2. Deploy 6 volunteers → West Gate
3. Open South Gate

[ APPLY RECOMMENDED ACTIONS ]

or choose manually:
[ Deploy Personnel ]  [ Redirect Transport ]
[ Open Gate ]  [ Broadcast ]  [ Request Police ]
[ Custom Task ]
```

**Stadia recommends. Executive decides.** The system is never fully autonomous. There is always a human confirmation step before actions are dispatched.

---

### Step 08 — Action Dispatch

Executive clicks `Apply Recommended Actions`, then:

```
ACTIONS TO DISPATCH

Ground:     Deploy 6 volunteers → West Gate
Transport:  Divert Bus 11, 12, 14 → P4 route

[ CONFIRM AND DISPATCH ]
```

One button. Both actions fire simultaneously into the shared state. Both relevant team dashboards update immediately.

---

### Step 09 — Ground Team Receives Task

Ground team dashboard immediately shows:

```
⚡ NEW TASK — HIGH PRIORITY

Zone:     West Gate
Task:     Deploy 6 volunteers
Reason:   Critical crowd density (92%)
From:     Executive Organizer
Time:     18:44

[ ACCEPT ]   [ FLAG ISSUE ]
```

Ground accepts. Status in shared state changes:
```
PENDING → ACCEPTED → IN PROGRESS → COMPLETED
```

Executive sees this status update in real time on their Command Center without navigating anywhere.

---

### Step 10 — Transport Team Receives Task

Transport team dashboard simultaneously shows:

```
⚡ ROUTE CHANGE — HIGH PRIORITY

Bus 11, 12, 14
Old route: P3 → Stadium (West Gate)
New route: P4 → Stadium (South Gate)
Reason:    Reduce West Gate inflow
From:      Executive Organizer
Time:      18:44

[ CONFIRM ROUTE CHANGE ]   [ FLAG ISSUE ]
```

Transport confirms. Buses update to:
```
Bus 14   P4 → Stadium   ● DIVERTED
Bus 11   P4 → Stadium   ● DIVERTED
Bus 12   P4 → Stadium   ● DIVERTED
```

This change also reduces the P3 queue count in the shared state.

---

### Step 11 — Crowd State Changes

The simulation picks up the diversion and deployment. Shared state updates:

**Before:**
```
P3 queue:    1,240 waiting
West Gate:   92%
```

**After (6 min simulation):**
```
P3 queue:    840 waiting   ↓ 400
West Gate:   84%           ↓ 8%
```

The map on the Command Center reflects this immediately. West Gate color shifts from red → amber.

---

### Step 12 — Stadia Verifies the Result

The system does not immediately resolve the incident when density drops. It monitors.

```
West Gate

Density:     84%
Trend:       ↓ 8% (improving)
Prediction:  No longer approaching critical
Status:      STABILIZING
```

Incident status:
```
DETECTED → RESPONDING → STABILIZING → (monitoring...)
```

The system waits for the density to hold below the warning threshold for a configurable window (3 minutes) before resolving. This prevents false resolutions.

---

### Step 13 — Incident Resolution

After the zone holds below threshold:

```
INCIDENT #048

Zone:       West Gate Congestion
Priority:   CRITICAL

Timeline:
18:42  Detected       — Density reached 92%
18:44  Responding     — Executive dispatched actions
18:44  Tasks accepted — Ground + Transport confirmed
18:50  Stabilizing    — Density fell to 84%
18:53  Resolved       — Held below threshold for 3 min

Status: RESOLVED ✓
```

Executive sees on Command Center:
```
✓ West Gate stabilized — Incident #048 resolved
```

---

### Step 14 — Analytics / Post-Event

```
INCIDENT #048 — SUMMARY

Peak density:       92%
Duration:           11 min
Detection lag:      < 1 min
Response time:      2 min
Resolution time:    9 min from detection

Ground response:    6 volunteers deployed to West Gate
Transport response: 3 buses diverted from P3 → P4

Outcome:
  Density reduced from 92% → 81%
  Incident resolved without escalation
  No crowd safety event occurred
```

---

## 5. The 90-Second Hackathon Demo

This is the single sequence to rehearse. Every implementation decision should serve this.

| Time | What happens | Who acts |
| :--- | :--- | :--- |
| 0:00 | Pre-seeded: India vs Australia, 54,000 cap, Gate B threshold 90%, 25 buses | pre-configured |
| 0:20 | Command Center loads — 42,184 inside, 78%, everything green | Presenter shows calm state |
| 0:35 | Click `SIMULATE INFLOW SPIKE` — West Gate: 82% → 87% → 92% | Presenter |
| 0:45 | Red alert: `West Gate — Critical in 08:42` | System |
| 0:50 | Executive clicks `View situation` — cause + prediction shown | Executive view |
| 0:55 | Clicks `Apply Recommended Actions` → confirms dispatch | Executive acts |
| 1:00 | Ground view: `Deploy 6 volunteers → West Gate — [ACCEPT]` | Switch to Ground view |
| 1:05 | Ground accepts. Transport view shows bus diversion — Confirm. | Switch to Transport view |
| 1:10 | Command Center: West Gate ticking down 92% → 87% → 84% | System |
| 1:20 | Map shifts red → amber. `West Gate stabilizing` | System |
| 1:25 | Incident #048 → RESOLVED | System |
| 1:30 | Analytics: 92% peak → 81%, 9 min resolution, 3 buses diverted | Presenter |

**Total: ~90 seconds. One closed loop. Zero feature tourism.**

---

## 6. Current Codebase Assessment — What Exists

### Fully Built

| Feature | Location |
| :--- | :--- |
| Event Timeline (7-stage: Detected → Resolved) | `components/EventTimeline.jsx` |
| Explainable Recommendation (root cause, confidence, before/after) | `components/ExplainableRecommendation.jsx` |
| SVG Stadium Schematic (Gates A–H, local/outstation corridors) | `components/StadiumLayout.jsx` |
| Gate forecast sparklines with 90% redline | `app/organizer/gates/page.jsx` |
| Leaflet Gate Map with approach polylines, mixing-point flags | `app/organizer/gates/page.jsx` |
| Crowd flow simulation slider (T-3h to kickoff) | `app/organizer/gates/page.jsx` |
| Ingress/Egress mode toggle + staggered wave departure | `app/organizer/gates/page.jsx` |
| Transit route live status table | `app/command-center/page.jsx` |
| One-click tactical dispatches (shuttle, broadcast, hotel overflow) | `app/command-center/page.jsx` |
| Gate/Parking/Shuttle data models | `lib/stadiaData.js`, `lib/stadiaStore.js` |
| API routes for gates, parking, shuttles, dashboard, ecosystem | `app/api/` |
| Mobility Hub (Shuttle + Parking + Transit corridors) | `app/organizer/shuttles/page.jsx` |
| Scenario Stress Simulator (demand spike, rain delay, transit outage) | `app/simulator/page.jsx` |
| KPI bento grid (hotel occupancy, transit load, gate pressure, health) | `app/command-center/page.jsx` |
| Bottleneck prediction feed (zones ≥85%, transit ≥80%) | `app/command-center/page.jsx` |

---

### Partially Built

| Feature | What Exists | What's Missing |
| :--- | :--- | :--- |
| **Live Event Overview** | Capacity %, tickets sold, parking utilization, health score | Tripartite tracker (Expected/Inside/Exited), inflow/outflow velocity, global NORMAL/ATTENTION/CRITICAL posture badge |
| **Crowd Intelligence** | 15-min sparklines, root-cause text strings | Dynamic throughput rates (X people/hour), real-time trend deltas (↑14%/5min), time-to-critical countdown |
| **Alerts & Actions** | Alert banners, root cause, confidence score, one-click dispatch | Standardized 4-button console, pre-action outcome prediction |
| **Geospatial Hero Map** | Leaflet map in gates page, SVG schematic on home | Single unified map where clicking a zone opens live metrics + action drawer |
| **Operations Panel** | Gates, Parking, Shuttles with live status | Security, police, staff, volunteer, medical unit readiness |

---

### Not Built

| Feature | Why It's Needed | Priority |
| :--- | :--- | :--- |
| **Shared Live Event State (reactive)** | The backbone — all roles read from and write to the same object | P0 |
| **Simulation Inflow Spike Trigger** | Presenter needs a visible button to spike P3 during demo | P0 |
| **Incident Creation Engine** | Threshold breach → auto-creates incident with ID, severity, timeline | P0 |
| **Time-to-Critical Countdown** | `Critical in 08:42` — live countdown on alert | P0 |
| **Executive Decision Panel** | Cause + prediction + pre-action outcome + Apply/Manual choice | P0 |
| **Ground Team Task Dispatch & Status** | PENDING → ACCEPTED → IN PROGRESS → COMPLETED feedback loop | P0 |
| **Transport Team Task Dispatch & Status** | Bus route change confirmation in shared state | P0 |
| **Incident Verification (Stabilizing state)** | System checks if action worked before resolving | P1 |
| **Pre-Action Outcome Prediction** | "If you act now: 92% → ~81% in ~6 min, 84% confidence" | P1 |
| **CONTROL Panel** | Editable thresholds, staff targets, Emergency Mode toggle | P1 |
| **Ground Team Dashboard** | Role-scoped view with task feed and zone status | P1 |
| **Transport Team Dashboard** | Fleet view with route changes and bus status | P1 |
| **Event Setup Flow** | 6-step configuration before event starts | P2 |
| **Post-Event Analytics per Incident** | Peak density, response time, outcome summary per incident | P2 |

---

## 7. Gap Analysis — What Is Missing

### Critical Gap 1: Task Dispatch Loop

The demo chain **breaks** at Step 09 without a real task dispatch mechanism. Right now, when the Executive takes an action in `command-center`, it calls `api.applyIntervention()` which fires and is forgotten. There is no:
- Task object created in shared state
- Ground team receiving the task
- Status flowing back to the Executive

This single gap is the difference between a demo that shows a system and a demo that shows a disconnected UI.

**Fix:** Create a `tasks` array in the shared live state. When Executive dispatches, write to `tasks`. Ground and Transport dashboards read from `tasks` and render them. Status updates write back to the same task object.

---

### Critical Gap 2: The Simulation Trigger

Without a visible, controllable inflow spike trigger, the demo is unpredictable.

**Fix:** Add a prominent `SIMULATE CRISIS: P3 INFLOW SPIKE` button on the Command Center — visually styled as a "demo mode" control. When clicked, it pushes crowd data past the West Gate threshold and starts the chain.

---

### Critical Gap 3: Intelligence Is Text, Not Data

`ExplainableRecommendation.jsx` has excellent copy but it is **hardcoded**. For the system to feel real, these numbers must be computed from live state — actual crowd figures, actual trend rates, actual time-to-critical calculations.

**Fix:** Wire the intelligence component to read from live gate/crowd state and compute `currentLoad`, `trend`, `timeToCritical` dynamically.

---

## 8. What Should Be Cut or Demoted

For `hc001`, demote or remove these from primary navigation:

| Feature | Current Location | Action |
| :--- | :--- | :--- |
| Ticket booking & checkout | `app/checkout`, `app/matches` | Demote — keep one match link for fan view only |
| Hotel hospitality marketplace | `app/hospitality`, `app/hospitality-hub` | Cut from primary nav |
| Tourism tab | `app/tourism` | Cut from primary nav |
| Airtel TV referral revenue | `app/organizer/page.jsx` | Remove from Command Center |
| Hotel commission affiliate tracking | `app/organizer/page.jsx` | Remove from Command Center |
| Event creation/publishing wizard | `app/organizer/events` | Demote to Event Setup only |
| Journey planner | `app/journey-planner` | Keep as fan-mode only |
| Scattered navigation (5 separate organizer sub-pages) | Navbar | Consolidate into Command Center tabs |

The navbar should show:
```
Command Center | Ground Team | Transport Team | [Fan View]
```

---

## 9. Recommended Build Sequence

### Phase 1 — Shared Live State + Simulation Engine `P0`

- Centralized reactive state in `lib/stadiaStore.js`
- Add: `incidents`, `tasks`, `crowdTrend`, `timeToCritical` to state
- Add simulation tick function: updates crowd data every N seconds
- Add `simulateInflowSpike(zone)` — callable from UI
- Add threshold evaluation: auto-creates incidents on breach

**Why first:** Everything else reads from this.

---

### Phase 2 — Command Center: LIVE Layer `P0`

- Tripartite attendee tracker: Expected / Inside / Exited
- Global event posture badge: NORMAL | ATTENTION | CRITICAL
- Zone density cards with color coding and trend arrows
- Alert rail: persistent right column showing active incidents
- Live unified Leaflet map with zone overlays, gate pins, parking markers
- `[ SIMULATE INFLOW SPIKE ]` button in demo mode

**Why second:** This is the anchor screen.

---

### Phase 3 — Incident Engine + Executive Decision Panel `P0`

- Incident auto-creation when threshold breached
- `Critical in 08:42` countdown computed from trend rate
- Incident card on alert rail with `View situation →`
- Decision panel: cause, prediction, pre-action outcome estimate, Apply/Manual buttons
- Action dispatch: writes tasks to shared state

**Why third:** This is the core demo moment.

---

### Phase 4 — Ground Team Dashboard + Task Status `P1`

- Ground view: assigned zones + crowd status (zone-scoped)
- Task feed: new tasks appear in real time
- `[ ACCEPT ] [ FLAG ISSUE ]` on each task
- Status updates: PENDING → ACCEPTED → IN PROGRESS → COMPLETED
- Executive sees status reflected in Command Center

**Why fourth:** Closes the first half of the demo loop.

---

### Phase 5 — Transport Team Dashboard + Route Status `P1`

- Transport view: all buses with route, load, status
- Route change task feed: diverted routes appear in real time
- `[ CONFIRM ROUTE CHANGE ] [ FLAG ISSUE ]`
- Bus status: ACTIVE → DIVERTED → REROUTED
- Pickup zone queue levels

**Why fifth:** Closes the second half of the demo loop.

---

### Phase 6 — Intelligence Layer (Dynamic) `P1`

- Wire `ExplainableRecommendation` to live state (remove hardcoded strings)
- Compute trend rate from last N ticks of crowd data
- Compute `timeToCritical` from trend rate and gap to threshold
- Compute cause: which zones/transport routes are contributing inflow
- Compute pre-action outcome estimate
- Confidence scoring based on trend stability

**Why sixth:** The UI already exists. Phase 6 makes it real.

---

### Phase 7 — CONTROL Panel `P1`

- Editable crowd thresholds per gate/zone
- Personnel targets: Security, Volunteer count inputs
- Transport: active bus count, reserve count
- Emergency Mode toggle: `[ ACTIVATE EVENT EMERGENCY ]`
- Changes propagate immediately to shared state

**Why seventh:** Makes the system feel configurable and live.

---

### Phase 8 — Event Setup + Analytics `P2`

- Event Setup: 6-step configuration flow
- Post-event/per-incident analytics: peak density, response time, outcome
- Incident history with full timeline

**Why last:** Important for the complete product story but not on the critical path.

---

## 10. Critical Design Decisions

### Navigation

Top-level:
```
[ COMMAND CENTER ]  [ GROUND TEAM ]  [ TRANSPORT TEAM ]  [ ANALYTICS ]
```

Within Command Center, 4-tab inner nav (map always stays visible):
```
[ LIVE ]  [ INTELLIGENCE ]  [ OPERATIONS ]  [ CONTROL ]
```

Alerts always pull the user toward LIVE regardless of current tab.

---

### Map Always Visible

The venue map should occupy at minimum 50% of the Command Center screen at all times. Decision panels, task details, and intelligence breakdowns should open as **side drawers** — never as full-page navigations that hide the map.

---

### Role Switching in the Demo

Use a **role switcher** in the top-right corner:
```
[ EXECUTIVE ]  [ GROUND TEAM ]  [ TRANSPORT ]
```

This allows the presenter to switch roles in a single browser window without separate logins. The UI completely transforms based on the selected role, but reads from the same shared state.

---

### The Simulation Spike Button

Style it clearly as a demo tool:
```
🧪 DEMO MODE
[ ▶ Simulate Inflow Spike — P3 ]
```

Honest and professional. Everyone knows it's a demo.

---

### Incident Resolution Threshold

Do not resolve an incident the moment density drops below critical. Require:
- Density below **warning threshold** (not just critical)
- Held for at least **3 minutes** (3 simulation ticks)

This makes the system feel trustworthy, not trigger-happy.

---

### Pre-Action Outcome Prediction

Always show this before the Executive confirms an action:

```
If you apply recommended actions:
West Gate: 92% → ~81% (est.)
Time to stabilize: ~6 min
Confidence: 84%
```

When the system predicts `~81%` and the crowd settles at `84%`, that's close enough to feel real. This is the single most powerful moment in the demo.

---

*End of document. Branch: `hc001`. Last updated: 26 Sep 2026.*
