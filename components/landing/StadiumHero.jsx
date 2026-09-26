"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function StadiumHero({ onProgressUpdate }) {
  const containerRef = useRef(null);
  const visualStageRef = useRef(null);
  const stadiumImgRef = useRef(null);
  const overlaysGroupRef = useRef(null);
  const sectorBadgeRef = useRef(null);
  const transitBadgeRef = useRef(null);
  const gatesGroupRef = useRef(null);

  const [activeStage, setActiveStage] = useState(1);

  useEffect(() => {
    const stage = visualStageRef.current;
    const stadium = stadiumImgRef.current;
    const sectorBadge = sectorBadgeRef.current;
    const transitBadge = transitBadgeRef.current;
    const gates = gatesGroupRef.current;
    if (!stage || !stadium || !sectorBadge || !transitBadge || !gates) return;

    // --- 1. SUBTLE 3D MOUSE PARALLAX TILT ---
    let mouseX = 0;
    let mouseY = 0;
    const xTo = gsap.quickTo(stage, "rotationY", { duration: 0.8, ease: "power2.out" });
    const yTo = gsap.quickTo(stage, "rotationX", { duration: 0.8, ease: "power2.out" });

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      mouseX = ((e.clientX / innerWidth) - 0.5) * 8; // -4deg to +4deg
      mouseY = -((e.clientY / innerHeight) - 0.5) * 6; // -3deg to +3deg
      xTo(mouseX);
      yTo(mouseY);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Initial element states
    gsap.set(sectorBadge, { opacity: 0, scale: 0.7, y: 20 });
    gsap.set(transitBadge, { opacity: 0, scale: 0.7, y: 20 });
    gsap.set(gates, { opacity: 1 });

    // --- 2. MASTER GSAP SCROLLTRIGGER TIMELINE ---
    const tl = gsap.timeline({ paused: true });

    // Stage 1 -> Stage 2: Camera pushes into West Stand & Sector A12 (0.00 -> 0.45)
    tl.to(
      stadium,
      {
        scale: 1.75,
        xPercent: 12,
        yPercent: -4,
        ease: "power2.inOut",
        duration: 0.45,
      },
      0
    );

    tl.to(
      gates,
      {
        opacity: 0.35,
        ease: "power1.out",
        duration: 0.25,
      },
      0.15
    );

    tl.to(
      sectorBadge,
      {
        opacity: 1,
        scale: 1.0,
        y: 0,
        ease: "back.out(1.4)",
        duration: 0.2,
      },
      0.28
    );

    // Stage 2 hold window (0.45 -> 0.55)
    tl.to({}, { duration: 0.1 }, 0.45);

    // Stage 2 -> Stage 3: Camera pans to transit arterial corridors (0.55 -> 0.90)
    tl.to(
      sectorBadge,
      {
        opacity: 0,
        scale: 0.85,
        y: -15,
        ease: "power1.in",
        duration: 0.15,
      },
      0.55
    );

    tl.to(
      stadium,
      {
        scale: 1.4,
        xPercent: -8,
        yPercent: 8,
        ease: "power2.inOut",
        duration: 0.35,
      },
      0.55
    );

    tl.to(
      transitBadge,
      {
        opacity: 1,
        scale: 1.0,
        y: 0,
        ease: "back.out(1.4)",
        duration: 0.2,
      },
      0.68
    );

    // Settling at final stage (0.90 -> 1.00)
    tl.to(
      stadium,
      {
        scale: 1.35,
        ease: "power1.out",
        duration: 0.1,
      },
      0.90
    );

    // Bind timeline to ScrollTrigger with smooth momentum scrub
    const st = ScrollTrigger.create({
      trigger: ".lp-scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        tl.progress(p);

        if (p < 0.3) {
          setActiveStage(1);
        } else if (p < 0.65) {
          setActiveStage(2);
        } else {
          setActiveStage(3);
        }

        if (onProgressUpdate) onProgressUpdate(p);
      },
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      st.kill();
      tl.kill();
    };
  }, [onProgressUpdate]);

  return (
    <div className="lp-viewport" ref={containerRef}>
      {/* 3D Perspective Stage Container */}
      <div className="lp-stadium-stage" ref={visualStageRef}>
        {/* Architectural 3D Wireframe Master Render */}
        <div className="lp-stadium-wrapper" ref={stadiumImgRef}>
          <img
            src="/cinematic/stadium_master.webp"
            alt="STADIA Architectural Stadium Model"
            className="lp-stadium-master-asset"
          />

          {/* SVG Animated Flow Corridors Overlay */}
          <svg
            className="lp-stadium-svg-mesh"
            viewBox="0 0 1920 1080"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="corridor-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ingress Corridor: West Arterial to Gate 02 */}
            <path
              d="M 120 780 C 260 740, 380 680, 520 620 C 620 575, 720 560, 830 580"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="8 12"
              className="lp-flow-line-fast"
              filter="url(#corridor-glow)"
              opacity="0.8"
            />

            {/* Ingress Corridor: North Bus Loop to Gate 01 */}
            <path
              d="M 820 120 C 900 220, 1020 280, 1150 340 C 1220 375, 1260 420, 1310 470"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="8 12"
              className="lp-flow-line-med"
              filter="url(#corridor-glow)"
              opacity="0.8"
            />

            {/* Egress Arterial: East Gate 03 to Express Transit */}
            <path
              d="M 1480 620 C 1600 680, 1720 760, 1850 840"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="10 14"
              className="lp-flow-line-fast"
              filter="url(#corridor-glow)"
              opacity="0.9"
            />

            {/* Medical Response Priority Vector */}
            <path
              d="M 780 640 L 980 640 L 1050 710 L 1220 710"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="5 7"
              className="lp-flow-line-pulse"
              opacity="0.6"
            />

            {/* Sector A12 Structural Perimeter Highlight */}
            <polygon
              points="660,540 760,490 840,530 740,580"
              stroke="#ffffff"
              strokeWidth="2"
              fill="rgba(255, 255, 255, 0.08)"
              className="lp-sector-polygon-pulse"
            />
          </svg>

          {/* HTML Telemetry Gate Markers */}
          <div className="lp-stadium-overlays" ref={gatesGroupRef}>
            {/* Gate 02: West */}
            <div className="lp-telemetry-chip pos-gate-west">
              <span className="lp-chip-dot dot-pulse" />
              <div className="lp-chip-body">
                <span className="lp-chip-title">GATE 02 // WEST</span>
                <span className="lp-chip-stat">INFLOW: 842/min · 92% CAP</span>
              </div>
            </div>

            {/* Gate 01: North */}
            <div className="lp-telemetry-chip pos-gate-north">
              <span className="lp-chip-dot dot-pulse" />
              <div className="lp-chip-body">
                <span className="lp-chip-title">GATE 01 // NORTH</span>
                <span className="lp-chip-stat">INFLOW: 620/min · PACED</span>
              </div>
            </div>

            {/* Gate 03: East */}
            <div className="lp-telemetry-chip pos-gate-east">
              <span className="lp-chip-dot" />
              <div className="lp-chip-body">
                <span className="lp-chip-title">GATE 03 // EAST</span>
                <span className="lp-chip-stat">EGRESS CORRIDOR · CLEAR</span>
              </div>
            </div>

            {/* Gate 04: VIP South */}
            <div className="lp-telemetry-chip pos-gate-south">
              <span className="lp-chip-dot" />
              <div className="lp-chip-body">
                <span className="lp-chip-title">GATE 04 // VIP</span>
                <span className="lp-chip-stat">ESCORT ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Sector A12 Focus Badge (Appears when zoomed in) */}
          <div className="lp-sector-focus-badge" ref={sectorBadgeRef}>
            <div className="lp-badge-header">
              <span className="lp-badge-tag">ATTENDEE NODE</span>
              <span className="lp-badge-id">TOKEN #48291</span>
            </div>
            <div className="lp-badge-seat">
              SECTOR A12 <strong>ROW 18 · SEAT 24</strong>
            </div>
            <div className="lp-badge-match">
              INDIA vs AUSTRALIA · WANKHEDE
            </div>
            <div className="lp-badge-status">
              <span className="lp-dot-online" />
              TURNSTILE VERIFIED // IN-SEAT PACING
            </div>
          </div>

          {/* Transit Connector Badge (Appears in final stage) */}
          <div className="lp-transit-focus-badge" ref={transitBadgeRef}>
            <div className="lp-badge-header">
              <span className="lp-badge-tag">INTERMODAL TRANSIT</span>
              <span className="lp-badge-id">ROUTE ARTERIAL-04</span>
            </div>
            <div className="lp-badge-seat">
              AUTONOMOUS SHUTTLE FLEET <strong>34 ACTIVE</strong>
            </div>
            <div className="lp-badge-match">
              GREEN WAVE SIGNAL PRIORITY ENABLED
            </div>
            <div className="lp-badge-status">
              <span className="lp-dot-online" />
              HOTEL TERMINAL SYNC // 14 MIN DISPERSAL
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Stadium Telemetry HUD (Fixed Upper Right) */}
      <div className="lp-hero-telemetry-hud">
        <div className="lp-telemetry-box">
          <div className="lp-tel-header">
            <span className="lp-tel-live-dot" />
            <span className="lp-tel-venue">STADIA COMMAND // LIVE MESH</span>
          </div>
          <div className="lp-tel-metric">
            <span className="lp-tel-num">64,820</span>
            <span className="lp-tel-sub">/ 68,000 ATTENDEES (95.3%)</span>
          </div>
          <div className="lp-tel-row">
            <span>TURNSTILE DELTA:</span>
            <strong>+1,462 / min</strong>
          </div>
          <div className="lp-tel-row">
            <span>CORRIDOR CLEARANCE:</span>
            <strong>98.4% OPTIMAL</strong>
          </div>
        </div>
      </div>

      {/* Dynamic Scroll Stage Indicator (Lower Left) */}
      <div className="lp-hud-stage-tracker">
        <span className="lp-eyebrow">OPERATIONAL FOCUS</span>
        <div className="lp-phase-title">
          {activeStage === 1 && "01 // VENUE MACRO MESH"}
          {activeStage === 2 && "02 // SECTOR A12 ATTENDEE NODE"}
          {activeStage === 3 && "03 // TRANSIT & ARTERIAL FLOW"}
        </div>
      </div>
    </div>
  );
}
