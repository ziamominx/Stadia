# Stadia Nexus --- Antigravity Product & Architecture Brief

## 0. Critical Development Rule

**Before modifying any code, always explain the proposed changes first
and wait for explicit approval.**

The workflow must be:

1.  Inspect the existing implementation.
2.  Explain what you found.
3.  Propose the exact changes, affected pages/components, and any
    architectural implications.
4.  Wait for the user to approve.
5.  Only then modify code.
6.  After changes, summarize what was changed and how it was validated.

**Do not silently redesign, refactor, delete, or rewrite existing
functionality.**

------------------------------------------------------------------------

# 1. Product Definition

**Stadia Nexus** is an intelligent mega-event orchestration platform for
events such as the FIFA Women's World Cup in India.

It is **not primarily a ticketing website** and should not feel like
one.

The central product promise is:

> **Stadia understands the live state of an event, predicts what will
> happen next, recommends interventions, coordinates different
> operational teams, and feeds those decisions back into the attendee
> journey.**

The platform connects:

-   Ticketing
-   Attendance
-   Venue capacity
-   Gates
-   Crowd flow
-   Parking
-   Public transport
-   Shuttles
-   Hotels / hospitality
-   Attendee routing
-   Incident management
-   AI prediction
-   AI recommendations
-   Simulation
-   Executive oversight

The most important differentiator is the orchestration loop:

**Current Event State → Prediction → Risk Detection → Decision →
Recommendation → Approval/Automation → Intervention → Outcome → Updated
Event State**

------------------------------------------------------------------------

# 2. Core Product Principle

Do not design Stadia as a collection of unrelated dashboards.

The correct mental model is:

> **One shared event intelligence engine with role-specific control
> surfaces.**

Every role sees the same underlying event reality, but at a different
level of detail and with different permissions.

------------------------------------------------------------------------

# 3. Core User Personas

There are four core roles.

## 3.1 Fan / Attendee

The fan is a consumer user.

Primary goal:

-   Get the ticket
-   Understand how to arrive
-   Receive personalized routing
-   Enter the venue smoothly
-   Receive live updates when conditions change

The fan has two journey configurations:

-   Local
-   Outstation

**Local vs Outstation is NOT a separate role.**

It is a configuration of the Fan experience.

### Fan should see

-   Match / event information
-   Digital ticket
-   QR / digital pass
-   Personalized journey
-   Arrival time
-   Parking assignment where applicable
-   Transit / shuttle information
-   Hotel information where applicable
-   Gate assignment
-   Live route updates
-   Hospitality
-   Notifications

### Fan should NOT see

-   Raw turnstile telemetry
-   Tactical maps
-   Internal operational controls
-   Fleet dispatch controls
-   Commercial revenue
-   Executive metrics
-   Security operations

------------------------------------------------------------------------

# 3.2 Stadium Operations & Safety

Primary goal:

> Keep people moving safely through the venue.

Their operational world is:

**People → Gates → Queues → Turnstiles → Sections → Exits**

They should see:

-   Venue tactical map
-   Gate capacity
-   Gate occupancy
-   Gate throughput
-   Queue status
-   Crowd density
-   Crowd mixing risks
-   Ingress / egress flow
-   Predictions
-   Active incidents
-   AI recommendations
-   Steward deployment
-   Emergency communication controls
-   Intervention history

The Stadium Ops interface should be the most operationally powerful
interface in the system.

------------------------------------------------------------------------

# 3.3 Mobility Operations / Transit Coordinator

Primary goal:

> Keep people moving to and from the venue.

Their operational world is:

**People → Metro → Roads → Parking → Shuttles → Stadium**

They should see:

-   Parking zones
-   Parking occupancy
-   Parking capacity
-   Shuttle fleet
-   Shuttle schedules
-   Pickup hubs
-   Boarding status
-   Turnaround time
-   Road corridor health
-   Traffic conditions
-   Transit arrivals
-   Predicted arrival surges
-   AI rerouting recommendations
-   Mobility incidents

The important distinction is:

### Stadium Ops asks:

> Can we safely move people through the venue?

### Mobility Ops asks:

> Can we safely move people toward and away from the venue?

These should remain separate operational surfaces.

