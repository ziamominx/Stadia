import './globals.css';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { RoleProvider } from '../components/RoleContext';

export const metadata = {
  title: 'STADIA · One Ticket. Every Journey. Zero Chaos.',
  description: 'STADIA — intelligent hospitality & crowd orchestration for mega-events. One ticket. Every journey. Zero chaos.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased">
        <RoleProvider>
          <div className="flex min-h-screen flex-col bg-[#09090b] text-[#f4f4f5]">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
