# STADIA — Landing Page Rebuild Prompt for Antigravity

## ROLE

Act as a senior creative developer, 3D web designer, interaction designer, and frontend engineer.

You are rebuilding the **STADIA landing page** as a premium cinematic product experience.

Do NOT rebuild or alter the existing STADIA operations engine, backend logic, APIs, event simulation, or operational dashboards unless absolutely required for the landing page.

Before making changes:
1. Inspect the existing project structure.
2. Identify the current landing/homepage route.
3. Identify the existing STADIA design system, dependencies, and reusable components.
4. Check whether Three.js / React Three Fiber / GSAP / Lenis or equivalent libraries already exist.
5. Preserve existing functionality outside the landing page.

Then explain your implementation plan to me FIRST and wait for approval before making code changes.

---

# 01 — CORE CREATIVE IDEA

The landing page should communicate one idea:

> **STADIA manages the entire event journey, not just the crowd.**

The hero experience is a single continuous journey:

**STADIUM → SEAT → TICKET → CAR → HOTEL**

This must NOT feel like five separate website sections.

It must feel like one continuous 3D world where the camera travels through the attendee journey.

The user controls the journey primarily through vertical scrolling.

Scrolling should control the camera and animation progress.

---

# 02 — VISUAL DIRECTION

The visual language is extremely important.

Use:

- Pure/deep black background
- Thin luminous white wireframe geometry
- Very subtle cool-white glow
- High contrast
- Premium futuristic architectural visualization
- Minimal composition
- Large amounts of negative space
- Cinematic camera movement
- Sophisticated typography
- Extremely restrained UI

Do NOT use:

- Purple
- Blue
- Red
- Gold
- Green
- Rainbow gradients
- Generic "AI dashboard" aesthetics
- Excessive glassmorphism
- Neon gaming aesthetics
- Floating cards everywhere
- Huge KPI walls
- Busy HUD interfaces
- Stock illustrations
- Cartoon graphics

The 3D objects should look like they belong to the same physical world.

Reference visual feeling:
- premium architectural visualization
- futuristic wireframe
- cinematic product launch
- minimal technology brand
- sophisticated, not cyberpunk

---

# 03 — HERO EXPERIENCE

The first viewport should immediately communicate STADIA.

Minimal navigation:

LEFT:
STADIA

CENTER/RIGHT:
Product
How It Works
Platform
Contact

RIGHT:
Enter Platform

Keep navigation extremely clean.

No oversized navbar.

---

# 04 — HERO COPY

Use concise copy.

Eyebrow:

INTELLIGENT EVENT ORCHESTRATION

Headline:

**THE JOURNEY  
IS THE CROWD.**

Supporting copy:

STADIA connects the complete event journey — from ticket and entry to transport and hospitality — through one shared operational layer.

Primary CTA:

EXPLORE STADIA

Secondary CTA:

ENTER PLATFORM

Do not cover the 3D animation with text.

The typography should sit around the animation, not fight it.

---

# 05 — THE CONTINUOUS 3D JOURNEY

This is the most important part of the landing page.

Create a long scroll-controlled 3D experience.

Use a pinned full-screen canvas.

The page itself can be several viewport heights tall, but the canvas remains pinned while scroll progress controls the animation.

Preferred implementation:

- React Three Fiber / Three.js
- GSAP ScrollTrigger for deterministic scroll progress
- Lenis for smooth scrolling
- GLB/GLTF assets if useful
- Procedural geometry where practical

Do NOT create five unrelated animations.

Create ONE continuous camera journey.

---

# 06 — EXACT ANIMATION SEQUENCE

## PHASE 1 — STADIUM

Start with a large futuristic stadium in 3D wireframe.

The stadium should resemble a premium architectural model.

Camera:
- elevated exterior angle
- stadium clearly visible
- stable horizon
- no upside-down perspective

The stadium should have:

- roof/trusses
- outer structure
- seating bowl
- field
- entrances
- detailed architectural geometry

