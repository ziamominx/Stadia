# STADIA hc002 — Operations interface and connected demo

Built from `hc001` (`7e567c9`), using the six HTML/screenshots under `stitch_stadia_event_command_platform` as visual references and `MD/flow.md` as the operational workflow. The original reference files are unchanged.

## Start

```sh
npm ci
npm test
npm run build
npm start
```

Open http://localhost:3000. The root redirects to `/command-center`. The previous landing page is preserved at `/fan`; existing booking and organizer routes remain available.

## Routes

| Route             | Function                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/command-center` | Venue schematic, selected-zone inspector, incident response, simulation trigger, shared event log                        |
| `/crowd`          | Zone occupancy, queue wait estimates, processing controls, virtual entry/exit counts, facility queues                    |
| `/ground`         | Personnel availability, dispatched tasks, acceptance, deployment, issue flags, completion                                |
| `/transport`      | Bus diversions, reserve dispatch, fleet filters, hub queues, parking arrivals/departures                                 |
| `/incidents`      | Crowd/fire/medical incidents, filtering, task progress, audit trail, staff clearance                                     |
| `/event-control`  | Event settings, thresholds, personnel quotas, exit states, staff-approved routes, weather simulation, reset, JSON export |
| `/analytics`      | Verified outcomes, dispatch/resolution durations, occupancy histories, event log                                         |

The visual language follows the supplied references: light surfaces, fine dividers, compact type, monochrome controls, green/amber/red state cues, and a large interactive SVG stadium schematic. Reference clipping and overlapping headers are corrected for responsive layouts. Analytics extends the same design system because no Analytics reference was supplied.

## Main demonstration

1. Event Control → Reset demo session → Confirm reset, if needed.
2. Command Center → Simulate inflow spike. West Gate rises from 82% through 87% to 92%.
3. Review & dispatch response → Confirm. Six volunteers and three P3 coaches are reserved.
4. Ground → Accept task → Start deployment.
5. Transport → Accept task → Start diversion. The three coaches change to P4.
6. Return to Command Center. Occupancy decreases by five percentage points per simulated minute only after both teams start. A flagged task blocks this improvement.
7. The incident stabilizes below critical and resolves after three consecutive minutes below warning. Personnel are released; outcome metrics appear in Analytics.

One simulated minute is 2.5 real seconds. Pause/resume is shared across all browsers. Tick advancement is owned by the server and based on elapsed time, so multiple open pages do not accelerate the scenario. UI clients poll at one-second intervals.

## Additional demonstrations

- **Fire:** report smoke in a zone; its exit becomes blocked. Dispatch security, accept/start/complete the ground task, then confirm staff clearance in Incidents. Reopen the exit separately in Event Control. While the incident is open, record a staff-verified alternate exit and instructions; blocking that exit invalidates the approval.
- **Medical:** report assistance in a zone; dispatch reserves one available medical team. Complete the task and confirm staff clearance. The team returns to the available pool.
- **Parking:** Transport → parking cards → simulate batches of ten arrivals/departures. Capacity bounds are enforced and the least-occupied lot is recommended.
- **Facilities:** Crowd → simulate/clear food court or restroom queues and inspect computed waiting times.
- **Weather:** Event Control → simulate rain and waterlogging. Shelter availability is displayed and Command Center receives the scenario notice. No weather API is called.
- **PA:** the header broadcast dialog records a simulated announcement in the shared log.

## Architecture

- `app/(operations)`: Next.js App Router pages and the shared operations layout; scoped CSS prevents changes to legacy fan styling.
- `components/operations`: state provider, shell, reusable UI, schematic, incident response, team task cards, route approval and resource controls.
- `lib/operations/engine.mjs`: deterministic event state, validation, simulation clock, incident lifecycle, resource reservations and commands.
- `app/api/operations/route.js`: GET snapshot and POST validated commands, using a server-memory singleton.
- `tests/operations.test.mjs`: dependency-free Node tests for crowd sequencing, resource conservation, medical/fire clearance, flags, time advancement, quotas, thresholds, route approval and capacity limits.

Invalid commands operate on a copy and cannot partially mutate shared state. Repeated dispatch is rejected. Staff and coach reservations prevent assigning the same resource twice. Event capacity and zone occupancy are distinct metrics; camera counts are simulated estimates and are never added to gate counts. Gate wait estimates use queue / processing rate and become unavailable when processing is held.

## Demo boundaries

- This is an in-memory, single-server hackathon simulation. It resets on process restart; it is not a durable multi-instance database. Use one `next start` server for the shared demonstration.
- Demo role switching changes views. It is not authentication or authorization; do not expose this as a production control system.
- The new operations state is separate from the legacy booking/hospitality simulation. Existing legacy APIs are retained; real ticket scans and legacy bookings do not feed the new demo automatically.
- Sensors, coach locations, announcements and emergencies are explicitly simulated. There are no live CCTV/YOLO, MQTT, WhatsApp, weather or emergency-service connections in the new interface.
- The schematic is not a navigable venue survey. Alternate routes are entered and verified by staff; the prototype does not autonomously compute evacuation routes.
- Predictions are transparent simulation estimates, not a trained AI model or calibrated confidence scores.
- Hanken Grotesk and JetBrains Mono use Google Fonts with local system fallbacks. No external map tiles are required for the demo schematic.

## Verification

`npm test` checks domain behavior. `npm run build` compiles all new and retained routes. Browser verification exercises the complete crowd loop with a second synchronized tab, fire and medical resolution, and all seven screens at 320, 768, 1024 and 1440px. Screenshot review checks the reference-inspired desktop and mobile layouts.
