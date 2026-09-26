import './globals.css';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import OpsShell from '../components/OpsShell';
import { PollProvider } from '../lib/useEventState';

const hanken = Hanken_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-hanken' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-jbmono' });

export const metadata = {
  title: 'STADIA — Live Event Command',
  description: 'Shared live event state engine with role-specific command surfaces.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${hanken.variable} ${mono.variable}`}>
      <body style={{ fontFamily: 'var(--font-hanken), sans-serif' }}>
        <PollProvider>
          <OpsShell>{children}</OpsShell>
        </PollProvider>
      </body>
    </html>
  );
}