Everything is white wireframe against black.

---

## PHASE 2 — STADIUM ROTATION

Before zooming into the stadium, intentionally rotate the STADIUM itself.

This is important.

The stadium should rotate approximately 20–30 degrees around its vertical axis.

The CAMERA MUST NOT roll.

The horizon must remain stable.

This rotation exists to establish the correct orientation before the camera enters.

DO NOT:

- rotate the camera upside down
- roll the camera
- tilt the world sideways
- invert the stadium
- dive underneath the stadium

The stadium rotates like a physical architectural model on a vertical axis.

---

## PHASE 3 — NORMAL CAMERA ENTRY

After the brief stadium rotation:

The camera smoothly moves forward into the stadium.

The camera remains upright and level.

The movement should feel like a real cinematic camera travelling through the stadium.

Do NOT make the camera:

- flip
- roll
- rotate sideways
- enter from below
- reverse direction

Move naturally through the stadium architecture.

---

# 07 — SEAT FOCUS

The camera gradually approaches one specific seat.

The seat must be:

- physically upright
- correctly oriented
- naturally placed in the stadium
- visually obvious as the selected seat

As the camera gets closer:

- surrounding seats become less visually dominant
- the selected seat gets a slightly stronger white glow
- the camera continues moving forward

The seat should become the focal point.

Do NOT suddenly cut to a close-up seat.

The seat must be reached through continuous camera movement.

---

# 08 — SEAT → TICKET TRANSFORMATION

This transition must NOT look like an AI morph.

Do NOT dissolve the seat.

Do NOT teleport to a ticket.

Do NOT randomly reshape the entire frame.

Instead:

The selected seat becomes brighter.

Then its wireframe geometry begins to separate into clean architectural lines.

Those lines physically reorganize.

The seat structure unfolds/reconfigures into a futuristic event ticket.

The ticket is created from the SAME luminous geometry/material as the seat.

Think:

**seat geometry → unfolding geometry → ticket geometry**

The transformation should feel intentional, engineered and physical.

The camera continues moving during the transformation.

The ticket gradually becomes the dominant object.

The ticket should end in a clean three-quarter view.

---

# 09 — TICKET

The ticket represents an actual STADIA event ticket.

Use fictional demo information:

EVENT:
INDIA vs AUSTRALIA

VENUE:
WANKHEDE STADIUM

CITY:
MUMBAI

DATE:
12 OCTOBER 2026

TIME:
7:30 PM

GATE:
WEST GATE

SECTION:
A12

ROW:
18

SEAT:
24

TICKET ID:
STADIA-48291

ACCESS:
GENERAL ADMISSION

The ticket should use elegant, minimal typography.

The text should be readable but not dominate the 3D aesthetic.

Include a subtle barcode / QR-style geometric pattern.

Do NOT use real brand logos.

---

# 10 — TICKET → CAR

Continue the SAME journey.

Do not make the car appear as an unrelated scene.

The ticket becomes the next transition point.

Use cinematic camera movement and spatial continuity to move from the ticket into the mobility stage.

The ticket can rotate / move past the camera while the camera continues forward.

A futuristic wireframe car should emerge naturally from the same visual environment.

The car should feel like it was always physically present beyond the ticket.

Avoid a literal "morphing ticket into car" if it looks unnatural.

Use camera choreography to make the transition believable.

---

# 11 — CAR JOURNEY

The wireframe car travels along a minimal curved wireframe road.

The road should emerge naturally from the black environment.

The camera follows the car.

Keep:

- smooth motion
- cinematic tracking
- consistent wireframe material
- consistent scale
- consistent lighting

No city clutter.

No traffic.

No random buildings.

The car is the only major object.

---

# 12 — HOTEL

The car approaches a modern futuristic hotel.

The hotel should use the same white wireframe architectural language.

The final composition should feel calm and resolved.

The car slows.

The camera gradually settles.

The hotel becomes the dominant object.

This is the visual end of the attendee journey.

