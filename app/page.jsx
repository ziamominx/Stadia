"use client";

import dynamic from "next/dynamic";
import LandingNav from "@/components/landing/LandingNav";
import LandingSections from "@/components/landing/LandingSections";
import "@/components/landing/landing.css";

// Dynamic import with SSR disabled for smooth client-side GSAP rendering
const StadiumHero = dynamic(
  () => import("@/components/landing/StadiumHero"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="lp-body">
      <LandingNav />
      <StadiumHero />
      <LandingSections />
    </main>
  );
}
