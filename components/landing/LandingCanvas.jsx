"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createJourneyWorld } from "@/lib/landing/journey-world.mjs";
import { chapters, clamp, damp, smoothstep, sampleFlight, sceneState, flightChapter } from "@/lib/landing/flight.mjs";
import { scrollDestination } from "@/lib/landing/timeline.mjs";

export default function LandingCanvas() {
  const containerRef = useRef(null);
  const fillRef = useRef(null);
  const captionRef = useRef(null);
  const navRef = useRef(null);
  const [chapter, setChapter] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const root = container.closest(".lp-body");
    const track = root.querySelector(".lp-scroll-track");
    const intro = root.querySelector(".lp-hero-content");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      root.dataset.journey = "fallback";
      setFailed(true);
      return () => { delete root.dataset.journey; };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "A 3D flight from the stadium to your seat, shuttle, and hotel");
    container.appendChild(renderer.domElement);
    const world = createJourneyWorld();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 650);
    const target = new THREE.Vector3();
    let current = 0, destination = 0, lastTime = 0, frame = 0, lastChapter = -1;
    let active = true, disposed = false, lost = false;

    const requestFrame = () => {
      if (!frame && !disposed && !lost && !document.hidden) frame = requestAnimationFrame(render);
    };
    const measureScroll = () => {
      const rect = track.getBoundingClientRect();
      const distance = Math.max(1, track.offsetHeight - window.innerHeight);
      destination = motion.matches ? 0 : clamp(-rect.top / distance);
      active = rect.bottom > 0 && rect.top < window.innerHeight;
      requestFrame();
    };
    const resize = () => {
      const width = container.clientWidth, height = container.clientHeight;
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      measureScroll();
    };
    function render(time) {
      frame = 0;
      if (disposed || lost || document.hidden) return;
      const dt = Math.min((time - (lastTime || time)) / 1000, 0.05);
      lastTime = time;
      current = motion.matches ? 0 : damp(current, destination, dt);
      if (Math.abs(current - destination) < 0.00001) current = destination;
      const p = current;
      const pose = sampleFlight(p);
      const state = sceneState(p);
      const roadPosition = world.roadCurve.getPointAt(state.carProgress);
      camera.position.fromArray(pose.position);
      target.fromArray(pose.target);
      const follow = smoothstep((p - 0.68) / 0.05) * (1 - smoothstep((p - 0.89) / 0.08));
      target.lerp(new THREE.Vector3(roadPosition.x, roadPosition.y + 1, roadPosition.z), follow);
      // Pull back along the same sightline on narrow screens to retain framing.
      camera.position.sub(target).multiplyScalar(Math.max(1, 1.2 / camera.aspect)).add(target);
      camera.up.set(0, 1, 0);
      camera.lookAt(target);
      world.focalSeat.scale.setScalar(state.seatScale);
      world.focalSeat.visible = state.seatScale > 0.002;
      world.ticketGroup.scale.setScalar(state.ticketScale);
      world.ticketGroup.visible = state.ticketScale > 0.002;
      world.ticketGroup.position.y = world.seatOrigin.y + 0.9 + state.ticketLift;
      world.ticketPlane.material.opacity = state.ticketOpacity;
      const tangent = world.roadCurve.getTangentAt(state.carProgress);
      world.carGroup.position.copy(roadPosition);
      world.carGroup.rotation.y = Math.atan2(tangent.z, -tangent.x);
      if (active) renderer.render(world.scene, camera);
      if (intro) {
        const opacity = motion.matches ? 1 : Math.max(0, 1 - p / 0.07);
        intro.style.opacity = String(opacity);
        intro.style.transform = `translateY(${-24 * (1 - opacity)}px)`;
        intro.style.visibility = opacity === 0 ? "hidden" : "visible";
        intro.inert = opacity === 0;
        intro.setAttribute("aria-hidden", String(opacity === 0));
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (navRef.current) {
        navRef.current.inert = !active;
        navRef.current.style.visibility = active ? "visible" : "hidden";
      }
      if (captionRef.current) captionRef.current.style.opacity = String(clamp((p - 0.06) / 0.04));
      const nextChapter = flightChapter(p);
      if (nextChapter !== lastChapter) {
        lastChapter = nextChapter;
        setChapter(nextChapter);
      }
      if (active && current !== destination) requestFrame();
    }
    const visibility = () => { lastTime = 0; requestFrame(); };
    const contextLost = event => {
      event.preventDefault();
      lost = true;
      root.dataset.journey = "fallback";
      setFailed(true);
      if (intro) { intro.style.cssText = ""; intro.inert = false; intro.removeAttribute("aria-hidden"); }
    };
    const preferenceChanged = () => { current = 0; resize(); };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    window.addEventListener("scroll", measureScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preferenceChanged);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    resize();
    current = destination; // Respect a restored scroll position on navigation.

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", measureScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preferenceChanged);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      world.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      if (intro) { intro.style.cssText = ""; intro.inert = false; intro.removeAttribute("aria-hidden"); }
      delete root.dataset.journey;
    };
  }, []);

  const jump = index => {
    const track = document.getElementById("stadium-journey");
    const start = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: scrollDestination(start, track.offsetHeight, window.innerHeight, chapters[index].at),
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="lp-viewport lp-flight-viewport" ref={containerRef} aria-hidden="true" />
      {failed && <div className="lp-flight-fallback" role="status">
        <img src="/cinematic/stadium_master.webp" alt="" />
        <span>3D rendering is unavailable on this device. You can still explore the platform below.</span>
      </div>}
      <div className="lp-flight-caption" ref={captionRef}>
        <span className="lp-flight-kicker">THE ATTENDEE JOURNEY / 0{chapter + 1}</span>
        <h2>{chapters[chapter].name}</h2>
        <p>{chapters[chapter].detail}</p>
      </div>
      <nav className="lp-flight-nav" ref={navRef} aria-label="3D journey chapters">
        <span className="lp-flight-instruction">SCROLL TO FLY</span>
        <div className="lp-flight-chapters">
          {chapters.map((item, index) => <button key={item.name} onClick={() => jump(index)}
            aria-current={chapter === index ? "step" : undefined}>
            <span>0{index + 1}</span>{item.name}
          </button>)}
        </div>
        <div className="lp-flight-progress"><i ref={fillRef} /></div>
      </nav>
    </>
  );
}