------------------------------------------------------------------------

# 3.4 Executive Organizer / Tournament Director

Primary goal:

> Understand whether the entire event is safe, stable, and on schedule.

The executive should NOT get a giant analytics dashboard full of
irrelevant metrics.

The main view should answer:

1.  Is the event safe?
2.  Is the event on schedule?
3.  Where is the current risk?
4.  What decisions have been taken?
5.  What needs attention?

They should see:

-   Overall attendance
-   Venue utilization
-   Safety / risk index
-   Entry velocity
-   Average entry time
-   Transport health
-   Parking health
-   Active incidents
-   Top risks
-   AI recommendations
-   Intervention history
-   Multi-agency status
-   Event performance
-   Reports
-   Simulation

Commercial analytics can exist under a secondary section such as:

**Executive → Commercial**

Do not put sponsorship or revenue telemetry on the primary executive
screen unless it is genuinely relevant.

------------------------------------------------------------------------

# 4. Role Architecture

Conceptually:

``` text
                         STADIA NEXUS
                              │
                     ┌────────┴────────┐
                     │  SHARED EVENT   │
                     │    STATE        │
                     └────────┬────────┘
                              │
       ┌──────────────┬───────┼───────┬──────────────┐
       ▼              ▼       ▼       ▼              ▼
      FAN        STADIUM OPS MOBILITY EXECUTIVE   SIMULATOR
                   & SAFETY    OPS     ORGANIZER
```

The role determines:

-   Interface
-   Information density
-   Available actions
-   Navigation
-   Permissions

The underlying event state remains shared.

------------------------------------------------------------------------

# 5. Shared Event State

The most important architectural concept is the **Event State**.

All roles must ultimately be reading from the same representation of
reality.

The shared state includes:

-   Event
-   Time
-   Venue
-   Attendance
-   Ticket assignments
-   Gate state
-   Queue state
-   Turnstile state
-   Crowd density
-   Parking state
-   Transit state
-   Shuttle state
-   Road corridor state
-   Hotel / hospitality state
-   Active incidents
-   Historical state
-   Forecast state
-   Interventions
-   Notification state

------------------------------------------------------------------------

# 6. State Engine

Do not confuse capacity, occupancy, and flow.

These are different concepts.

## Capacity

How much a resource can safely handle.

Example:

> Gate 4 capacity = 1,500 people/minute

## Occupancy

How much is currently being used.

Example:

> Gate 4 current load = 78%

## Flow

How quickly people are moving.

Example:

> Gate 4 throughput = 1,240 people/minute

## Forecast

What the system expects to happen.

Example:

> Gate 4 projected load = 94% in 12 minutes

A useful operational representation is:

``` text
Gate 4

Capacity:          1,500 / min
Current Occupancy: 78%
Current Flow:      1,240 / min
Predicted Load:    94% in 12 min
Risk:              HIGH
Confidence:        87%
```

The UI should avoid ambiguous metrics such as simply showing:

> Gates: 72%

unless the meaning is explicitly clear.

------------------------------------------------------------------------

# 7. Time Must Be a First-Class Dimension

Stadia is time-dependent.

Every important operational metric should potentially support:

``` text
NOW
 ↓
+5 min
 ↓
+15 min
 ↓
+30 min
 ↓
+60 min
```

The system should distinguish:

-   Current state
-   Forecast
-   Threshold
-   Time to threshold
-   Expected peak

Example:

> Gate 4 is currently stable but predicted to exceed safe throughput in
> 12 minutes.

This is more valuable than merely reporting that the gate is currently
at 78%.

------------------------------------------------------------------------

# 8. AI Architecture

Do not represent the AI as a vague black box.

The conceptual architecture is:

``` text
                    EVENT DATA
                        ↓
                 STATE ENGINE
                        ↓
              PREDICTION ENGINE
                        ↓
             RISK / CONFLICT ENGINE
                        ↓
                 DECISION ENGINE
                        ↓
               RECOMMENDATION
                        ↓
             HUMAN / AUTO CONTROL
                        ↓
                  EXECUTION
                        ↓
                RESULT / FEEDBACK
                        ↓
                  STATE ENGINE
```

## 8.1 Prediction Engine

Predict:

