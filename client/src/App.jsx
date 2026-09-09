import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import MatchDetail from './pages/MatchDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import TravelInfo from './pages/TravelInfo.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Tourism from './pages/Tourism.jsx';
import Organizer from './pages/Organizer.jsx';
import OrganizerGates from './pages/OrganizerGates.jsx';
import OrganizerShuttles from './pages/OrganizerShuttles.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/checkout/:matchId/:blockId/:seat" element={<Checkout />} />
          <Route path="/ticket/:ticketId" element={<TravelInfo />} />
          <Route path="/ticket/:ticketId/confirmation" element={<Confirmation />} />
          <Route path="/tourism" element={<Tourism />} />
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