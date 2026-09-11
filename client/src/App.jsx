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
// Deps include location.key so RE-clicking the same "/#matches" link (already
// at that URL) still re-triggers the scroll instead of doing nothing.
function ScrollToHash() {
  const { hash, pathname, key } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = hash.slice(1);
    let attempts = 0;
    let settled = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Re-affirm after layout settles (fonts/images/API data shift the page)
        if (settled < 2) {
          settled += 1;
          setTimeout(tick, 350);
        }
      } else if (attempts < 30) {
        attempts += 1;
        setTimeout(tick, 100);
      }
    };
    tick();
    return () => {
      cancelled = true;
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