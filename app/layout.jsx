import './globals.css';
import 'leaflet/dist/leaflet.css';
import SiteFrame from '../components/SiteFrame';

export const metadata = {
  title: 'STADIA · Event Command Platform',
  description: 'Real-time event state, crowd orchestration, and operational intelligence.',
  icons: {
    icon: '/icon.svg',
  },
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
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}

