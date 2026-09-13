# STADIA NEXUS — ANTIGRAVITY PRODUCT DIRECTION UPDATE

## Purpose

Refine the existing Stadia Nexus MVP so that it is clearly perceived as an **intelligent crowd orchestration platform**, not a ticketing platform with crowd-management features.

This document is a product/UI direction for Antigravity.

---

# 1. CORE PRODUCT PRINCIPLE

The central product is **not ticket booking**.

The central product is:

> **Understand the event state → predict congestion → recommend an intervention → execute it → measure the outcome.**

Ticketing remains important, but the ticket is primarily an **input into the orchestration system**, not the destination of the user journey.

### The key distinction

Avoid building:

```text
Book Ticket
    ↓
Select Seat
    ↓
Pay
    ↓
QR Code
    ↓
Other Features
```

Build toward:

```text
TICKET / EVENT
      ↓
UNDERSTAND MY ARRIVAL
      ↓
COORDINATE MY JOURNEY
      ↓
LIVE CROWD CONDITIONS
      ↓
ADAPT MY ROUTE
      ↓
MANAGE MY EXIT
```

The ticket can still be the entry point, but it must not dominate the product.

---

# 2. JUDGE TEST

Design the MVP so that a judge can understand the difference immediately.

### Bad interpretation

If the first experience is:

> Book ticket → choose seat → checkout → QR → parking/travel/crowd features

a judge is likely to think:

> **"This is a ticketing platform with some AI/crowd-management features."**

### Desired interpretation

The experience should communicate:

> **"This system understands the entire event state, predicts where congestion will occur, recommends interventions to operators, and dynamically changes attendee journeys."**

The judge should leave thinking:

> **"This is a crowd orchestration platform."**

This distinction is more important than adding more pages or features.

---

# 3. THE ACTUAL PRODUCT LOOP

The organizer/operations loop is the HERO of the MVP.

```text
                    EVENT STATE
                         ↓
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      STADIUM OPS     MOBILITY        FAN
                         OPS           APP
          ↓              ↓              ↓
          └──────── SHARED STATE ───────┘
                         ↓
                    AI ENGINE
                         ↓
                  PREDICTION + RISK
                         ↓
                  RECOMMENDATION
                         ↓
                 HUMAN APPROVAL
                         ↓
                    INTERVENTION
                         ↓
                    EVENT FEEDBACK
                         ↓
                    UPDATED STATE
```

The system should demonstrate a real closed-loop decision cycle.

---

# 4. IDEAL DEMO SCENARIO

The MVP should be capable of demonstrating a scenario such as:

### Step 1 — Detection

```text
Parking P3
Occupancy: 82%
Status: Rising
```

### Step 2 — Prediction

```text
Gate 4
Current load: 78%

Predicted load:
96% in 11 minutes
```

### Step 3 — Root cause

```text
Cause:
1,800 attendees assigned to P3
are approaching Gate 4.
```

### Step 4 — AI recommendation

```text
RECOMMENDED ACTION

Redirect 900 attendees
from Gate 4 → Gate 6

Expected impact:
Gate 4 load: 96% → 71%
Average wait: -7 min

Confidence: 91%
```

### Step 5 — Human approval

```text
[ Approve Diversion ]
[ View Alternatives ]
```

Do not make AI silently execute important operational decisions in the MVP.

### Step 6 — Intervention

After approval:

- Fan routes update
- Parking guidance updates
- Gate guidance updates
- Mobility operators receive the change
- Stadium operations sees the intervention
- Event state updates

### Step 7 — Outcome

```text
INTERVENTION RESULT

Gate 4:
96% → 73%

Average wait:
14 min → 7 min

Congestion risk:
HIGH → MODERATE
```

This before/after feedback is extremely important.

---

# 5. SHARED EVENT STATE

All personas must read from the **same underlying event state**.

Do NOT create separate fake datasets for each persona.

The shared event state should conceptually contain:

