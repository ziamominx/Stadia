'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRole, ROLES } from './RoleContext';
import { Activity, Sliders, Navigation, Hotel, Shield, ArrowRight, Bus, BarChart3, Ticket } from './Icons';

const ICON_MAP = {
  Activity,
  Sliders,
  Navigation,
  Hotel,
  Shield,
  Bus,
  BarChart3,
  Ticket,
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, currentRoleConfig } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (newRoleKey) => {
    setRole(newRoleKey);
    setDropdownOpen(false);
    const newConfig = ROLES[newRoleKey];
    if (newConfig?.defaultPath) {
      router.push(newConfig.defaultPath);
    }
  };

  const navItems = currentRoleConfig?.navItems || [];

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-neutral-800/90 bg-[#0e0e12]/85 px-4 py-2 shadow-2xl backdrop-blur-xl">
        {/* Brand Monogram & Title */}
        <Link href="/" className="flex items-center gap-3 pl-1 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-black text-sm shadow-md transition group-hover:scale-105">
            ▲
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                STADIA <span className="text-neutral-400 font-normal">NEXUS</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DEMO
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[150px] sm:max-w-none">
              {currentRoleConfig.tag}
            </span>
          </div>
        </Link>

        {/* Center Dynamic Pill Navigation based on active persona */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const IconComponent = ICON_MAP[item.iconName] || Activity;
            const isActive = pathname === item.to || (item.to !== '/' && pathname?.startsWith(item.to));
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-inner border border-neutral-700/60'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5 opacity-80" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: DEMO MODE · Viewing as Role Dropdown */}
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-neutral-700/80 bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:border-neutral-500 hover:bg-neutral-800 focus:outline-none"
            aria-label="Switch demo persona"
          >
            <span className="hidden md:inline text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
              Demo Mode · Viewing as:
            </span>
            <span className="flex items-center gap-2 text-white font-semibold">
              {React.createElement(ICON_MAP[currentRoleConfig.iconName] || Activity, { className: 'h-3.5 w-3.5 text-emerald-400' })}
              <span className="truncate max-w-[120px] sm:max-w-none">{currentRoleConfig.name}</span>
            </span>
            <svg
              className={`h-3 w-3 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Role Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-neutral-800 bg-[#121217] p-2 shadow-2xl backdrop-blur-2xl z-50">
              <div className="px-3 py-2 border-b border-neutral-800/80">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Switch Stakeholder View
                </p>
                <p className="text-[11px] text-neutral-500">
                  Same shared event state, tailored control surface.
                </p>
              </div>

              <div className="mt-1 space-y-1">
                {Object.values(ROLES).map((r) => {
                  const isSelected = r.id === role;
                  const Icon = ICON_MAP[r.iconName] || Activity;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                        isSelected
                          ? 'bg-neutral-800/90 text-white border border-neutral-700/70'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span className="mt-0.5 p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{r.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                          {r.tag}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