-   Crowd congestion
-   Gate overload
-   Parking saturation
-   Transit surges
-   Queue growth
-   Arrival peaks
-   Corridor degradation
-   Crowd mixing
-   Resource conflicts

## 8.2 Risk / Conflict Engine

Identify:

-   Approaching thresholds
-   Competing flows
-   Cross-domain conflicts
-   Unsafe crowd concentrations
-   Resource saturation
-   Cascading effects

## 8.3 Decision Engine

Do not jump directly from:

> Prediction → action

The decision engine should evaluate alternatives.

Example:

> Gate 4 projected at 94%.

Potential actions:

-   Redirect to Gate 6
-   Open additional gate
-   Delay shuttle arrivals
-   Reassign parking
-   Modify attendee routes

The system evaluates projected impact before recommending an action.

------------------------------------------------------------------------

# 9. AI Recommendations Must Be Explainable

Never show only:

> AI recommends redirecting 1,200 attendees.

Show:

### Recommendation

**Redirect 1,200 attendees from Gate 4 → Gate 6**

### Why?

-   Gate 4 projected to exceed throughput in 12 min
-   Parking Zone B is contributing 3,840 approaching attendees
-   Gate 6 currently has available throughput

### Expected Impact

-   Gate 4 load: -23%
-   Average wait: -6 min
-   Risk: HIGH → LOW

### Confidence

> 87%

This makes the AI understandable and defensible.

------------------------------------------------------------------------

# 10. Human-in-the-Loop Control

Do not make every action require manual approval.

Use different autonomy levels.

``` text
L1 — INFORM
System reports a condition.

L2 — RECOMMEND
System proposes an action.

L3 — AUTO-EXECUTE
Low-risk action is automatically applied.

L4 — HUMAN APPROVAL
Significant operational change requires authorization.

L5 — EMERGENCY COMMAND
Critical safety action requires authorized command.
```

Examples:

### Low risk

> Update a fan's walking route.

Could be automatic.

### Medium risk

> Adjust shuttle allocation.

May require Mobility approval.

### High risk

> Close Gate 4 and redirect thousands of attendees.

Requires Stadium Ops approval.

### Critical

> Emergency evacuation.

Requires authorized safety control.

------------------------------------------------------------------------

# 11. AI Is Not a Separate "AI Page"

Do not create a generic:

> AI Dashboard

where the AI is isolated from the actual product.

AI should be embedded into every role.

### Stadium Ops

> Gate 4 congestion predicted.

### Mobility

> Parking P3 will reach critical capacity in 18 minutes.

### Executive

> Event risk increasing due to simultaneous transport and gate surges.

### Fan

> Leave 20 minutes earlier and use Gate 6.

Same intelligence engine, different output.

------------------------------------------------------------------------

# 12. Fan Feedback Loop

Operational decisions must flow back to affected attendees.

Example:

``` text
Gate 4 congestion detected
        ↓
Organizer approves diversion
        ↓
Affected attendees identified
        ↓
Personalized routes updated
        ↓
Fans receive notification
        ↓
Crowd behavior changes
        ↓
New event state
```

The fan is not merely being monitored.

The platform actively changes the journey to improve the event.

------------------------------------------------------------------------

# 13. Cross-Domain Orchestration

The biggest reason Stadia exists is that operational systems affect each
other.

Example:

``` text
Parking P3 reaches 88%
        ↓
More cars redirected
        ↓
Additional attendees approach Gate 6
        ↓
Gate 6 predicted to reach threshold
        ↓
Stadium Ops alerted
        ↓
Alternative gate / route recommended
        ↓
Affected fans rerouted
        ↓
Crowd flow changes
        ↓
System measures result
```

This should be visible in the architecture and, ideally, demonstrated in
the UI.

Do not build isolated dashboards where Parking, Gates, Transit, and
Crowd Flow never influence each other.

------------------------------------------------------------------------

# 14. Multi-Agency Coordination

Do not create a separate top-level persona for every agency.

Instead, use:

**Role + Permissions**

Potential operational teams:

-   Stadium Operations
-   Mobility
-   Security
-   Medical
-   Traffic
-   Hospitality
-   Executive

Permissions determine what each team can view and modify.

Example:

