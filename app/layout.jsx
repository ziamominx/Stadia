import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
  title: 'Nexus Command — Mega-Event Hospitality & Capacity Orchestrator',
  description: 'Multi-agency operational command center coordinating accommodation saturation, transit bottlenecks, and perimeter crowd capacity during major events.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