- Event
- Tickets
- Attendance
- Seating/sections
- Gates
- Parking
- Transport
- Shuttle fleet
- Hotels/accommodation where applicable
- Venue capacity
- Current occupancy
- Crowd flow
- Locations
- Incidents
- Predictions
- Recommendations
- Interventions
- Event timeline

The personas are different views into the same system.

---

# 6. IMPORTANT DATA DISTINCTION

Do not use "capacity" and "crowd" as interchangeable concepts.

The system should distinguish:

### Capacity
How much a resource can safely handle.

### Occupancy
How much of that capacity is currently being used.

### Flow
How quickly people/cars are moving through the resource.

### Forecast
Expected future occupancy/flow.

For example:

```text
Gate 4

Capacity:     5,000 people
Occupancy:    3,900 people
Flow:         320 people/min
Forecast:     4,800 in 11 min
Risk:         HIGH
```

Time must be treated as a first-class dimension.

Useful forecast windows:

```text
NOW
+5 min
+15 min
+30 min
+60 min
```

---

# 7. AI MUST BE EXPLAINABLE

Do not create a generic "AI-powered" badge and call it intelligence.

Every meaningful AI recommendation should answer:

### WHY?

Why is the system concerned?

### WHAT?

What action does it recommend?

### IMPACT?

What is expected to change?

### CONFIDENCE?

How certain is the recommendation?

Example:

```text
WHY
Gate 4 is receiving a concentrated flow
from Parking P3.

WHAT
Divert 900 attendees to Gate 6.

IMPACT
Expected 25% reduction in Gate 4 load.

CONFIDENCE
91%
```

The goal is to make the intelligence understandable to a judge/operator.

---

# 8. HUMAN-IN-THE-LOOP

The MVP should show that Stadia is an intelligent decision-support system, not an uncontrollable autonomous system.

Use this conceptual hierarchy:

```text
L1 — INFORM
Show the issue.

L2 — RECOMMEND
Suggest an action.

L3 — LOW-RISK AUTO ACTION
Automatically execute safe operational changes.

L4 — HUMAN APPROVAL
Operator approves meaningful interventions.

L5 — EMERGENCY COMMAND
Authorized operator takes direct control.
```

For the hackathon MVP, focus primarily on:

> **Detect → Predict → Recommend → Human Approves → Execute → Measure**

---

# 9. FAN EXPERIENCE — KEEP IT SMALL

Do NOT build three or four elaborate fan personas/flows.

The fan is a participant in the orchestration system, not the primary product.

The fan experience should be:

```text
FAN
 │
 ├── My Event
 │
 ├── Journey
 │
 ├── Live Guidance
 │
 └── Exit
```

### Before the event

```text
My Event
    ↓
Journey Plan
```

The user can:

- use an existing ticket
- purchase a ticket
- provide origin
- select travel mode
- receive recommended arrival timing
- receive recommended parking/transport
- receive recommended gate

### During the event

```text
Live Guidance
```

The system can dynamically update:

- route
- gate
- parking
- shuttle
- walking path
- arrival timing

### If something changes

```text
LIVE UPDATE

Gate 4 is becoming congested.

We've rerouted you to Gate 6.

Expected wait:
7 min instead of 14 min.
```

This is one of the strongest demonstrations of the platform's intelligence.

### After the event

```text
Exit Guidance
```

Handle:

- section-wise dispersal
- exit gate recommendation
- parking direction
- metro/transit direction
- shuttle pickup
- dynamic routing away from congestion

---

# 10. LOCAL / OUTSTATION IS NOT A PERSONA

Do NOT make these separate core personas:

```text
Fan — Local
Fan — Outstation
```

These are journey configurations.

A better model is:

```text
Fan
 ↓
Journey
 ↓
Travel Mode
 ├── Personal Vehicle
 ├── Public Transit
 ├── Shuttle
 └── Other
```

Accommodation can be added for outstation attendees when relevant.

The important thing is that the platform coordinates the journey regardless of travel type.

---

# 11. ROLE SWITCHING FOR MVP

Do NOT implement full authentication/authorization for the hackathon MVP.

