"use client";

import Link from "next/link";

export default function LandingSections({ progress = 0 }) {
  // Compute smooth opacity for stage labels (0.0 to 1.0)
  const computeLabel = (start, peakStart, peakEnd, end) => {
    if (progress < start || progress > end) return { opacity: 0, visible: false, translateY: 10 };
    let opacity = 0;
    let translateY = 0;
    if (progress < peakStart) {
      const t = (progress - start) / (peakStart - start);
      opacity = t;
      translateY = (1 - t) * 10;
    } else if (progress <= peakEnd) {
      opacity = 1;
      translateY = 0;
    } else {
      const t = (progress - peakEnd) / (end - peakEnd);
      opacity = 1 - t;
      translateY = -t * 10;
    }
    return { opacity, visible: opacity > 0.01, translateY };
  };

  // Subtle inline stage labels along the single line
  const l1 = computeLabel(0.04, 0.08, 0.16, 0.20); // STADIUM // THE VENUE
  const l2 = computeLabel(0.22, 0.26, 0.34, 0.38); // SEAT // THE EXPERIENCE
  const l3 = computeLabel(0.40, 0.44, 0.54, 0.58); // TICKET // THE IDENTITY
  const l4 = computeLabel(0.60, 0.64, 0.74, 0.78); // CAR // THE MOVEMENT
  const l5 = computeLabel(0.80, 0.84, 0.94, 0.97); // HOTEL // THE DESTINATION

  // Final conclusion moment (revealed when line reaches HOTEL and settles)
  const isFinalMoment = progress >= 0.94;
  const finalOpacity = Math.min(1, Math.max(0, (progress - 0.94) / 0.05));

  // Hero overlay visibility (fades out as drawing commences)
  const heroOpacity = Math.max(0, 1 - progress * 14);
  const heroTransform = `translateY(${progress * -80}px)`;

  const handleExploreClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: window.innerHeight * 1.5, behavior: "smooth" });
  };

  return (
    <>
      {/* Hero Intro (Visible at start) */}
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
          STADIA connects the complete event journey — from ticket and entry to transport and
          hospitality — through one shared operational layer.
        </p>
        <div className="lp-hero-actions">
          <button onClick={handleExploreClick} className="lp-btn-primary">
            Explore Journey ↓
          </button>
          <Link href="/command-center" className="lp-btn-secondary">
            Enter Platform ↗
          </Link>
        </div>
      </div>

      {/* Subtle Architectural Stage Labels (Clean, minimal, no bulky cards) */}
      <div className="lp-line-labels-layer">
        {/* Stage 1: Stadium */}
        {l1.visible && (
          <div
            className="lp-minimal-label pos-bottom-left"
            style={{
              opacity: l1.opacity,
              transform: `translateY(${l1.translateY}px)`,
            }}
          >
            <span className="lp-label-num">01 / STADIUM</span>
            <span className="lp-label-sub">THE VENUE</span>
          </div>
        )}

        {/* Stage 2: Seat */}
        {l2.visible && (
          <div
            className="lp-minimal-label pos-bottom-left"
            style={{
              opacity: l2.opacity,
              transform: `translateY(${l2.translateY}px)`,
            }}
          >
            <span className="lp-label-num">02 / SEAT</span>
            <span className="lp-label-sub">THE EXPERIENCE</span>
          </div>
        )}

        {/* Stage 3: Ticket */}
        {l3.visible && (
          <div
            className="lp-minimal-label pos-bottom-left"
            style={{
              opacity: l3.opacity,
              transform: `translateY(${l3.translateY}px)`,
            }}
          >
            <span className="lp-label-num">03 / TICKET</span>
            <span className="lp-label-sub">THE IDENTITY</span>
          </div>
        )}

        {/* Stage 4: Car */}
        {l4.visible && (
          <div
            className="lp-minimal-label pos-bottom-left"
            style={{
              opacity: l4.opacity,
              transform: `translateY(${l4.translateY}px)`,
            }}
          >
            <span className="lp-label-num">04 / CAR</span>
            <span className="lp-label-sub">THE MOVEMENT</span>
          </div>
        )}

        {/* Stage 5: Hotel */}
        {l5.visible && !isFinalMoment && (
          <div
            className="lp-minimal-label pos-bottom-left"
            style={{
              opacity: l5.opacity,
              transform: `translateY(${l5.translateY}px)`,
            }}
          >
            <span className="lp-label-num">05 / HOTEL</span>
            <span className="lp-label-sub">THE DESTINATION</span>
          </div>
        )}

        {/* Final Moment: When the line reaches HOTEL and settles */}
        {isFinalMoment && (
          <div
            className="lp-final-moment-overlay"
            style={{
              opacity: finalOpacity,
              transform: `translateY(${(1 - finalOpacity) * 20}px)`,
              pointerEvents: finalOpacity > 0.5 ? "auto" : "none",
            }}
          >
            <div className="lp-final-kicker">ONE LINE · ONE JOURNEY</div>
            <h2 className="lp-final-headline">
              EVERY EVENT
              <strong>HAS A JOURNEY.</strong>
              <span>STADIA ORCHESTRATES IT.</span>
            </h2>
            <Link href="/command-center" className="lp-btn-enter-stadia">
              ENTER STADIA ↗
            </Link>
          </div>
        )}
      </div>

      {/* Floating HUD: Journey Percentage Counter */}
      <div className="lp-hud">
        <div className="lp-timeline-bar">
          <span className="lp-mono-stat">JOURNEY PROGRESS</span>
          <div className="lp-progress-track">
            <div
              className="lp-progress-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="lp-mono-stat">{Math.round(progress * 100).toString().padStart(2, "0")}%</span>
        </div>
      </div>

      {/* Virtual Scroll Container for GSAP ScrollTrigger scrub */}
      <div className="lp-scroll-track" />

      {/* Post-Journey Platform Narrative */}
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

        <div id="platform" className="lp-section">
          <div className="lp-section-kicker">04 // OPERATIONAL SUITE</div>
          <h2 className="lp-section-heading">
            DEPLOYED FOR <strong>LIVE VENUES.</strong>
          </h2>
          <div className="lp-platform-grid">
            <Link href="/command-center" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Command Center ↗</h4>
              <p>Panoramic situational radar, multi-agency corridor alerts, and live operational mesh.</p>
            </Link>

            <Link href="/ground" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Ground Dispatch ↗</h4>
              <p>Perimeter gate status, steward zones, turnstile flow balancing, and medical corridors.</p>
            </Link>

            <Link href="/transport" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Transport Operations ↗</h4>
              <p>Shuttle telemetry, signal priority vectors, congestion clearing, and bus fleet routing.</p>
            </Link>

            <Link href="/event-control" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Incident Response ↗</h4>
              <p>Structured SOP playbooks, inter-agency escalation workflows, and emergency protocols.</p>
            </Link>

            <Link href="/analytics" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Event Analytics ↗</h4>
              <p>Post-event throughput debriefs, egress curves, and compliance reports.</p>
            </Link>

            <Link href="/command-center" className="lp-platform-card" style={{ textDecoration: "none", color: "inherit" }}>
              <h4>Master Simulation ↗</h4>
              <p>Synthetic stress-testing engine simulating catastrophic transit failures and surge cascades.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