``` text
Stadium Ops
→ Gates, queues, venue crowd flow

Mobility
→ Parking, transit, shuttles, corridors

Security
→ Security incidents and alerts

Medical
→ Medical incidents

Executive
→ Cross-domain visibility and authorization
```

The interface can remain role-specific without exploding the number of
personas.

------------------------------------------------------------------------

# 15. Incident Management

Incidents should have a lifecycle, not simply appear in an "Active
Incidents" list.

``` text
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
```

Possible escalation:

``` text
MONITORING
     ↓
Still unsafe
     ↓
ESCALATED
```

Each incident should retain a timeline.

Example:

``` text
18:21
AI detects unusual crowd buildup

18:23
Gate 4 congestion predicted

18:24
Parking B identified as primary contributor

18:25
AI recommends redirecting 1,200 attendees

18:26
Stadium Ops approves

18:27
Fan routes updated

18:31
Gate 4 load falls from 91% → 73%

18:34
Incident resolved
```

This timeline demonstrates:

**Detection → Intelligence → Coordination → Action → Result**

------------------------------------------------------------------------

# 16. Event Timeline

The Event Timeline should be a first-class concept.

It gives organizers a historical explanation of what happened during the
event.

It should capture:

-   AI detections
-   Predictions
-   Recommendations
-   Human approvals
-   Automatic actions
-   Notifications
-   Route changes
-   Incidents
-   Resolutions
-   Outcome metrics

This can become one of the strongest demonstration features.

------------------------------------------------------------------------

# 17. Stadium Operations Interface

The Stadium Ops screen should prioritize decisions rather than
decoration.

Recommended structure:

``` text
┌──────────────────────────────────────────────────────┐
│ EVENT STATUS                       LIVE               │
├──────────────┬──────────────────────────┬────────────┤
│              │                          │            │
│ INCIDENTS    │       VENUE FLOW        │ AI ALERTS  │
│              │                          │            │
│ Gate 4       │      Tactical View      │ Prediction │
│ Gate 2       │      Crowd Density      │ Cause      │
│ Sector NE    │      Gate Status        │ Action     │
│              │                          │ Impact     │
├──────────────┴──────────────────────────┴────────────┤
│ GATES │ QUEUES │ TURNSTILES │ DENSITY │ FORECAST     │
└──────────────────────────────────────────────────────┘
```

The visual hierarchy should answer:

**Where? → What? → What should I do? → How bad is it?**

------------------------------------------------------------------------

# 18. Stadium Ops Navigation

``` text
Command Center
Crowd Flow
Gates
Incidents
Simulation
```

Optional:

-   Reports

Avoid excessive navigation.

------------------------------------------------------------------------

# 19. Mobility Interface

Mobility should focus on the external arrival network.

Recommended sections:

``` text
Mobility Center
Parking
Transit
Corridors
Shuttles
Incidents
```

The central concept should be:

> **Where are people coming from, how are they moving, and where will
> they enter?**

Example:

``` text
            METRO
              │
          12,400
              ↓
          HUB NORTH
              │
           4,200
              ↓
            GATE B
              │
              ↓
          SECTION 12
```

Another example:

``` text
Parking B
  8,200
    ↓
 Gate 4
    ↓
 Predicted congestion
```

This makes Mobility an orchestration system rather than a collection of
parking and bus statistics.

------------------------------------------------------------------------

# 20. Executive Interface

The executive home screen should prioritize:

``` text
EVENT HEALTH
     ↓
TOP 3 RISKS
     ↓
AI RECOMMENDATIONS
     ↓
INTERVENTIONS
     ↓
OUTCOMES
```

Primary metrics:

-   Attendance
-   Capacity
-   Utilization
-   Safety / risk index
-   Entry velocity
-   Average entry time
-   Transport health
-   Parking health
-   Active incidents
-   Predicted peak
-   Event schedule health

Do not overload the home screen with:

-   Sponsor telemetry
-   Hotel commissions
-   Advertising metrics
-   Low-level bus logs

Those belong in secondary sections.

------------------------------------------------------------------------

# 21. Executive Navigation

``` text
Event Overview
Performance
Risk & Safety
Agencies
Simulation
Reports
```

Optional:

``` text
Commercial
```

