import { Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-[#f4f4f5]">
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