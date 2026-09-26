"use client";

import Link from "next/link";
import { chapterProgress, scrollDestination } from "@/lib/landing/timeline.mjs";

export default function LandingSections() {
  const handleExploreClick = (e) => {
    e.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.getElementById("problem")?.scrollIntoView({ behavior: "instant" });
      return;
    }
    const track = document.getElementById("stadium-journey");
    if (!track) return;
    const start = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: scrollDestination(start, track.offsetHeight, window.innerHeight, chapterProgress[1]),
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Hero Overlay (Only visible at start of journey) */}
      <div
        className="lp-hero-content"
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
            Explore Stadium Mesh ↓
          </button>
          <Link href="/command-center" className="lp-btn-secondary">
            Enter Platform ↗
          </Link>
        </div>
        <a className="lp-skip-journey" href="#problem">Skip animation ↓</a>
      </div>

      <div className="lp-scroll-track" id="stadium-journey" aria-hidden="true" />

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