Use a simple demo control at the top of the application:

```text
DEMO MODE · Viewing as: Stadium Operations ▾
```

Options:

```text
Fan
Stadium Operations
Mobility Operations
Executive Organizer
```

The role switcher is only for demonstration.

It should change:

- navigation
- dashboard/home view
- terminology
- metrics
- alerts
- available controls
- actions

But it must **never create separate event data**.

All roles read the same shared event state.

### Important

Do not overcomplicate this into production authentication.

Authentication and granular permissions can be described as future production architecture.

For the MVP, the goal is to demonstrate the product clearly and quickly to judges.

---

# 12. ROLE PURPOSES

## Stadium Operations

Primary concern:

> **What is happening inside and around the venue, and what intervention should we make?**

Show:

- gate saturation
- section density
- crowd flow
- turnstile ingress
- crowd mixing
- incidents
- steward deployment
- AI recommendations
- gate diversion
- emergency/operational actions

This should probably be the strongest operational dashboard.

---

## Mobility Operations

Primary concern:

> **How are people and vehicles moving toward and away from the venue?**

Show:

- parking P1–P5
- parking occupancy
- vehicle inflow
- shuttle fleet
- pickup hubs
- road/corridor health
- transport bottlenecks
- predicted parking overflow
- diversion recommendations

Mobility should connect directly to Stadium Operations.

Example:

```text
Parking P3 filling
        ↓
Vehicle diversion
        ↓
Different gate arrival pattern
        ↓
Gate 4 congestion risk
        ↓
Stadium Ops recommendation
```

---

## Executive Organizer

Primary concern:

> **Is the overall event healthy, and where does leadership need to intervene?**

Show high-level KPIs:

- attendance
- overall crowd health
- ingress progress
- congestion risk
- incidents
- transport health
- parking health
- intervention effectiveness

Keep this dashboard strategic.

Do NOT clutter it with every operational metric.

Commercial/sponsor analytics can exist as a secondary area but should not dominate the core crowd-management story.

---

## Fan

Primary concern:

> **How do I get to the event, enter safely, and get out efficiently?**

Show:

- ticket/event
- journey
- recommended arrival time
- route
- gate
- parking/transport
- live changes
- exit guidance

---

# 13. INCIDENT LIFECYCLE

Incidents should not simply appear as static alerts.

Use:

```text
DETECTED
    ↓
ASSESSED
    ↓
RECOMMENDATION
    ↓
ASSIGNED
    ↓
ACTION TAKEN
    ↓
MONITORING
    ↓
RESOLVED
    ↓
or
ESCALATED
```

This makes the platform feel operational rather than decorative.

---

# 14. EVENT TIMELINE

Create a shared event timeline showing important system actions.

Examples:

```text
18:42
Parking P3 reached 80%

18:44
AI predicted Gate 4 congestion

18:45
Diversion recommendation generated

18:46
Stadium Operations approved

18:47
Fan routes updated

18:52
Gate 4 congestion reduced

18:54
Intervention marked successful
```

This helps judges understand that the system is actually orchestrating an event over time.

---

# 15. SIMULATOR

The Simulator should NOT be a disconnected toy.

It should use the same conceptual event state and decision logic as the live system.

Example:

```text
Scenario:
Parking P3 capacity reduced by 30%

        ↓

Simulate

        ↓

Predicted impact:
Gate 4 +18%
Shuttle demand +22%
Road corridor C2 +14%

        ↓

Recommended interventions

        ↓

Compare outcomes
```

The Simulator demonstrates:

> **"What happens if the event state changes?"**

The live dashboard demonstrates:

> **"What is happening now, and what should we do?"**

They should feel like two views of the same intelligence engine.

---

# 16. UI DIRECTION

The UI should feel:

- clean
- sophisticated
- operational
- intelligent
- premium
- restrained
- easy to scan

### Preferred visual language

- dark charcoal / neutral base
- soft white/gray typography
- restrained status colors
- green for healthy/safe
- amber for warning
- red for critical
- subtle borders
- clear hierarchy
- compact but readable data visualization

