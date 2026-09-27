"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { scrollDestination } from "@/lib/landing/timeline.mjs";
import { chapters } from "@/lib/landing/flight.mjs";

const journey = [
  ["Ticket", "One verified credential links the attendee to a seat, arrival window, gate, and onward journey."],
  ["Transit", "Arrival and departure plans connect the venue to transport corridors and pickup points."],
  ["Gate", "Gate assignments and queue forecasts help staff redirect pressure before bottlenecks form."],
  ["Seat", "A seat anchors each guest's route from the correct entrance to the nearest concourse."],
  ["Egress", "Exit readiness and incident response coordinate the route back out."],
  ["Fleet", "Transport teams receive dispatch tasks and report progress against the same event state."],
  ["Hospitality", "Hospitality teams see arrivals affecting their own capacity and service windows."],
];
const stakeholders = [
  ["Venue", "Inspect gate loads, zone density, exit availability, and incidents.", "/crowd"],
  ["Ground", "Receive tasks, acknowledge them, report blockers, and close work in the field.", "/ground"],
  ["Transport", "Monitor the fleet and confirm route changes as they are dispatched.", "/transport"],
  ["Executive", "Review the full event, configure thresholds, and approve interventions.", "/command-center"],
  ["Hospitality", "Monitor guest services alongside the wider event response.", "/hospitality"],
];
const pipeline = [
  ["Configure", "Set event capacity, gate thresholds, staffing, and response rules before opening."],
  ["Observe", "Inspect readings and staff reports in one shared operational picture."],
  ["Predict", "Flag rising pressure and prepare a response while there is time to act."],
  ["Dispatch", "Send tasks to ground and transport, with status visible to command."],
  ["Resolve", "Verify the outcome, close incidents, and keep an event timeline."],
];
const consoles = [
  ["Command center", "/command-center", "Full event state, incidents, and coordinated decisions."],
  ["Event creation", "/setup", "Configure the next event and commit operating parameters."],
  ["Ground operations", "/ground", "Assigned tasks, personnel, and zone-level response."],
  ["Transport operations", "/transport", "Fleet allocation, route instructions, and hub pressure."],
  ["Incident response", "/incidents", "Investigate reports, dispatch teams, and verify resolution."],
  ["Analytics", "/analytics", "Incident outcomes, occupancy history, and an audit log."],
];

export default function LandingSections() {
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const spotlight = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };
  useEffect(() => {
    const targets = document.querySelectorAll(".lp-reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.IntersectionObserver) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -20px 0px" });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (selected && dialog.current && !dialog.current.open) dialog.current.showModal();
    if (!selected && dialog.current?.open) dialog.current.close();
  }, [selected]);
  const explore = (event) => {
    event.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.getElementById("problem")?.scrollIntoView({ behavior: "instant" });
      return;
    }
    const track = document.getElementById("stadium-journey");
    if (!track) return;
    const start = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: scrollDestination(start, track.offsetHeight, window.innerHeight, chapters[0].at), behavior: "smooth" });
  };
  const card = ([title, detail, href], index, prefix) => (
    <button className="lp-stage-card lp-reveal" key={title} type="button" onPointerMove={spotlight} onClick={() => setSelected({ title, detail, href })} aria-label={`Explore ${title}`}>
      <span className="lp-stage-num">{prefix} {String(index + 1).padStart(2, "0")}</span>
      <span className="lp-stage-title">{title}</span>
      <span className="lp-stage-open">Explore ↗</span>
    </button>
  );
  return <>
    <div className="lp-hero-content">
      <div className="lp-hero-eyebrow">INTELLIGENT EVENT ORCHESTRATION</div>
      <h1 className="lp-hero-title">THE JOURNEY<strong>IS THE CROWD.</strong></h1>
      <p className="lp-hero-desc">One shared view of every moment, from stadium entry to the journey home.</p>
      <div className="lp-hero-actions">
        <button onClick={explore} className="lp-btn-primary">Begin the flight ↓</button>
        <Link href="/command-center" className="lp-btn-secondary">Enter Platform ↗</Link>
      </div>
      <a className="lp-skip-journey" href="#problem">Skip animation ↓</a>
    </div>
    <div className="lp-scroll-track" id="stadium-journey" aria-hidden="true" />
    <section className="lp-editorial">
      <div id="problem" className="lp-section lp-reveal">
        <div className="lp-section-kicker">01 // ONE JOURNEY</div>
        <h2 className="lp-section-heading">CROWDS MOVE <strong>BETWEEN SYSTEMS.</strong></h2>
        <p className="lp-section-body">Select a moment to see how it connects to the next.</p>
        <div className="lp-network-track lp-reveal">{journey.map(([title, detail], index) => <button key={title} type="button" className="lp-network-node" onPointerMove={spotlight} onClick={() => setSelected({ title, detail })}>{String(index + 1).padStart(2, "0")} {title} <span aria-hidden="true">↗</span></button>)}</div>
      </div>
      <div id="architecture" className="lp-section">
        <div className="lp-section-kicker lp-reveal">02 // SHARED OPERATIONS</div>
        <h2 className="lp-section-heading lp-reveal">FIVE TEAMS. <strong>ONE EVENT STATE.</strong></h2>
        <div className="lp-stages-grid">{stakeholders.map((item, index) => card(item, index, "TEAM"))}</div>
      </div>
      <div className="lp-section">
        <div className="lp-section-kicker lp-reveal">03 // RESPONSE LOOP</div>
        <h2 className="lp-section-heading lp-reveal">SEE IT. <strong>ACT TOGETHER.</strong></h2>
        <div className="lp-stages-grid">{pipeline.map((item, index) => card(item, index, "STEP"))}</div>
      </div>
      <div id="platform" className="lp-section">
        <div className="lp-section-kicker lp-reveal">04 // PLATFORM</div>
        <h2 className="lp-section-heading lp-reveal">OPEN THE <strong>RIGHT CONSOLE.</strong></h2>
        <div className="lp-platform-grid">{consoles.map(([title, href, detail]) => <Link key={href} href={href} className="lp-platform-card lp-reveal" onPointerMove={spotlight}><span className="lp-stage-title">{title} ↗</span><span className="lp-platform-summary">{detail}</span></Link>)}</div>
      </div>
      <div className="lp-final-cta lp-reveal">
        <div className="lp-section-kicker">THE COMPLETE PLATFORM</div>
        <h2>EVERY EVENT HAS A JOURNEY.<strong>STADIA ORCHESTRATES IT.</strong></h2>
        <Link href="/command-center" className="lp-btn-primary">Enter STADIA Platform ↗</Link>
      </div>
    </section>
    <dialog className="lp-detail-dialog" ref={dialog} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === dialog.current) setSelected(null); }} aria-label={selected?.title || "Details"}>
      <div className="lp-detail-top"><span>STADIA / SYSTEM DETAIL</span><button type="button" onClick={() => setSelected(null)} aria-label="Close details">×</button></div>
      <h2>{selected?.title}</h2><p>{selected?.detail}</p>
      {selected?.href && <Link href={selected.href} onClick={() => setSelected(null)}>Open {selected.title} ↗</Link>}
    </dialog>
  </>;
}
