import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
  title: 'STADIA — Intelligent Hospitality & Crowd Orchestration',
  description: 'One Ticket. Every Journey. Zero Chaos. Intelligent platform connecting events, tickets, travel, hospitality and real-time crowd safety.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen transition-colors duration-200 antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
