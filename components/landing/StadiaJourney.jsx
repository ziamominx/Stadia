"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StadiaJourney({ onProgressUpdate }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const glowPathRef = useRef(null);
  const svgGroupRef = useRef(null);

  // Single continuous master SVG path traversing:
  // STADIUM (x: 200-1400) -> SEAT (x: 1800-2650) -> TICKET (x: 3050-3950) -> CAR (x: 4350-5450) -> HOTEL (x: 5680-6420)
  const masterPath = `
    M 200 700 
    L 350 700 
    L 400 450 
    L 450 350 
    Q 750 180 1050 350 
    L 1100 450 
    L 1150 700 
    L 1000 380 
    L 900 280 
    L 800 360 
    L 700 260 
    L 600 360 
    L 500 290 
    L 450 350 
    L 480 500 
    L 580 500 
    L 600 580 
    L 750 580 
    L 770 650 
    L 650 670 
    L 650 820 
    L 950 820 
    L 950 670 
    L 650 670 
    L 800 670 
    L 800 730 
    A 25 25 0 1 0 800 760 
    L 800 820 
    L 830 650 
    L 1000 650 
    L 1020 580 
    L 1120 580 
    Q 1200 680 1280 750 
    L 1400 800
    C 1550 850 1680 880 1850 850
    L 2000 850 
    L 2080 850 
    L 2080 720 
    L 2040 720 
    L 2040 680 
    L 2100 680 
    L 2300 680 
    C 2340 680 2360 690 2370 720 
    L 2350 740 
    C 2330 720 2300 710 2220 710 
    L 2120 710 
    C 2100 710 2090 690 2100 670 
    C 2100 620 2110 520 2120 440 
    C 2125 390 2160 360 2210 360 
    C 2260 360 2280 390 2270 450 
    C 2260 520 2240 600 2220 670 
    L 2160 540 
    L 2240 540
    L 2220 590
    C 2260 590 2280 605 2280 625
    A 15 15 0 1 1 2280 626
    L 2240 635
    L 2120 635
    C 2320 635 2400 670 2520 720 
    L 2650 750
    C 2750 780 2880 790 3050 720
    L 3380 400 
    L 3420 340 
    L 3580 340 
    L 3620 400 
    L 3750 400 
    C 3780 400 3800 420 3800 450 
    L 3800 560 
    C 3770 570 3770 610 3800 620 
    L 3800 800 
    C 3800 830 3780 850 3750 850 
    L 3250 850 
    C 3220 850 3200 830 3200 800 
    L 3200 620 
    C 3230 610 3230 570 3200 560 
    L 3200 450 
    C 3200 420 3220 400 3250 400 
    L 3380 400 
    L 3240 470 
    L 3760 470 
    L 3760 550 
    L 3240 550 
    L 3370 550 
    L 3370 630 
    L 3500 630 
    L 3500 550 
    L 3630 550 
    L 3630 630 
    L 3760 630 
    L 3760 700 
    L 3240 700 
    L 3250 750 
    L 3260 700 
    L 3280 750 
    L 3290 700 
    L 3310 750 
    L 3330 700 
    L 3360 750 
    L 3370 700 
    L 3400 750 
    L 3420 700 
    L 3450 750 
    L 3460 700 
    L 3500 750 
    L 3520 700 
    L 3550 750 
    L 3570 700 
    L 3600 750 
    L 3620 700 
    L 3660 750 
    L 3680 700 
    L 3720 750 
    L 3740 700 
    L 3760 790 
    L 3240 790 
    C 3220 810 3230 840 3250 850 
    L 3800 850 
    L 3950 850
    C 4050 850 4180 870 4350 850
    L 4420 830 
    L 4400 800 
    L 4410 740 
    L 4440 730 
    L 4420 730 
    L 4480 710 
    C 4530 680 4600 660 4680 650 
    C 4740 600 4800 540 4880 520 
    C 4960 510 5060 520 5140 560 
    C 5200 610 5240 660 5280 680 
    L 5340 685 
    L 5350 710 
    L 5330 750 
    L 5320 800 
    L 5260 810 
    C 5240 740 5120 740 5100 810 
    L 4750 810 
    C 4730 740 4610 740 4590 810 
    L 4520 820 
    L 4660 810 
    A 35 35 0 1 0 4660 740 
    A 35 35 0 1 0 4660 810 
    L 4750 810 
    L 5170 810 
    A 35 35 0 1 0 5170 740 
    A 35 35 0 1 0 5170 810 
    L 5360 830 
    L 5450 830
    C 5520 830 5600 780 5680 700
    L 5700 880 
    L 6400 880 
    C 6300 880 6150 920 5950 920 
    C 5800 920 5720 890 5700 880 
    L 5740 880 
    L 5740 680 
    L 6020 680 
    L 6020 880 
    L 5960 880 
    L 5960 680 
    L 5880 680 
    L 5880 880 
    L 5800 880 
    L 5800 680 
    L 5800 520 
    L 6300 520 
    L 6300 420 
    L 5840 420 
    L 5840 340 
    L 6260 340 
    L 6260 260 
    L 5880 260 
    L 5880 200 
    L 6180 200 
    L 6180 240 
    L 6050 240 
    L 6050 200 
    L 6000 200 
    L 6000 520 
    L 6100 520 
    L 6100 260 
    L 6160 260 
    L 6160 520 
    L 6350 520 
    L 6380 680 
    L 6380 880 
    L 6420 880
  `.replace(/\s+/g, " ").trim();

  useEffect(() => {
    const path = pathRef.current;
    const glowPath = glowPathRef.current;
    const svgGroup = svgGroupRef.current;
    if (!path || !glowPath || !svgGroup) return;

    // 1. Calculate path length for native stroke drawing
    const totalLength = path.getTotalLength();

    gsap.set([path, glowPath], {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength,
    });

    // 2. Camera target coordinates for each landmark in the 6400x1200 viewBox
    // [progress, cameraX, cameraY, scale]
    const cameraKeyframes = [
      { p: 0.00, x: 0, y: 0, scale: 1.0 },       // Overview of Stadium
      { p: 0.20, x: -350, y: -40, scale: 1.25 }, // Diving into Stadium
      { p: 0.38, x: -1750, y: -120, scale: 2.1 },// Zooming in on Seat
      { p: 0.58, x: -3000, y: -110, scale: 1.95 },// Centering on Ticket
      { p: 0.78, x: -4350, y: -130, scale: 1.85 },// Following Car
      { p: 1.00, x: -5250, y: -60, scale: 1.35 }, // Framing Hotel Pavilion
    ];

    // Helper: interpolate camera position based on current progress
    const getCameraTransform = (prog) => {
      let i = 0;
      while (i < cameraKeyframes.length - 1 && cameraKeyframes[i + 1].p < prog) {
        i++;
      }
      if (i >= cameraKeyframes.length - 1) {
        const last = cameraKeyframes[cameraKeyframes.length - 1];
        return { x: last.x, y: last.y, scale: last.scale };
      }
      const k1 = cameraKeyframes[i];
      const k2 = cameraKeyframes[i + 1];
      const factor = (prog - k1.p) / (k2.p - k1.p);
      // Smooth sinusoidal ease between camera stations
      const ease = 0.5 * (1 - Math.cos(factor * Math.PI));

      return {
        x: k1.x + (k2.x - k1.x) * ease,
        y: k1.y + (k2.y - k1.y) * ease,
        scale: k1.scale + (k2.scale - k1.scale) * ease,
      };
    };

    // 3. Master GSAP ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: ".lp-scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2, // Buttery smooth momentum scrub forward & backward
      onUpdate: (self) => {
        const prog = Math.min(Math.max(self.progress, 0), 1);

        // A. Draw the single continuous path
        const currentOffset = totalLength * (1 - prog);
        path.style.strokeDashoffset = currentOffset;
        glowPath.style.strokeDashoffset = currentOffset;

        // B. Cinematic Virtual Camera tracking the drawing head
        const cam = getCameraTransform(prog);
        gsap.set(svgGroup, {
          x: cam.x,
          y: cam.y,
          scale: cam.scale,
          transformOrigin: "0 0",
        });

        // C. At final moment (prog > 0.96), bloom hotel outline
        if (prog >= 0.96) {
          const tFinal = (prog - 0.96) / 0.04;
          glowPath.style.strokeWidth = `${4 + tFinal * 4}px`;
          glowPath.style.opacity = `${0.6 + tFinal * 0.4}`;
        } else {
          glowPath.style.strokeWidth = "3px";
          glowPath.style.opacity = "0.5";
        }

        if (onProgressUpdate) onProgressUpdate(prog);
      },
    });

    return () => {
      st.kill();
    };
  }, [masterPath, onProgressUpdate]);

  return (
    <div className="lp-viewport" ref={containerRef}>
      <svg
        className="lp-svg-canvas"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle architectural white glow filter */}
          <filter id="white-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dynamic Virtual Camera Group */}
        <g ref={svgGroupRef}>
          {/* Atmospheric ambient line glow */}
          <path
            ref={glowPathRef}
            d={masterPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#white-glow)"
            opacity="0.45"
          />

          {/* Crisp, razor-thin primary architectural line */}
          <path
            ref={pathRef}
            d={masterPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
}
