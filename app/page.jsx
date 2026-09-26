"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import LandingNav from "@/components/landing/LandingNav";
import LandingSections from "@/components/landing/LandingSections";
import "@/components/landing/landing.css";

// Dynamic import with SSR disabled for client-side SVG + GSAP ScrollTrigger
const StadiaJourney = dynamic(
  () => import("@/components/landing/StadiaJourney"),
  { ssr: false }
);

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  return (
    <main className="lp-body">
      <LandingNav />
      <StadiaJourney onProgressUpdate={setScrollProgress} />
      <LandingSections progress={scrollProgress} />
    </main>
  );
}
