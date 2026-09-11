import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import MatchesPage from './pages/MatchesPage.jsx';
import CommandCenter from './pages/CommandCenter.jsx';
import ScenarioSimulator from './pages/ScenarioSimulator.jsx';
import JourneyPlanner from './pages/JourneyPlanner.jsx';
import HospitalityHub from './pages/HospitalityHub.jsx';
import MatchDetail from './pages/MatchDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import TravelInfo from './pages/TravelInfo.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Tourism from './pages/Tourism.jsx';
import MyTickets from './pages/MyTickets.jsx';
import Organizer from './pages/Organizer.jsx';
import OrganizerGates from './pages/OrganizerGates.jsx';
import OrganizerShuttles from './pages/OrganizerShuttles.jsx';

// React Router changes the URL hash but never scrolls to the target element.
// This handler makes "/#matches" (Book Tickets, Explore matches, Book more
// tickets) land on the Match timeline section after the page renders.
//
// Smooth-scroll design (why not scrollIntoView retries):
// Calling scrollIntoView repeatedly to "re-affirm" the position restarts the
// browser's smooth animation mid-flight — that is the stutter/glitch users see.
// Instead we run ONE self-controlled rAF tween (ease-out, capped duration) and
// only re-animate later if the section genuinely drifted (late API/images).
// Deps include location.key so RE-clicking the same "/#matches" link still
// triggers a fresh smooth scroll instead of doing nothing.
const NAV_OFFSET = 80; // sticky navbar height; matches scroll-margin-top

function animateScrollTo(targetY, token, state) {
  const startY = window.scrollY;
  const dist = targetY - startY;
  if (Math.abs(dist) < 2) return;
  const duration = Math.min(900, Math.max(350, Math.abs(dist) * 0.3));
  let startTs;
  const step = (ts) => {
    if (token !== state.token) return; // a newer scroll superseded this one
    if (startTs === undefined) startTs = ts;
    const p = Math.min(1, (ts - startTs) / duration);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    // 'instant' bypasses the CSS scroll-behavior:smooth so it can't fight the tween
    window.scrollTo({ top: startY + dist * eased, behavior: 'instant' });
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function ScrollToHash() {
  const { hash, pathname, key } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const id = hash.slice(1);
    const state = { token: {} };
    let cancelled = false;

    const idealTop = (el) => el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

    let attempts = 0;
    const waitForEl = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        animateScrollTo(Math.max(0, idealTop(el)), state.token, state);
        // One quiet correction after late layout shifts (API rows, images).
        // Only re-animates if the section actually drifted out of place.
        setTimeout(() => {
          if (cancelled) return;
          const el2 = document.getElementById(id);
          if (!el2) return;
          const drift = Math.abs(el2.getBoundingClientRect().top - NAV_OFFSET);
          if (drift > 64) animateScrollTo(Math.max(0, idealTop(el2)), state.token, state);
        }, 1100);
      } else if (attempts < 30) {
        attempts += 1;
        setTimeout(waitForEl, 100);
      }
    };
    waitForEl();

    return () => {
      cancelled = true;
      state.token = {}; // invalidates any in-flight tween from this navigation
    };
  }, [hash, pathname, key]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-[#f4f4f5]">
      <ScrollToHash />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/simulator" element={<ScenarioSimulator />} />
          <Route path="/journey-planner" element={<JourneyPlanner />} />
          <Route path="/hospitality-hub" element={<HospitalityHub />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/checkout/:matchId/:blockId/:seat" element={<Checkout />} />
          <Route path="/ticket/:ticketId" element={<TravelInfo />} />
          <Route path="/ticket/:ticketId/confirmation" element={<Confirmation />} />
          <Route path="/tourism" element={<Tourism />} />
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/organizer" element={<Organizer />} />
          <Route path="/organizer/gates" element={<OrganizerGates />} />
          <Route path="/organizer/shuttles" element={<OrganizerShuttles />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}