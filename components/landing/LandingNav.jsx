"use client";

import Link from "next/link";

export default function LandingNav() {
  return (
    <header className="lp-header">
      <Link href="/" className="lp-brand">
        STADIA <span className="lp-brand-dot" />
      </Link>

      <nav className="lp-nav" aria-label="Landing navigation">
        <a href="#problem" className="lp-nav-link">The Problem</a>
        <a href="#architecture" className="lp-nav-link">Architecture</a>
        <a href="#platform" className="lp-nav-link">Platform</a>
      </nav>

      <Link href="/command-center" className="lp-enter-btn">
        Enter Platform ↗
      </Link>
    </header>
  );
}
