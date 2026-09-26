"use client";

import Link from "next/link";

export default function LandingSections({ progress = 0 }) {
  // Smooth envelope helper for each stage placard
  const computePlacard = (start, peakStart, peakEnd, end) => {
    if (progress < start || progress > end) return { opacity: 0, visible: false, translateY: 15 };
    let opacity = 0;
    let translateY = 0;
    if (progress < peakStart) {
      const t = (progress - start) / (peakStart - start);
      opacity = t;
      translateY = (1 - t) * 15;
    } else if (progress <= peakEnd) {
      opacity = 1;
      translateY = 0;
    } else {
      const t = (progress - peakEnd) / (end - peakEnd);
      opacity = 1 - t;
      translateY = -t * 15;
    }
    return { opacity, visible: opacity > 0.01, translateY };
  };

  // Placards calibrated to continuous spline landmarks
  const p1 = computePlacard(0.04, 0.08, 0.15, 0.18); // Stadium
  const p2 = computePlacard(0.22, 0.26, 0.34, 0.38); // Sector Entry
  const p3 = computePlacard(0.42, 0.46, 0.51, 0.54); // Seat
  const p4 = computePlacard(0.56, 0.60, 0.66, 0.70); // Ticket Credential
  const p5 = computePlacard(0.72, 0.76, 0.83, 0.86); // Mobility Fleet
  const p6 = computePlacard(0.89, 0.92, 0.97, 0.99); // Hotel

  // Bottom HUD readout label
  let hudLabel = "01 // STADIUM ARCHITECTURE";
  let hudEyebrow = "MACRO VENUE SCALE";

  if (progress > 0.18 && progress <= 0.38) {
    hudLabel = "02 // WEST SECTOR INGRESS";
    hudEyebrow = "CORRIDOR PACING";
  } else if (progress > 0.38 && progress <= 0.54) {
    hudLabel = "03 // SEAT ALLOCATION";
    hudEyebrow = "WEST STAND · SEC A12 · R18 · S24";
  } else if (progress > 0.54 && progress <= 0.70) {
    hudLabel = "04 // CREDENTIAL TOKEN";
    hudEyebrow = "SECURE ACCESS IDENTITY";
  } else if (progress > 0.70 && progress <= 0.87) {
    hudLabel = "05 // MOBILITY CORRIDOR";
    hudEyebrow = "PRIORITY ARTERIAL ROUTE";
  } else if (progress > 0.87) {
    hudLabel = "06 // HOSPITALITY TERMINAL";
    hudEyebrow = "DESTINATION RECONCILIATION";
  }

  // Hero overlay visibility
  const heroOpacity = Math.max(0, 1 - progress * 16);
  const heroTransform = `translateY(${progress * -90}px)`;

  const handleExploreClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: window.innerHeight * 1.5, behavior: "smooth" });
  };

  return (
    <>
      {/* Hero Overlay (Only visible at start of journey) */}
      <div
        className="lp-hero-content"
        style={{
          opacity: heroOpacity,
          transform: heroTransform,
          pointerEvents: heroOpacity > 0.05 ? "auto" : "none",
        }}
      >
        <div className="lp-hero-eyebrow">INTELLIGENT EVENT ORCHESTRATION</div>
        <h1 className="lp-hero-title">
          THE JOURNEY
          <strong>IS THE CROWD.</strong>
        </h1>
        <p className="lp-hero-desc">
          STADIA connects the complete attendee journey — from ticket issuance and stadium
          access to autonomous transport and hospitality — through one synchronized operational layer.
        </p>
        <div className="lp-hero-actions">
          <button onClick={handleExploreClick} className="lp-btn-primary">
            Explore Stadia ↓
          </button>
          <Link href="/command-center" className="lp-btn-secondary">
            Enter Platform ↗
          </Link>
        </div>
      </div>

      {/* Synchronized Stage Placards (Appear only when 3D object is settled) */}
      <div className="lp-placard-layer">
        {/* Stage 1: Stadium */}
        {p1.visible && (
          <div
            className="lp-stage-placard pos-left"
            style={{
              opacity: p1.opacity,
              transform: `translateY(${p1.translateY}px)`,
            }}
          >
            <div className="lp-placard-kicker">STAGE 01 // MACRO ARCHITECTURE</div>
            <h2 className="lp-placard-title">THE VENUE MODEL</h2>
            <p className="lp-placard-desc">
              Mega events begin at macro venue scale. Over 65,000 spectators converge from across the
              metropolis into a single physical coordinate.
            </p>
          </div>
        )}

        {/* Stage 2: Sector Ingress */}
        {p2.visible && (
          <div
            className="lp-stage-placard pos-right"
            style={{
              opacity: p2.opacity,
              transform: `translateY(${p2.translateY}px)`,
            }}
          >
            <div className="lp-placard-kicker">STAGE 02 // SECTOR PACING</div>
            <h2 className="lp-placard-title">WEST CONCOURSE ENTRY</h2>
            <p className="lp-placard-desc">
              Camera descends through the perimeter gates into the grandstand concourse. Dynamic gate
              valves regulate inflow velocity before density peaks.
            </p>
          </div>
        )}

        {/* Stage 3: The Seat */}
        {p3.visible && (
          <div
            className="lp-stage-placard pos-left"
            style={{
              opacity: p3.opacity,
              transform: `translateY(${p3.translateY}px)`,
            }}
          >
            <div className="lp-placard-kicker">STAGE 03 // THE ATTENDEE NODE</div>
            <h2 className="lp-placard-title">SEAT 24 · ROW 18</h2>
            <p className="lp-placard-desc">
              Every crowd is a synchronized constellation of individual seats. Sector A12, Row 18, Seat 24
              anchors the attendee in the event state machine.
            </p>
          </div>
        )}

        {/* Stage 4: The Credential */}
        {p4.visible && (
          <div
            className="lp-stage-placard pos-right"
            style={{
              opacity: p4.opacity,
              transform: `translateY(${p4.translateY}px)`,
            }}
          >
            <div className="lp-placard-kicker">STAGE 04 // ACCESS TOKEN</div>
            <h2 className="lp-placard-title">DIGITAL CREDENTIAL</h2>
            <p className="lp-placard-desc">
              Physical seat lines unfold into a verified digital token. One cryptographically signed badge
              coordinates gate turnstiles, in-bowl routing, and return transit.
            </p>
          </div>
        )}

        {/* Stage 5: Mobility Fleet */}
        {p5.visible && (
          <div
            className="lp-stage-placard pos-left"
            style={{
              opacity: p5.opacity,
              transform: `translateY(${p5.translateY}px)`,
            }}
          >
            <div className="lp-placard-kicker">STAGE 05 // MULTIMODAL TRANSIT</div>
            <h2 className="lp-placard-title">ARTERIAL PRIORITY</h2>
            <p className="lp-placard-desc">
              Egress congestion is prevented upstream. Autonomous shuttle fleets receive green wave signal
              priority, clearing transit corridors minutes before whistle.
            </p>
          </div>
        )}

        {/* Stage 6: Hotel Arrival */}
        {p6.visible && (
          <div
            className="lp-stage-placard pos-right"
            style={{
              opacity: p6.opacity,
              transform: `translateY(${p6.translateY}px)`,
            }}
          >
            <div className="lp-placard-kicker">STAGE 06 // HOSPITALITY RECONCILIATION</div>
            <h2 className="lp-placard-title">DESTINATION ARRIVAL</h2>
            <p className="lp-placard-desc">
              The attendee journey reaches resolution. Partner hotel check-in, VIP security, and urban
              dispersal are fully recorded and reconciled in real time.
            </p>
          </div>
        )}
      </div>

      {/* Floating Wireframe HUD */}
      <div className="lp-hud">
        <div className="lp-phase-indicator">
          <span className="lp-eyebrow">{hudEyebrow}</span>
          <div className="lp-phase-title">{hudLabel}</div>
        </div>

        <div className="lp-timeline-bar">
          <div className="lp-progress-track">
            <div
              className="lp-progress-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="lp-mono-stat">{Math.round(progress * 100).toString().padStart(2, "0")}%</span>
        </div>
      </div>

      {/* Virtual Scroll Container for smooth GSAP scrub control */}
      <div className="lp-scroll-track" />

      {/* Post-Journey Editorial Sections */}
      <section className="lp-editorial">
        <div id="problem" className="lp-section">
          <div className="lp-section-kicker">01 // THE SYSTEM PROBLEM</div>
          <h2 className="lp-section-heading">
            MEGA EVENTS DON'T FAIL <strong>IN ONE PLACE.</strong>
          </h2>
          <p className="lp-section-body">
            Congestion is rarely caused by a single gate, road, shuttle, or security checkpoint.
            It emerges when tens of thousands of individual journeys collide across isolated operational
            silos. Traditional event operations respond to symptoms at bottlenecks rather than anticipating
            the systemic flow upstream.
          </p>

          <div className="lp-network-track">
            <div className="lp-network-node">01 TICKET ISSUANCE</div>
            <div className="lp-network-arrow">→</div>
            <div className="lp-network-node">02 URBAN TRANSIT</div>
            <div className="lp-network-arrow">→</div>
            <div className="lp-network-node">03 PERIMETER GATES</div>
            <div className="lp-network-arrow">→</div>
            <div className="lp-network-node">04 SEAT ASSIGNMENT</div>
            <div className="lp-network-arrow">→</div>
            <div className="lp-network-node">05 CONCOURSE EGRESS</div>
            <div className="lp-network-arrow">→</div>
            <div className="lp-network-node">06 MOBILITY FLEET</div>
            <div className="lp-network-arrow">→</div>
            <div className="lp-network-node">07 HOSPITALITY SYNC</div>
          </div>
        </div>

        <div className="lp-section">
          <div className="lp-section-kicker">02 // THE ARCHITECTURAL SHIFT</div>
          <h2 className="lp-section-heading">
            MANAGE THE JOURNEY. <strong>AND YOU MANAGE THE CROWD.</strong>
          </h2>
          <p className="lp-section-body">
            Attendee behavior inside the bowl is directly governed by external transit timing,
            credential distribution, and perimeter pacing. When all stakeholders share a single
            predictive state model, crowd surges are dissipated 20 minutes before physical density peaks.
          </p>
        </div>

        <div id="architecture" className="lp-section">
          <div className="lp-section-kicker">03 // UNIFIED EVENT MESH</div>
          <h2 className="lp-section-heading">
            FIVE STAKEHOLDERS. <strong>ONE IMMUTABLE TRUTH.</strong>
          </h2>
          <p className="lp-section-body">
            STADIA replaces isolated radios, spreadsheets, and separate dispatch centers with an
            integrated event state engine updated at sub-second frequency.
          </p>

          <div className="lp-stages-grid">
            <div className="lp-stage-card">
              <div className="lp-stage-num">01 / VENUE</div>
              <div className="lp-stage-title">Turnstiles & Concourses</div>
              <div className="lp-stage-desc">
                High-throughput optical gates, concourse density pressure sensors, and adaptive egress routing.
              </div>
            </div>

            <div className="lp-stage-card">
              <div className="lp-stage-num">02 / GROUND</div>
              <div className="lp-stage-title">Stewards & Security</div>
              <div className="lp-stage-desc">
                Automated incident dispatch, perimeter barricade management, and real-time medical escort corridors.
              </div>
            </div>

            <div className="lp-stage-card">
              <div className="lp-stage-num">03 / TRANSPORT</div>
              <div className="lp-stage-title">Fleets & Corridors</div>
              <div className="lp-stage-desc">
                Smart shuttle balancing, dynamic signal priority vectors, and arterial congestion relief dispatch.
              </div>
            </div>

            <div className="lp-stage-card">
              <div className="lp-stage-num">04 / ORGANIZER</div>
              <div className="lp-stage-title">Executive Command</div>
              <div className="lp-stage-desc">
                Global event timeline calibration, match scheduling sync, and automated inter-agency broadcast feeds.
              </div>
            </div>

            <div className="lp-stage-card">
              <div className="lp-stage-num">05 / HOSPITALITY</div>
              <div className="lp-stage-title">VIP & Partners</div>
              <div className="lp-stage-desc">
                Hotel arrival check-in sync, luxury fleet pre-positioning, and frictionless verified VIP credentials.
              </div>
            </div>
          </div>
        </div>

        <div className="lp-section">
          <div className="lp-section-kicker">04 // ORCHESTRATION PIPELINE</div>
          <h2 className="lp-section-heading">
            CONTINUOUS <strong>AUTONOMOUS CONTROL.</strong>
          </h2>
          <p className="lp-section-body">
            Five synchronized stages execute cyclically throughout the event lifecycle:
          </p>

          <div className="lp-stages-grid">
            <div className="lp-stage-card">
              <div className="lp-stage-num">STAGE 01</div>
              <div className="lp-stage-title">Configure</div>
              <div className="lp-stage-desc">
                Ingest venue spatial geometry, gate limits, transit schedules, and historical crowd velocity profiles.
              </div>
            </div>

            <div className="lp-stage-card">
              <div className="lp-stage-num">STAGE 02</div>
              <div className="lp-stage-title">Observe</div>
              <div className="lp-stage-desc">
                Aggregate turnstile deltas, vehicle GPS coordinates, sensor telemetry, and steward incident alerts.
              </div>
            </div>

            <div className="lp-stage-card">
              <div className="lp-stage-num">STAGE 03</div>
              <div className="lp-stage-title">Predict</div>
              <div className="lp-stage-desc">
                Forecast surge velocities and queuing buildup up to 25 minutes prior to physical manifestation.
              </div>
            </div>

            <div className="lp-stage-card">
              <div className="lp-stage-num">STAGE 04</div>
              <div className="lp-stage-title">Dispatch</div>
              <div className="lp-stage-desc">
                Deploy dynamic gate valves, shuttle reassignments, and targeted crowd guidance notifications.
              </div>
            </div>

            <div className="lp-stage-card">
              <div className="lp-stage-num">STAGE 05</div>
              <div className="lp-stage-title">Resolve</div>
              <div className="lp-stage-desc">
                Close perimeter loops, log response metrics, and publish automated audit records for safety authorities.
              </div>
            </div>
          </div>
        </div>

        <div id="platform" className="lp-section">
          <div className="lp-section-kicker">05 // OPERATIONAL PLATFORM</div>
          <h2 className="lp-section-heading">
            BUILT FOR <strong>REAL-TIME OPERATIONS.</strong>
          </h2>
          <p className="lp-section-body">
            Explore the deployed operational consoles governing live venues worldwide:
          </p>

          <div className="lp-platform-grid">
            <Link href="/command-center" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Command Center ↗</h4>
              <p>
                Panoramic radar, real-time stadium corridor telemetry, health metrics, and automated alert dispatch.
              </p>
            </Link>

            <Link href="/ground" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Ground Dispatch ↗</h4>
              <p>
                Perimeter gate status, steward zone tracking, medical rapid-response teams, and gate pressure relief.
              </p>
            </Link>

            <Link href="/transport" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Transport Operations ↗</h4>
              <p>
                Autonomous shuttle tracking, arterial signal clearance vectors, congestion heatmaps, and bus dispatch.
              </p>
            </Link>

            <Link href="/event-control" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Incident Response ↗</h4>
              <p>
                Structured SOP playbooks, inter-agency escalation workflows, and coordinated emergency protocols.
              </p>
            </Link>

            <Link href="/analytics" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Event Analytics ↗</h4>
              <p>
                Ingress/egress throughput curves, gate efficiency analysis, incident response latency, and safety audits.
              </p>
            </Link>

            <Link href="/command-center" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Master Simulation ↗</h4>
              <p>
                Synthetic stress-testing engine simulating catastrophic transit failures and surge cascades.
              </p>
            </Link>
          </div>
        </div>

        <div className="lp-final-cta">
          <div className="lp-section-kicker">THE COMPLETE PLATFORM</div>
          <h2>
            EVERY EVENT HAS A JOURNEY.
            <strong>STADIA ORCHESTRATES IT.</strong>
          </h2>
          <Link href="/command-center" className="lp-btn-primary">
            Enter STADIA Platform ↗
          </Link>
        </div>
      </section>
    </>
  );
}
