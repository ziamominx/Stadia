'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { 
  Activity, 
  Ticket, 
  MapPin, 
  Hotel, 
  Compass, 
  Menu, 
  X, 
  Zap, 
  ArrowUpRight,
  Search,
  Sun,
  Moon,
  Shield
} from './Icons';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTicket, setSearchTicket] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Overview' },
    { href: '/matches', label: 'Matches & Tickets' },
    { href: '/admin', label: 'Admin Panel', badge: 'ADMIN' },
    { href: '/command-center', label: 'Command Center', badge: 'LIVE' },
    { href: '/crowd-flow', label: 'Crowd Flow Map' },
    { href: '/hospitality', label: 'Hospitality' },
    { href: '/tourism', label: 'Explore City' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Monogram & Title */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--terracotta-primary)] font-black text-white text-sm tracking-tighter shadow-md transition-transform duration-200 group-hover:scale-105">
              <span>S</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--terracotta-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--terracotta-primary)]"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-[var(--text-primary)] font-mono group-hover:text-[var(--terracotta-text)] transition-colors">
                  STADIA
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider text-[var(--terracotta-text)]">
                  TERRACOTTA MESH
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-tight hidden sm:block">
                Predictive Crowd &amp; Hospitality Mesh
              </span>
            </div>
          </Link>
        </div>

        {/* Center Pill Navigation */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 shadow-soft">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border border-[var(--terracotta-border)] shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle White/Dark mode"
            title={theme === 'dark' ? 'Switch to Terracotta White mode' : 'Switch to Terracotta Dark mode'}
            className="btn-press flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] shadow-xs transition"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 text-[var(--terracotta-primary)]" />
            )}
          </button>

          {/* Quick Ticket Lookup Toggle */}
          <div className="relative hidden md:block">
            {searchOpen ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchTicket.trim()) {
                    window.location.href = `/ticket/${searchTicket.trim()}`;
                  }
                }}
                className="flex items-center"
              >
                <input
                  type="text"
                  placeholder="Ticket ID (e.g. FWC-1-A1...)"
                  value={searchTicket}
                  onChange={(e) => setSearchTicket(e.target.value)}
                  autoFocus
                  className="w-44 rounded-full border border-[var(--terracotta-border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--terracotta-primary)] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-1 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] shadow-xs transition"
              >
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Find Ticket</span>
              </button>
            )}
          </div>

          {/* Admin Panel Quick Access */}
          <Link
            href="/admin"
            className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-3 py-1.5 text-xs font-mono font-bold text-[var(--terracotta-text)] hover:bg-[var(--terracotta-primary)] hover:text-white transition shadow-xs"
            title="Admin Console - Manage Events & View Analytics"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          {/* Primary CTA */}
          <Link
            href="/matches"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-4 py-1.5 text-xs font-bold text-white shadow-soft transition-all duration-150 active:scale-95"
          >
            <Ticket className="w-3.5 h-3.5 text-white" />
            <span>Book Tickets</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          <div className="mb-3 pt-1">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTicket.trim()) {
                  window.location.href = `/ticket/${searchTicket.trim()}`;
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Lookup Ticket (e.g. FWC-1-A1...)"
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--terracotta-primary)] font-mono"
              />
              <button
                type="submit"
                className="rounded-lg bg-[var(--terracotta-primary)] px-3 py-2 text-xs text-white font-semibold"
              >
                Go
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--terracotta-text)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2 text-xs font-semibold text-[var(--text-primary)]"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />}
              <span>{theme === 'dark' ? 'Switch to White Mode' : 'Switch to Dark Mode'}</span>
            </button>
            <Link
              href="/matches"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--terracotta-primary)] py-2 text-xs font-bold text-white shadow-soft"
            >
              <Ticket className="w-3.5 h-3.5 text-white" />
              <span>Book Tickets</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
