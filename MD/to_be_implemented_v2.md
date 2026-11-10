# STADIA — Product Roadmap & v2 Implementation Specification

> **Document Type:** Master Implementation Specification & Gap Assessment (v2)  
> **Target Branch:** `landing-page`  
> **Status:** Active Reference

---

## 1. Executive Operations Platform — Current Status & Gaps

### What Is Fully Built & Operational (v1)
The core reactive operations platform is complete and functional under `app/(operations)` driven by `lib/operations/engine.mjs`:

1. **Command Center (`/command-center`)**: Full-width stadium schematic hero, floating situation response overlay, single-line stat bar, live inflow spike simulator (`SIMULATE INFLOW SPIKE`).
2. **Ground Operations (`/ground`)**: Inverted task-first layout (`Accept` → `Start Deployment` → `Complete`), force readiness meters, and spatial deployment map.
3. **Transport Operations (`/transport`)**: Inverted route diversion dispatch (`Confirm Diversion` → `Complete`), transit hub capacity gauges, and parking inventory grid.
4. **Incidents Console (`/incidents`)**: Multi-incident coordination, manual incident reporting, filterable status tabs, and complete audit trail.
5. **Event Control (`/event-control`)**: Parameter configuration, threshold tuning, and emergency route verification.
6. **Analytics Console (`/analytics`)**: Session metrics, response time measurements, resolution time, and completed task tallies.
7. **Crowd Intelligence (`/crowd`)**: Concourse occupancy, queue wait times, and gate throughput rates.
8. **Fan Experience (`/fan`)**: Consumer portal showing gate directions, match info, and live PA announcements.

---

### Operations Suite Remaining Roadmap (v2)

#### Priority A: Pre-Event Setup Wizard (`/setup` or Modal)
- **Goal**: Enable an event organizer to configure a fresh event before kickoff.
- **6 Steps**:
  1. *Event Core*: Name, date, time, venue, expected attendance, max capacity.
  2. *Gate Architecture*: Capacity per gate (A–H), threshold settings (warning % and critical %).
  3. *Staffing Deployment*: Security, police, staff, volunteer, and medical headcounts.
  4. *Transport & Transit Corridors*: Bus fleet count, pickup/drop staging hubs, route mapping.
  5. *Alert Rules*: Custom thresholds, automated recommendation weights.
  6. *Go Live*: Commit configuration into shared state and transition into Command Center.

#### Priority B: Incident #048 Post-Mortem Debrief Generator
- **Goal**: High-stakes executive summary for post-event review.
- **Components**:
  - Peak density recorded (e.g. 92% at West Gate).
  - Detection lag (< 1 min) and dispatch response duration (2 min).
  - Exact audit trail timestamps (Detected → Dispatched → Accepted → Stabilized → Resolved).
  - Tactical breakdown: Volunteers deployed + Shuttles diverted (P3 → P4).
  - Downloadable/printable PDF-ready modal in `/analytics`.

#### Priority C: Operations Visual Alignment
- Bring `/crowd`, `/incidents`, and `/analytics` into full aesthetic alignment with `/command-center`:
  - Replace legacy 4-card metric blocks with streamlined tabular stat bars.
  - Apply razor-sharp border illumination and subtle card elevation.

---

## 2. Cinematic 3D Landing Page — Master Specification

Per `MD/STADIA_Landing_Page_Antigravity_Prompt.md`, the landing page (`/`) is rebuilt as an architectural 3D product experience.

### Core Creative Concept
> **"STADIA manages the entire journey that creates the crowd, not just the crowd inside."**

The hero is a single, continuous, scroll-driven 3D camera journey:
```text
STADIUM → SEAT → TICKET → CAR → HOTEL
```

### Visual Direction
- **Background**: Deep black (`#000000`).
- **Materials**: Ultra-fine luminous white wireframes (`#ffffff`), subtle cool-white glow.
- **Composition**: Heavy negative space, architectural visualization, minimalist editorial typography.
- **Prohibited**: Purple, blue, gold, red, rainbow gradients, cyberpunk gimmicks, generic SaaS floating cards.

### The 8-Phase Scroll Timeline
1. **0–15% — Stadium Exterior**: Elevated architectural overview of Narendra Modi / Wankhede stadium wireframe.
2. **15–25% — Stadium Yaw Rotation**: Stadium rotates 20–30° on its vertical axis while camera stays level (no camera roll/flip).
3. **25–40% — Camera Entry**: Camera glides smoothly forward through the trusses into the seating bowl.
4. **40–52% — Seat Focus**: Camera isolates a single upright seat; surrounding geometry dims while selected seat illuminates.
5. **52–65% — Seat → Ticket Unfolding**: Seat wireframe lines physically reorganize and unfold into a 3D event ticket (*India vs Australia, West Gate A12, Row 18, Seat 24*).
6. **65–75% — Ticket → Mobility**: Camera pushes past the ticket; a futuristic wireframe vehicle emerges on a minimalist curved road.
7. **75–90% — Car Journey**: Camera tracks the vehicle traveling smoothly along the road.
8. **90–100% — Hotel Arrival**: Vehicle settles in front of a modern wireframe hotel pavilion.

### Supporting Editorial Sections
1. **The Problem**: *"Mega events don't fail in one place. Congestion emerges when journeys collide."*
2. **The Insight**: *"Manage the journey. And you manage the crowd."*
3. **One Shared State**: Architectural breakdown of Organizer, Ground, Transport, Venue, and Hospitality.
4. **Platform Previews**: Subtle product snapshots of Command Center, Ground, Transport, Incidents.
5. **Final CTA**: *"Every event has a journey. STADIA orchestrates it."* → `[ ENTER PLATFORM ]` (routes to `/command-center`).

---

## 3. Implementation Phasing

| Phase | Milestone | Scope |
| :--- | :--- | :--- |
| **Phase 1** | **Foundation & Setup** | Install `three`, create `components/landing`, configure `landing.css`, update `app/page.jsx`. |
| **Phase 2** | **3D Viewport & Wireframe Stadium** | WebGL canvas with procedural stadium bowl, roof trusses, and pitch. |
| **Phase 3** | **Continuous Camera Scroll** | Deterministic virtual scroll timeline ($0.0 \to 1.0$), stadium yaw rotation, and level camera glide. |
| **Phase 4** | **Seat & Ticket Choreography** | Seat approach, geometric unfolding into 3D match ticket. |
| **Phase 5** | **Mobility & Hotel Arrival** | Wireframe car tracking, road emergence, hotel arrival sequence. |
| **Phase 6** | **Supporting Editorial Sections** | Problem, Insight, Shared State diagram, Platform previews, and navigation. |
| **Phase 7** | **Final Quality & Mobile Pass** | Reduced motion handling, touch optimization, 60fps performance validation. |