### Avoid

- stock photography
- stadium hero images
- auditorium images
- decorative illustrations
- excessive gradients
- neon-heavy cyberpunk styling
- excessive glassmorphism
- unnecessary 3D objects
- decorative dashboard graphics
- huge marketing headlines inside operational screens
- too many cards
- dense unreadable tables
- meaningless AI badges

The dashboard should look like a serious **event operations platform**, not a gaming dashboard.

---

# 17. NO DECORATIVE IMAGES ON ORGANIZER DASHBOARDS

Organizer dashboards must contain **no stadium/auditorium/photographic hero imagery**.

The available space should communicate operational information.

Use:

- maps
- charts
- timelines
- status indicators
- flow visualizations
- operational panels
- alerts
- recommendations

The visualization itself should provide the visual richness.

---

# 18. DO NOT DESIGN PAGES IN ISOLATION

Design the system around the decision loop:

```text
SITUATION
    ↓
PREDICTION
    ↓
RECOMMENDATION
    ↓
DECISION
    ↓
ACTION
    ↓
OUTCOME
```

Every major operational screen should help answer:

1. What is happening?
2. What is going to happen?
3. Why?
4. What should we do?
5. What happens if we do it?
6. Did it work?

If a screen does not support this loop, question whether it belongs in the MVP.

---

# 19. PRIORITY ORDER FOR MVP

Build depth, not breadth.

### P0 — Absolutely essential

1. Shared event state
2. Stadium Operations dashboard
3. Live crowd/gate visualization
4. Capacity vs occupancy vs flow
5. Prediction
6. AI recommendation
7. Human approval
8. Intervention
9. Outcome/feedback
10. Demo role switcher

### P1 — Strong supporting features

11. Mobility Operations
12. Parking orchestration
13. Fan journey
14. Dynamic fan rerouting
15. Event timeline
16. Incident lifecycle

### P2 — Only if time allows

17. Executive dashboard
18. Simulator
19. Accommodation
20. Advanced commercial analytics
21. Additional fan conveniences

Do NOT sacrifice the core orchestration loop to build many shallow pages.

---

# 20. IMPLEMENTATION PRINCIPLES FOR ANTIGRAVITY

Before making any code changes:

### REQUIRED WORKFLOW

1. Inspect the existing repository.
2. Understand the current architecture and components.
3. Identify what already exists and what can be reused.
4. Explain the proposed changes to the user.
5. Clearly state:
   - files/components affected
   - what will change
   - what will NOT change
   - assumptions
   - risks
6. **STOP and wait for explicit user approval.**
7. Only after approval, modify the code.
8. After implementation, summarize:
   - changes made
   - files modified
   - tests/checks performed
   - anything still incomplete

### CRITICAL RULE

**NEVER modify code immediately after receiving a product/design instruction.**

The agent must first respond with the proposed implementation plan and wait for explicit approval.

Do not assume approval from phrases such as:

- "sounds good"
- "what do you think?"
- "can we do this?"
- "show me how"
- "I want this"

Only proceed when the user clearly authorizes implementation, such as:

- "implement it"
- "do it"
- "make the changes"
- "go ahead"
- "approved"

---

# 21. FINAL PRODUCT NORTH STAR

Stadia Nexus should feel like:

> **An intelligent operating system for mega-events that coordinates people, vehicles, venue capacity, transport, and operational decisions in real time.**

It should NOT primarily feel like:

> A ticket booking website with parking, hotels, and an AI dashboard attached.

The strongest story is:

```text
                    STADIA NEXUS

              KNOW WHAT IS HAPPENING
                       ↓
             PREDICT WHAT WILL HAPPEN
                       ↓
              RECOMMEND WHAT TO DO
                       ↓
                GET APPROVAL
                       ↓
              CHANGE THE EVENT
                       ↓
              MEASURE THE RESULT
                       ↓
               LEARN / UPDATE STATE
```

**Build the MVP around this loop.**