Keep commercial analytics secondary.

------------------------------------------------------------------------

# 22. Simulator

The simulator is a dedicated experience because it is a demonstration /
planning tool rather than normal monitoring.

The simulator must use the **same underlying event-state and decision
logic** as the live system.

Do NOT create a separate fake AI system for the simulator.

Concept:

``` text
CURRENT EVENT STATE
        +
HYPOTHETICAL DISRUPTION
        ↓
SIMULATION ENGINE
        ↓
PREDICTED CONSEQUENCES
        ↓
RECOMMENDED INTERVENTIONS
        ↓
PROJECTED OUTCOME
```

Example:

### Scenario

**Gate 4 Closed**

### Without Stadia

``` text
Gate 3 → 118%
Gate 5 → 109%
Average wait → 24 min
Risk → CRITICAL
```

### Stadia Response

``` text
Gate 4 closed
        ↓
AI predicts redistribution
        ↓
Reassign 2,400 attendees
        ↓
Open Gate 6
        ↓
Adjust transport routing
        ↓
Notify affected attendees
```

### Result

``` text
Gate 3 → 76%
Gate 5 → 72%
Gate 6 → 64%

Average wait → 8 min
Risk → LOW
```

This is one of the strongest possible product demonstrations.

------------------------------------------------------------------------

# 23. Simulator Scenarios

Potential scenarios:

-   Gate closure
-   Gate scanner failure
-   Metro delay
-   Harbour Line delay
-   Parking zone saturation
-   Shuttle shortage
-   Sudden arrival surge
-   Severe rain / weather disruption
-   Crowd mixing at an intersection
-   Road corridor slowdown

The simulator should allow comparison:

**Without intervention vs Stadia intervention**

------------------------------------------------------------------------

# 24. MVP Role Simulation — "Viewing as"

## Do NOT implement authentication for the MVP

For the current hackathon / judging MVP, **do not spend implementation effort on login, signup, authentication, user accounts, sessions, or backend role authorization**.

Instead, provide a simple role simulation control in the top-right of the application.

This makes the product easier to implement and much easier to demonstrate to judges.

### Header control

Use:

> **DEMO MODE · Viewing as: Stadium Operations ▾**

The dropdown should allow switching between:

- Stadium Operations
- Mobility Operations
- Executive Organizer
- Fan — Local
- Fan — Outstation

### Why this approach

The purpose is to demonstrate the same Stadia platform from different stakeholder perspectives without building separate authentication flows.

A judge should be able to ask:

> "What does the mobility team see?"

The presenter simply switches:

**Viewing as → Mobility Operations**

and the application transforms into the Mobility view.

Likewise:

- **Viewing as → Executive Organizer** shows the strategic overview.
- **Viewing as → Fan — Local** shows the local attendee experience.
- **Viewing as → Fan — Outstation** shows the outstation travel and hospitality experience.

## The switch must change the complete experience

Changing the persona should update:

- Navigation
- Home / primary dashboard
- Information density
- Terminology
- Available controls
- Relevant alerts
- Relevant metrics
- Actions available to that persona

Do NOT merely change a title while leaving the same dashboard underneath.

## Important architecture rule

The persona switcher only changes the **view and simulated permissions**.

It must NOT create separate copies of event data.

All personas must read from the same shared event state.

Example:

```text
                    SHARED EVENT STATE
                           │
                           │
              Gate 4 changes 78% → 94%
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
    Stadium Ops         Mobility         Executive
    sees critical       sees incoming     sees increased
    gate overload       flow problem      event risk
          │                │                │
          └────────────────┼────────────────┘
                           ↓
                         Fan
                  receives updated
                   gate / route
```

This demonstrates that Stadia is one connected orchestration system rather than several unrelated dashboards.

## Production note

Real authentication and backend authorization can be added later.

For the MVP, the priority is:

**Role simulation → shared event state → orchestration → visible outcome**

Do not let authentication infrastructure delay or complicate the core product demonstration.

---

# 25. Dynamic Navigation

The navigation should change according to the active role.

## Fan

``` text
Home
My Ticket
My Journey
Live Updates
Hospitality
```

## Stadium Ops

``` text
Command Center
Crowd Flow
Gates
Incidents
Simulation
```

