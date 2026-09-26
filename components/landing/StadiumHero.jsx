"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function StadiumHero({ onProgressUpdate }) {
  const containerRef = useRef(null);
  const visualStageRef = useRef(null);

  // Stage layer refs
  const stage1Ref = useRef(null);
  const stage2Ref = useRef(null);
  const stage3Ref = useRef(null);
  const stage4Ref = useRef(null);
  const stage5Ref = useRef(null);

  // Stage badges refs
  const badge1Ref = useRef(null);
  const badge2Ref = useRef(null);
  const badge3Ref = useRef(null);
  const badge4Ref = useRef(null);
  const badge5Ref = useRef(null);

  const [activeStage, setActiveStage] = useState(1);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const stage = visualStageRef.current;
    const s1 = stage1Ref.current;
    const s2 = stage2Ref.current;
    const s3 = stage3Ref.current;
    const s4 = stage4Ref.current;
    const s5 = stage5Ref.current;

    const b1 = badge1Ref.current;
    const b2 = badge2Ref.current;
    const b3 = badge3Ref.current;
    const b4 = badge4Ref.current;
    const b5 = badge5Ref.current;

    if (!stage || !s1 || !s2 || !s3 || !s4 || !s5) return;

    // --- 1. 3D MOUSE PARALLAX TILT ACROSS ALL 5 STAGES ---
    const xTo = gsap.quickTo(stage, "rotationY", { duration: 0.8, ease: "power2.out" });
    const yTo = gsap.quickTo(stage, "rotationX", { duration: 0.8, ease: "power2.out" });

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const mouseX = ((e.clientX / innerWidth) - 0.5) * 8; // -4deg to +4deg
      const mouseY = -((e.clientY / innerHeight) - 0.5) * 6; // -3deg to +3deg
      xTo(mouseX);
      yTo(mouseY);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Initial states for all 5 stages
    gsap.set(s1, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, zIndex: 10 });
    gsap.set(s2, { opacity: 0, scale: 0.85, zIndex: 9 });
    gsap.set(s3, { opacity: 0, scale: 0.85, zIndex: 8 });
    gsap.set(s4, { opacity: 0, scale: 0.85, zIndex: 7 });
    gsap.set(s5, { opacity: 0, scale: 0.85, zIndex: 6 });

    if (b1) gsap.set(b1, { opacity: 1, scale: 1 });
    if (b2) gsap.set(b2, { opacity: 0, scale: 0.8, y: 20 });
    if (b3) gsap.set(b3, { opacity: 0, scale: 0.8, y: 20 });
    if (b4) gsap.set(b4, { opacity: 0, scale: 0.8, y: 20 });
    if (b5) gsap.set(b5, { opacity: 0, scale: 0.8, y: 20 });

    // --- 2. MASTER GSAP SCROLL TIMELINE (0.00 -> 1.00) ---
    const tl = gsap.timeline({ paused: true });

    // ==========================================
    // PHASE 1: STADIUM (0.00 -> 0.22)
    // ==========================================
    tl.to(
      s1,
      {
        scale: 1.6,
        xPercent: 10,
        yPercent: -4,
        ease: "power1.inOut",
        duration: 0.18,
      },
      0
    );

    // Transition S1 -> S2 (0.16 -> 0.22)
    tl.to(
      s1,
      {
        opacity: 0,
        scale: 1.9,
        ease: "power2.in",
        duration: 0.06,
      },
      0.16
    );

    if (b1) {
      tl.to(
        b1,
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.05,
        },
        0.14
      );
    }

    // ==========================================
    // PHASE 2: SEAT (0.18 -> 0.42)
    // ==========================================
    tl.to(
      s2,
      {
        opacity: 1,
        scale: 1.05,
        ease: "power2.out",
        duration: 0.08,
      },
      0.18
    );

    tl.to(
      s2,
      {
        scale: 1.2,
        xPercent: -3,
        ease: "none",
        duration: 0.14,
      },
      0.24
    );

    if (b2) {
      tl.to(
        b2,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "back.out(1.4)",
          duration: 0.07,
        },
        0.22
      );
    }

    // Transition S2 -> S3 (0.36 -> 0.42)
    tl.to(
      s2,
      {
        opacity: 0,
        scale: 1.35,
        ease: "power2.in",
        duration: 0.06,
      },
      0.36
    );

    if (b2) {
      tl.to(
        b2,
        {
          opacity: 0,
          scale: 0.8,
          y: -15,
          duration: 0.05,
        },
        0.35
      );
    }

    // ==========================================
    // PHASE 3: TICKET CREDENTIAL (0.38 -> 0.62)
    // ==========================================
    tl.to(
      s3,
      {
        opacity: 1,
        scale: 1.0,
        rotationY: 0,
        ease: "power2.out",
        duration: 0.08,
      },
      0.38
    );

    tl.to(
      s3,
      {
        scale: 1.15,
        rotationY: 6,
        yPercent: -3,
        ease: "none",
        duration: 0.14,
      },
      0.44
    );

    if (b3) {
      tl.to(
        b3,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "back.out(1.4)",
          duration: 0.07,
        },
        0.42
      );
    }

    // Transition S3 -> S4 (0.56 -> 0.62)
    tl.to(
      s3,
      {
        opacity: 0,
        scale: 1.35,
        ease: "power2.in",
        duration: 0.06,
      },
      0.56
    );

    if (b3) {
      tl.to(
        b3,
        {
          opacity: 0,
          scale: 0.8,
          y: -15,
          duration: 0.05,
        },
        0.55
      );
    }

    // ==========================================
    // PHASE 4: AUTONOMOUS MOBILITY (0.58 -> 0.82)
    // ==========================================
    tl.to(
      s4,
      {
        opacity: 1,
        scale: 1.0,
        xPercent: 0,
        ease: "power2.out",
        duration: 0.08,
      },
      0.58
    );

    tl.to(
      s4,
      {
        scale: 1.2,
        xPercent: 4,
        ease: "none",
        duration: 0.14,
      },
      0.64
    );

    if (b4) {
      tl.to(
        b4,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "back.out(1.4)",
          duration: 0.07,
        },
        0.62
      );
    }

    // Transition S4 -> S5 (0.76 -> 0.82)
    tl.to(
      s4,
      {
        opacity: 0,
        scale: 1.35,
        ease: "power2.in",
        duration: 0.06,
      },
      0.76
    );

    if (b4) {
      tl.to(
        b4,
        {
          opacity: 0,
          scale: 0.8,
          y: -15,
          duration: 0.05,
        },
        0.75
      );
    }

    // ==========================================
    // PHASE 5: HOTEL & RECONCILIATION (0.78 -> 1.00)
    // ==========================================
    tl.to(
      s5,
      {
        opacity: 1,
        scale: 1.0,
        ease: "power2.out",
        duration: 0.08,
      },
      0.78
    );

    tl.to(
      s5,
      {
        scale: 1.08,
        yPercent: -2,
        ease: "none",
        duration: 0.14,
      },
      0.84
    );

    if (b5) {
      tl.to(
        b5,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "back.out(1.4)",
          duration: 0.07,
        },
        0.82
      );
    }

    // Bind timeline to ScrollTrigger with smooth scrub
    const st = ScrollTrigger.create({
      trigger: ".lp-scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        tl.progress(p);
        setScrollPct(Math.round(p * 100));

        if (p < 0.2) {
          setActiveStage(1);
        } else if (p < 0.4) {
          setActiveStage(2);
        } else if (p < 0.6) {
          setActiveStage(3);
        } else if (p < 0.8) {
          setActiveStage(4);
        } else {
          setActiveStage(5);
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

  const scrollToStage = (stageNum) => {
    const scrollTrack = document.querySelector(".lp-scroll-track");
    if (!scrollTrack) return;
    const trackHeight = scrollTrack.offsetHeight;
    const targetMap = { 1: 0.02, 2: 0.28, 3: 0.48, 4: 0.68, 5: 0.88 };
    const targetScroll = (targetMap[stageNum] || 0) * trackHeight;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <div className="lp-viewport" ref={containerRef}>
      {/* 3D Perspective Stage Container */}
      <div className="lp-stadium-stage" ref={visualStageRef}>

        {/* ========================================================= */}
        {/* STAGE 1: MACRO VENUE (STADIUM) */}
        {/* ========================================================= */}
        <div className="lp-stage-layer" ref={stage1Ref}>
          <div className="lp-stadium-wrapper">
            <img
              src="/cinematic/stadium_master.webp"
              alt="STADIA Venue Model"
              className="lp-stadium-master-asset"
            />

            {/* SVG Ingress Corridors & Radar Mesh */}
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

              {/* Ingress: West Arterial to Gate 02 */}
              <path
                d="M 120 780 C 260 740, 380 680, 520 620 C 620 575, 720 560, 830 580"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="8 12"
                className="lp-flow-line-fast"
                filter="url(#corridor-glow)"
                opacity="0.85"
              />

              {/* Ingress: North Bus Loop to Gate 01 */}
              <path
                d="M 820 120 C 900 220, 1020 280, 1150 340 C 1220 375, 1260 420, 1310 470"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="8 12"
                className="lp-flow-line-med"
                filter="url(#corridor-glow)"
                opacity="0.8"
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

            {/* Stage 1 Gate Markers */}
            <div className="lp-stadium-overlays" ref={badge1Ref}>
              <div className="lp-telemetry-chip pos-gate-west">
                <span className="lp-chip-dot dot-pulse" />
                <div className="lp-chip-body">
                  <span className="lp-chip-title">GATE 02 // WEST</span>
                  <span className="lp-chip-stat">INFLOW: 842/min · 92% CAP</span>
                </div>
              </div>

              <div className="lp-telemetry-chip pos-gate-north">
                <span className="lp-chip-dot dot-pulse" />
                <div className="lp-chip-body">
                  <span className="lp-chip-title">GATE 01 // NORTH</span>
                  <span className="lp-chip-stat">INFLOW: 620/min · PACED</span>
                </div>
              </div>

              <div className="lp-telemetry-chip pos-gate-east">
                <span className="lp-chip-dot" />
                <div className="lp-chip-body">
                  <span className="lp-chip-title">GATE 03 // EAST</span>
                  <span className="lp-chip-stat">EGRESS CORRIDOR · CLEAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 2: SEAT ALLOCATION (ATTENDEE NODE) */}
        {/* ========================================================= */}
        <div className="lp-stage-layer" ref={stage2Ref}>
          <div className="lp-stage-asset-wrapper">
            <img
              src="/cinematic/seat.webp"
              alt="STADIA Seat Allocation"
              className="lp-stage-img"
            />

            {/* Seat Radar Crosshairs */}
            <svg className="lp-stage-svg-overlay" viewBox="0 0 1920 1080" fill="none">
              <circle cx="1100" cy="540" r="160" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 6" />
              <circle cx="1100" cy="540" r="280" stroke="rgba(255,255,255,0.1)" strokeDasharray="6 8" />
              <line x1="1100" y1="240" x2="1100" y2="840" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 5" />
              <line x1="800" y1="540" x2="1400" y2="540" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 5" />
            </svg>

            {/* Seat Focus Badge */}
            <div className="lp-stage-badge pos-left-center" ref={badge2Ref}>
              <div className="lp-badge-header">
                <span className="lp-badge-tag">STAGE 02 // ATTENDEE NODE</span>
                <span className="lp-badge-id">TOKEN #48291</span>
              </div>
              <div className="lp-badge-seat">
                SECTOR A12 <strong>ROW 18 · SEAT 24</strong>
              </div>
              <div className="lp-badge-match">
                WEST GRANDSTAND · IN-BOWL COORD [48.2, 19.4]
              </div>
              <div className="lp-badge-status">
                <span className="lp-dot-online" />
                TURNSTILE VERIFIED // IN-SEAT PACING ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 3: DIGITAL CREDENTIAL (IDENTITY) */}
        {/* ========================================================= */}
        <div className="lp-stage-layer" ref={stage3Ref}>
          <div className="lp-stage-asset-wrapper">
            <img
              src="/cinematic/ticket.webp"
              alt="STADIA Digital Credential"
              className="lp-stage-img"
            />

            {/* Scanning Laser SVG */}
            <svg className="lp-stage-svg-overlay" viewBox="0 0 1920 1080" fill="none">
              <line
                x1="700"
                y1="480"
                x2="1220"
                y2="480"
                stroke="#ffffff"
                strokeWidth="2"
                filter="url(#corridor-glow)"
                className="lp-laser-scan-line"
              />
            </svg>

            {/* Credential Token Badge */}
            <div className="lp-stage-badge pos-right-center" ref={badge3Ref}>
              <div className="lp-badge-header">
                <span className="lp-badge-tag">STAGE 03 // ACCESS IDENTITY</span>
                <span className="lp-badge-id">ENCRYPTED NFC</span>
              </div>
              <div className="lp-badge-seat">
                STADIA CREDENTIAL <strong>ALL-ACCESS VIP</strong>
              </div>
              <div className="lp-badge-match">
                CRYPTOGRAPHIC SIGNATURE: 0x9f4a...82c1
              </div>
              <div className="lp-badge-status">
                <span className="lp-dot-online" />
                TURNSTILE PASS 0.4s · BIOMETRIC CLEARED
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 4: AUTONOMOUS MOBILITY (FLEET) */}
        {/* ========================================================= */}
        <div className="lp-stage-layer" ref={stage4Ref}>
          <div className="lp-stage-asset-wrapper">
            <img
              src="/cinematic/shuttle.webp"
              alt="STADIA Autonomous Mobility"
              className="lp-stage-img"
            />

            {/* Arterial Vector Overlay */}
            <svg className="lp-stage-svg-overlay" viewBox="0 0 1920 1080" fill="none">
              <path
                d="M 100 820 L 700 740 L 1400 740 L 1880 880"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="12 16"
                className="lp-flow-line-fast"
                filter="url(#corridor-glow)"
                opacity="0.85"
              />
            </svg>

            {/* Mobility Fleet Badge */}
            <div className="lp-stage-badge pos-left-center" ref={badge4Ref}>
              <div className="lp-badge-header">
                <span className="lp-badge-tag">STAGE 04 // MULTIMODAL TRANSIT</span>
                <span className="lp-badge-id">ROUTE ARTERIAL-04</span>
              </div>
              <div className="lp-badge-seat">
                AUTONOMOUS SHUTTLE FLEET <strong>34 ACTIVE</strong>
              </div>
              <div className="lp-badge-match">
                GREEN WAVE SIGNAL PRIORITY // SPEED 42 KM/H
              </div>
              <div className="lp-badge-status">
                <span className="lp-dot-online" />
                CONGESTION RELIEF DISPATCH // 14 MIN DISPERSAL
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 5: HOSPITALITY RECONCILIATION (HOTEL) */}
        {/* ========================================================= */}
        <div className="lp-stage-layer" ref={stage5Ref}>
          <div className="lp-stage-asset-wrapper">
            <img
              src="/cinematic/hotel.webp"
              alt="STADIA Hospitality Terminal"
              className="lp-stage-img"
            />

            {/* Terminal Arrival Pulse SVG */}
            <svg className="lp-stage-svg-overlay" viewBox="0 0 1920 1080" fill="none">
              <ellipse cx="960" cy="780" rx="380" ry="120" stroke="rgba(255,255,255,0.25)" strokeDasharray="6 8" />
              <ellipse cx="960" cy="780" rx="220" ry="70" stroke="rgba(255,255,255,0.4)" strokeDasharray="4 6" />
            </svg>

            {/* Hospitality Reconciliation Badge */}
            <div className="lp-stage-badge pos-right-center" ref={badge5Ref}>
              <div className="lp-badge-header">
                <span className="lp-badge-tag">STAGE 05 // DESTINATION ARRIVAL</span>
                <span className="lp-badge-id">RESOLVED</span>
              </div>
              <div className="lp-badge-seat">
                METROPOLITAN TERMINAL <strong>SUITE 802 CHECK-IN</strong>
              </div>
              <div className="lp-badge-match">
                URBAN DISPERSAL & VIP ESCORT COMPLETED
              </div>
              <div className="lp-badge-status">
                <span className="lp-dot-online" />
                100% ATTENDEE JOURNEY CYCLE RECONCILED
              </div>
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
        <span className="lp-eyebrow">OPERATIONAL PHASE</span>
        <div className="lp-phase-title">
          {activeStage === 1 && "01 // MACRO VENUE SCALE"}
          {activeStage === 2 && "02 // ATTENDEE NODE · SECTOR A12"}
          {activeStage === 3 && "03 // CRYPTOGRAPHIC ACCESS TOKEN"}
          {activeStage === 4 && "04 // ARTERIAL MOBILITY FLEET"}
          {activeStage === 5 && "05 // HOSPITALITY RECONCILIATION"}
        </div>
      </div>

      {/* Interactive Timeline Navigation Scrubber (Lower Right) */}
      <div className="lp-hero-timeline-scrubber">
        <div className="lp-scrubber-pips">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => scrollToStage(num)}
              className={`lp-pip-btn ${activeStage === num ? "is-active" : ""}`}
              title={`Jump to Stage 0${num}`}
            >
              0{num}
            </button>
          ))}
        </div>
        <div className="lp-timeline-bar-hero">
          <div className="lp-progress-track">
            <div className="lp-progress-fill" style={{ width: `${scrollPct}%` }} />
          </div>
          <span className="lp-mono-stat">{scrollPct.toString().padStart(2, "0")}%</span>
        </div>
      </div>
    </div>
  );
}