---

# 13 — SCROLL BEHAVIOUR

The entire animation must be scroll-driven.

Use a long virtual scroll timeline.

Suggested structure:

0–15%:
Stadium exterior

15–25%:
Stadium rotation

25–40%:
Camera enters stadium

40–52%:
Seat focus

52–65%:
Seat → ticket transformation

65–75%:
Ticket → mobility transition

75–90%:
Car journey

90–100%:
Hotel arrival

These percentages are starting points, not rigid requirements.

The important thing is that scrolling controls the camera continuously.

Scrolling down progresses the journey.

Scrolling up reverses the journey smoothly.

There must be no abrupt snapping between states.

---

# 14 — PERFORMANCE

The experience must remain smooth.

Use:

- optimized geometry
- instancing for repeated seats
- low/medium polygon geometry where possible
- controlled bloom
- lazy loading
- asset preloading
- requestAnimationFrame efficiently
- device-aware quality scaling

Do not sacrifice the entire site's performance for visual complexity.

For mobile:
- provide a simplified version of the 3D experience
- preserve the narrative
- reduce geometry complexity
- maintain the monochrome visual language

---

# 15 — FALLBACK STRATEGY

If a specific 3D transformation is technically unreliable:

DO NOT replace the entire concept with generic sections.

Instead, fake the transition intelligently using:

- camera movement
- depth
- object rotation
- scale
- controlled opacity
- geometry swaps hidden by camera proximity

The user should perceive one continuous journey.

The visual result matters more than whether every object is literally morphing at vertex level.

---

# 16 — SUPPORTING LANDING PAGE SECTIONS

After the cinematic journey, transition into normal website content.

Keep the same premium minimal visual language.

## SECTION — THE PROBLEM

Headline:

**MEGA EVENTS DON'T FAIL IN ONE PLACE.**

Copy:

Congestion is rarely caused by a single gate, road, shuttle, hotel or venue.
It emerges when thousands of individual journeys collide.

Show a minimal wireframe network illustrating:

Ticket → Arrival → Entry → Seat → Exit → Transport → Hotel

---

## SECTION — THE INSIGHT

Headline:

**MANAGE THE JOURNEY.  
AND YOU MANAGE THE CROWD.**

Explain that crowd behaviour is influenced by the entire attendee journey.

Use a clean horizontal journey visualization.

---

## SECTION — ONE SHARED EVENT STATE

Show:

ORGANIZER
GROUND
TRANSPORT
VENUE
HOSPITALITY

all connected to:

**STADIA**

Minimal diagram.

No giant dashboard screenshot.

---

## SECTION — HOW STADIA WORKS

Use five simple stages:

CONFIGURE
OBSERVE
PREDICT
DISPATCH
RESOLVE

Each stage should have a minimal visual treatment.

---

## SECTION — PLATFORM

Introduce the operational platform.

Show subtle UI previews for:

Command Center
Crowd
Ground
Transport
Incidents
Analytics

These should be presented as product previews, not giant dashboard walls.

---

## SECTION — FINAL CTA

Large statement:

**EVERY EVENT HAS A JOURNEY.  
STADIA ORCHESTRATES IT.**

CTA:

ENTER STADIA

Keep the final section extremely minimal.

---

# 17 — TYPOGRAPHY

Use a modern premium sans-serif.

Typography should feel:

- precise
- editorial
- technical
- restrained

Use large typography sparingly.

Avoid:

- overly rounded startup fonts
- futuristic gimmick fonts
- excessive letter spacing
- huge text covering the entire screen

---

# 18 — MICRO-INTERACTIONS

Keep interactions subtle.

Examples:

- nav links have understated hover movement
- CTA has a restrained hover state
- ticket information can brighten slightly when active
- journey labels can appear/disappear based on scroll progress
- small progress indicator can show journey position

Do NOT turn the page into a game interface.

---

# 19 — IMPORTANT ENGINEERING RULES

The existing STADIA operational engine is the source of truth.