## Mobility

``` text
Mobility Center
Parking
Transit
Corridors
Shuttles
Incidents
```

## Executive

``` text
Event Overview
Performance
Risk & Safety
Agencies
Simulation
Reports
```

Do not expose irrelevant functionality to every role.

------------------------------------------------------------------------

# 26. UI / Visual Direction

The interface should be:

-   Clean
-   Sophisticated
-   Minimal
-   Operational
-   High information density where needed
-   Spacious where possible
-   Low noise
-   Professional
-   Futuristic without looking gimmicky

## Absolutely avoid

-   Hero photography
-   Stadium photography
-   Auditorium imagery
-   Large decorative images
-   Stock photos
-   Excessive gradients
-   Neon cyberpunk aesthetics
-   Excessive glassmorphism
-   Giant glowing maps
-   Decorative 3D objects
-   Unnecessary animations
-   Excessive cards
-   Dashboard clutter

**There should be no large image or photographic centerpiece on the
organizer dashboards.**

The interface itself should create the visual identity.

------------------------------------------------------------------------

# 27. Color Philosophy

Use a restrained palette.

Base:

-   Near-black / charcoal
-   Dark gray
-   Soft white
-   Neutral gray borders

Status colors should be meaningful, not decorative:

-   Green = healthy / stable
-   Amber = warning / approaching threshold
-   Red = critical / action required

Do not make every component colorful.

Color should communicate state.

------------------------------------------------------------------------

# 28. Typography

The interface should feel premium and editorial.

Suggested direction:

-   Strong serif or refined display typography for major headings
-   Clean sans-serif for operational data and controls
-   Clear numerical hierarchy
-   Generous whitespace
-   Avoid overly futuristic fonts

If the existing project has an established typography system, preserve
it unless there is a clear reason to change it.

------------------------------------------------------------------------

# 29. Visual Hierarchy

Every screen should prioritize:

### 1. Situation

What is happening now?

### 2. Risk

What is going wrong or likely to go wrong?

### 3. Prediction

What happens next?

### 4. Recommendation

What does Stadia suggest?

### 5. Action

What can the operator do?

### 6. Outcome

Did the action work?

This hierarchy is more important than adding more charts.

------------------------------------------------------------------------

# 30. Avoid "Dashboard Porn"

Do not add charts merely because dashboards usually contain charts.

Every visualization should answer a question.

Examples:

### Good

**When will arrival volume peak?**

→ Forecast chart

### Good

**Where are people coming from and where are they going?**

→ Flow diagram

### Good

**Is Gate 4 approaching capacity?**

→ Current + predicted capacity visualization

### Bad

A decorative line graph with no operational meaning.

### Bad

A KPI card that exists only to make the page look full.

------------------------------------------------------------------------

# 31. Main Organizer Experience

The organizer should experience:

``` text
LOGIN
  ↓
SELECT EVENT
  ↓
COMMAND CENTER
  ↓
UNDERSTAND CURRENT STATE
  ↓
SEE PREDICTED RISKS
  ↓
REVIEW AI RECOMMENDATION
  ↓
APPROVE / MODIFY / DISMISS
  ↓
INTERVENTION
  ↓
MONITOR RESULT
  ↓
EVENT STATE UPDATES
```

This is the core product loop.

------------------------------------------------------------------------

# 32. Example Organizer Scenario

A useful canonical demo scenario:

``` text
EVENT
India vs Australia
Wankhede Stadium
19 Sep 2026
7:00 PM
```

Current:

``` text
Attendance: 61,830 / 68,420
Overall utilization: 90%
```

The system detects:

``` text
Gate 4
Current load: 78%
Predicted: 94% in 12 min
```

Cause:

``` text
Parking Zone B
3,840 approaching attendees
```

Stadia recommends:

``` text
Redirect 1,200 attendees → Gate 6
```

Expected impact:

``` text
Gate 4 load: -23%
Average wait: -6 min
Confidence: 87%
```

Organizer approves.

Then:

``` text
Affected fan routes update
        ↓
Mobility flow adjusts
        ↓
Gate load changes
        ↓
System measures outcome
        ↓
Incident resolves
```

This single scenario should demonstrate the platform's central value
proposition.

