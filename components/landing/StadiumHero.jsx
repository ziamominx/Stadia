"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createStadiumTimeline, stageAt, chapterProgress, scrollDestination } from "@/lib/landing/timeline.mjs";

gsap.registerPlugin(ScrollTrigger);

export default function StadiumHero() {
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
  const progressFillRef = useRef(null);
  const progressTextRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const root = container?.closest(".lp-body");
    const track = root?.querySelector(".lp-scroll-track");
    const intro = root?.querySelector(".lp-hero-content");
    if (!track || !intro) return;

    const media = gsap.matchMedia();
    media.add({
      reduced: "(prefers-reduced-motion: reduce)",
      compact: "(max-width: 767px)",
      desktop: "(min-width: 768px)",
      pointer: "(hover: hover) and (pointer: fine)",
    }, (context) => {
      const { reduced, compact, pointer } = context.conditions;
      const stage = visualStageRef.current;
      const targets = {
        layers: [stage1Ref, stage2Ref, stage3Ref, stage4Ref, stage5Ref].map(ref => ref.current),
        badges: [badge1Ref, badge2Ref, badge3Ref, badge4Ref, badge5Ref].map(ref => ref.current),
        intro,
      };
      intro.inert = false;
      intro.removeAttribute("aria-hidden");
      setActiveStage(1);
      if (reduced) return;

      const tl = createStadiumTimeline(gsap, targets, compact);
      let previousStage = 1;
      tl.eventCallback("onUpdate", () => {
        // Read rendered progress, not the raw scroll target: captions and image
        // stay together during scrub catch-up and when reversing direction.
        const progress = tl.progress();
        const nextStage = stageAt(progress);
        if (progressFillRef.current) progressFillRef.current.style.transform = `scaleX(${progress})`;
        if (progressTextRef.current) progressTextRef.current.textContent = `${Math.round(progress * 100).toString().padStart(2, "0")}%`;
        if (nextStage !== previousStage) {
          previousStage = nextStage;
          setActiveStage(nextStage);
        }
        const hidden = progress >= 0.09;
        intro.inert = hidden;
        intro.setAttribute("aria-hidden", String(hidden));
      });

      const scroll = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        animation: tl,
        scrub: 0.65,
        invalidateOnRefresh: true,
      });

      // Initialize restored scroll positions before the first paint/update.
      tl.progress(scroll.progress);

      let resetPointer = () => {};
      let handlePointer = () => {};
      if (pointer && !compact) {
        const xTo = gsap.quickTo(stage, "rotationY", { duration: 0.65, ease: "power2.out" });
        const yTo = gsap.quickTo(stage, "rotationX", { duration: 0.65, ease: "power2.out" });
        handlePointer = (event) => {
          if (!scroll.isActive) return;
          xTo((event.clientX / window.innerWidth - 0.5) * 4);
          yTo(-(event.clientY / window.innerHeight - 0.5) * 3);
        };
        resetPointer = () => { xTo(0); yTo(0); };
        window.addEventListener("pointermove", handlePointer, { passive: true });
        document.addEventListener("pointerleave", resetPointer);
        window.addEventListener("blur", resetPointer);
      }

      // MatchMedia reverts its timeline, trigger, quickTo tweens, and inline
      // styles on unmount or breakpoint/preference changes.
      return () => {
        window.removeEventListener("pointermove", handlePointer);
        document.removeEventListener("pointerleave", resetPointer);
        window.removeEventListener("blur", resetPointer);
        intro.inert = false;
        intro.removeAttribute("aria-hidden");
      };
    }, root);

    return () => media.revert();
  }, []);

  const scrollToStage = (stageNum) => {
    const scrollTrack = document.querySelector(".lp-scroll-track");
    if (!scrollTrack) return;
    const start = scrollTrack.getBoundingClientRect().top + window.scrollY;
    const targetScroll = scrollDestination(start, scrollTrack.offsetHeight, window.innerHeight, chapterProgress[stageNum - 1]);
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
              aria-label={`Show ${["stadium", "seat", "ticket", "mobility", "hotel"][num - 1]} stage`}
              aria-current={activeStage === num ? "step" : undefined}
            >
              0{num}
            </button>
          ))}
        </div>
        <div className="lp-timeline-bar-hero">
          <div className="lp-progress-track">
            <div className="lp-progress-fill" ref={progressFillRef} />
          </div>
          <span className="lp-mono-stat" ref={progressTextRef}>00%</span>
        </div>
      </div>
    </div>
  );
}