DO NOT rebuild:

- operations engine
- crowd simulation
- incident engine
- ground dispatch logic
- transport dispatch logic
- API state
- event simulation
- operational routes

The landing page is a visual/product layer.

Existing important areas include:

- `lib/operations/engine.mjs`
- `components/operations/`
- `app/(operations)/`
- `app/api/operations/route.js`
- `/command-center`
- `/event-control`
- `/ground`
- `/transport`
- `/analytics`
- `VenueMap.jsx`
- `IncidentResponse.jsx`

Do not break these.

---

# 20 — DESIGN QUALITY BAR

The final result should NOT look like:

- a student dashboard
- a generic SaaS template
- a cyberpunk website
- a template with random gradients
- an AI-generated UI
- five disconnected animation sections

It should feel like a premium technology product launch site.

Think:

**architectural visualization + cinematic product film + modern editorial website**

The 3D animation is the hero.

Everything else supports it.

---

# 21 — ACCEPTANCE TEST

Before considering the landing page complete, verify:

### Animation
- [ ] Stadium begins correctly.
- [ ] Stadium rotates on its vertical axis.
- [ ] Camera never rolls upside down.
- [ ] Stadium floor remains correctly oriented.
- [ ] Camera enters normally.
- [ ] A clearly upright seat is selected.
- [ ] Seat is approached from a natural angle.
- [ ] Seat glows subtly.
- [ ] Seat physically/reasonably unfolds into ticket geometry.
- [ ] Ticket does not appear from nowhere.
- [ ] Ticket contains the specified information.
- [ ] Ticket transitions naturally toward the car journey.
- [ ] Car travels toward hotel.
- [ ] Hotel becomes the final destination.
- [ ] Scrolling controls the entire journey.
- [ ] Scrolling upward reverses the journey.
- [ ] No hard cuts in the main cinematic journey.
- [ ] No accidental camera inversion.
- [ ] No unrelated visual style changes.

### Visual
- [ ] Black background.
- [ ] White wireframe only.
- [ ] No colored neon.
- [ ] No unnecessary UI.
- [ ] Consistent geometry.
- [ ] Consistent glow.
- [ ] Premium composition.
- [ ] Strong negative space.

### Product
- [ ] Landing page clearly explains what STADIA is.
- [ ] The attendee journey is understandable without narration.
- [ ] STADIA's orchestration concept is clear.
- [ ] Operational platform is introduced after the cinematic experience.
- [ ] Existing platform functionality remains intact.

### Performance
- [ ] Desktop is smooth.
- [ ] Mobile has a reasonable fallback.
- [ ] 3D assets are optimized.
- [ ] No unnecessary dependencies.
- [ ] No console errors.
- [ ] No broken routes.

---

# 22 — DEVELOPMENT PROCESS

Follow this exact process.

STEP 1:
Inspect the existing repository and understand the current architecture.

STEP 2:
Explain:
- current landing page structure
- libraries already available
- what can be reused
- what needs to be created
- proposed 3D implementation
- performance strategy

Then STOP and wait for my approval.

STEP 3:
After approval, implement the landing page in stages:

Stage A:
Navigation + hero typography + base visual system.

Stage B:
Stadium 3D scene + camera.

Stage C:
Scroll-driven stadium rotation + camera entry.

Stage D:
Seat selection + camera approach.

Stage E:
Seat → ticket transformation.

Stage F:
Ticket → car → hotel journey.

Stage G:
Supporting landing page sections.

Stage H:
Responsive/mobile optimization.

Stage I:
Performance and final polish.

After every stage, verify that the existing STADIA platform still works.

---

# FINAL INSTRUCTION

Do not over-engineer the concept.

Do not add features just because they are technically possible.

The experience should communicate one simple idea:

**STADIA manages the entire journey that creates the crowd.**

The visual journey is:

**STADIUM → SEAT → TICKET → CAR → HOTEL**

Make it feel like one continuous cinematic world.