------------------------------------------------------------------------

# 33. Architecture Summary

The refined architecture is:

``` text
                         STADIA NEXUS
                              │
                              ▼
                    ┌──────────────────┐
                    │   EVENT STATE    │
                    │                  │
                    │ Tickets          │
                    │ Attendance       │
                    │ Gates            │
                    │ Parking          │
                    │ Transit          │
                    │ Venue            │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   STATE ENGINE   │
                    │                  │
                    │ Capacity         │
                    │ Occupancy        │
                    │ Flow             │
                    │ Location         │
                    │ Time             │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ PREDICTION + RISK    │
                  │                      │
                  │ Forecast congestion  │
                  │ Detect anomalies     │
                  │ Identify conflicts   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   DECISION ENGINE    │
                  │                      │
                  │ Evaluate alternatives│
                  │ Estimate impact      │
                  │ Assign confidence    │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  AI RECOMMENDATION   │
                  │                      │
                  │ WHY?                 │
                  │ WHAT?                │
                  │ IMPACT?              │
                  │ CONFIDENCE?          │
                  └──────────┬───────────┘
                             │
                       HUMAN / AUTO
                             │
                             ▼
                  ┌──────────────────────┐
                  │    INTERVENTION      │
                  │                      │
                  │ Gate diversion      │
                  │ Parking reroute      │
                  │ Shuttle adjustment   │
                  │ Fan route update     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │    EVENT FEEDBACK    │
                  │                      │
                  │ Did it work?         │
                  │ Risk reduced?        │
                  │ Flow improved?       │
                  └──────────┬───────────┘
                             │
                             └──────→ STATE ENGINE
```

Above the same engine:

``` text
              ┌─────────────┐
              │ FAN         │
              └─────────────┘

              ┌─────────────┐
              │ STADIUM OPS │
              └─────────────┘

              ┌─────────────┐
              │ MOBILITY    │
              └─────────────┘

              ┌─────────────┐
              │ EXECUTIVE   │
              └─────────────┘

              ┌─────────────┐
              │ SIMULATOR   │
              └─────────────┘
```

------------------------------------------------------------------------

# 34. MVP Scope

Do not attempt to fully implement every possible Stadia feature at once.

## MUST WORK

### 1. Shared Event State

At minimum:

-   Tickets
-   Attendance
-   Gates
-   Parking
-   Transport

### 2. Prediction

Predict congestion / capacity issues.

### 3. Recommendation

Generate an operational intervention.

### 4. Approval

Allow an authorized operator to approve, modify, or dismiss.

### 5. Propagation

Update affected attendee routes / operational state.

### 6. Outcome

Show whether the intervention improved the situation.

## SHOULD WORK

-   Simulator
-   Incident lifecycle
-   Event timeline
-   Explainable recommendation

## NICE TO HAVE

-   Hotels
-   Hospitality
-   Revenue
-   Sponsorship analytics
-   WhatsApp
-   Advanced multi-agency controls

Do not allow nice-to-have features to compromise the core orchestration
loop.

------------------------------------------------------------------------

# 35. Development Guardrails for Antigravity

Before making UI or code changes:

1.  Inspect the existing codebase.
2.  Identify existing routes, components, data models, and design
    system.
3.  Do not assume a page needs to be rebuilt.
4.  Preserve existing functionality unless the user explicitly approves
    its removal.
5.  Explain the proposed architecture and UI changes.
6.  Wait for approval.
7.  Implement incrementally.
8.  Verify that existing routes and functionality still work.
9.  Do not introduce unnecessary dependencies.
10. Do not create duplicated data sources for the same event state.
11. Keep role-specific views connected to the same underlying event
    state.
12. Keep AI recommendations explainable.
13. Keep the UI clean and low-noise.
14. Do not add decorative images to organizer dashboards.
15. Do not add UI elements simply to make the dashboard look more
    complex.

------------------------------------------------------------------------

# 36. The One Rule That Should Guide Every UI Decision

> **Stadia is not a collection of dashboards. It is a shared event state
> with role-specific control surfaces around an orchestration engine.**

And the organizer experience should always answer:

> **What is happening? → What will happen next? → What should I do? →
> Did it work?**

That is the product.
