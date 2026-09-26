"use client";

import dynamic from "next/dynamic";
import LandingNav from "@/components/landing/LandingNav";
import LandingSections from "@/components/landing/LandingSections";
import "@/components/landing/landing.css";
import "@/components/landing/flight.css";

// One continuous Three.js world, loaded only for the public landing route.
const LandingCanvas = dynamic(
  () => import("@/components/landing/LandingCanvas"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="lp-body">
      <LandingNav />
      <LandingCanvas />
      <LandingSections />
    </main>
  );
}
