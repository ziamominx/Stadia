'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Sliders, Server, Layers, Terminal, Sun, Moon } from './Icons';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', label: 'Command Center', icon: Activity },
    { href: '/simulator', label: 'Stress Simulator', icon: Sliders },
    { href: '/integrations', label: 'Agency Connectors', icon: Server },
    { href: '/capacity', label: 'Zone Capacity', icon: Layers },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 px-4 py-2.5 shadow-soft backdrop-blur-md transition-colors">
        {/* Brand Monogram & Title */}
        <Link href="/" className="flex items-center gap-3 pl-1 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--terracotta-primary)] text-white font-semibold text-xs tracking-tight transition group-hover:bg-[var(--terracotta-hover)]">
            NX
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-tight text-[var(--text-primary)]">
                NEXUS <span className="text-[var(--terracotta-text)] font-medium">COMMAND</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-2 py-0.5 text-[10px] font-mono text-[var(--terracotta-text)] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
                ACTIVE
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-medium">Terracotta Orchestration Mesh</span>
          </div>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border border-[var(--terracotta-border)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 opacity-70" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action CTA & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle White/Dark mode"
            title={theme === 'dark' ? 'Switch to White mode' : 'Switch to Dark mode'}
            className="btn-press flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-300" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-[var(--terracotta-primary)]" />
            )}
          </button>

          <Link
            href="/simulator"
            className="btn-press flex items-center gap-1.5 rounded-full bg-[var(--terracotta-primary)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--terracotta-hover)] shadow-xs"
          >
            <Terminal className="h-3 w-3" />
            <span>Launch Drill</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
