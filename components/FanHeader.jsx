"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./FanHeader.css";

const fanLinks = [
  { href: "/fan", label: "Fan Overview" },
  { href: "/matches", label: "Matches" },
  { href: "/ticket", label: "My Pass" },
  { href: "/journey-planner", label: "Plan Visit" },
  { href: "/hospitality-hub", label: "Hospitality" },
];

export default function FanHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const isCurrent = (href) => pathname === href ||
    (href === "/matches" && (pathname.startsWith("/match/") || pathname.startsWith("/checkout/"))) ||
    (href === "/ticket" && pathname.startsWith("/ticket/"));

  return (
    <header className="fan-header">
      <nav className="fan-header-inner" aria-label="Fan navigation">
        <Link href="/" className="fan-header-brand" aria-label="Stadia home">
          STADIA <span className="fan-header-brand-dot" aria-hidden="true" />
        </Link>

        <div className="fan-header-links">
          {fanLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`fan-header-link${isCurrent(href) ? " fan-header-link-active" : ""}`}
              aria-current={isCurrent(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="fan-header-actions">
          <Link href="/matches" className="fan-header-book">
            <span className="fan-header-book-wide">Book a Match</span>
            <span className="fan-header-book-short">Book</span>
            <span aria-hidden="true">↗</span>
          </Link>

          <div className="fan-header-menu" ref={menuRef}>
            <button
              type="button"
              className="fan-header-menu-toggle"
              aria-controls="fan-header-mobile-links"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span>{menuOpen ? "Close" : "Menu"}</span>
              <span className="fan-header-menu-mark" aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
            </button>

            <div id="fan-header-mobile-links" className="fan-header-mobile-links" hidden={!menuOpen}>
              <Link href="/" onClick={() => setMenuOpen(false)}>Stadia Home</Link>
              {fanLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isCurrent(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
