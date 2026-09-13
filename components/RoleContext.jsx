'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
  stadium_ops: {
    id: 'stadium_ops',
    name: 'Stadium Operations',
    tag: 'Safety & Turnstile Command',
    iconName: 'Activity',
    defaultPath: '/command-center',
    navItems: [
      { to: '/command-center', label: 'Command Center', iconName: 'Activity' },
      { to: '/crowd-flow', label: 'Crowd Flow', iconName: 'Navigation' },
      { to: '/organizer/gates', label: 'Gates & Turnstiles', iconName: 'Shield' },
      { to: '/simulator', label: 'Stress Simulator', iconName: 'Sliders' },
    ],
  },
  mobility_ops: {
    id: 'mobility_ops',
    name: 'Mobility Operations',
    tag: 'Transit & Parking Ops',
    iconName: 'Bus',
    defaultPath: '/organizer/shuttles',
    navItems: [
      { to: '/organizer/shuttles', label: 'Shuttle Fleet', iconName: 'Navigation' },
      { to: '/command-center', label: 'Corridor Health', iconName: 'Activity' },
      { to: '/organizer/gates', label: 'Gate Ingress', iconName: 'Shield' },
      { to: '/simulator', label: 'Simulation', iconName: 'Sliders' },
    ],
  },
  executive: {
    id: 'executive',
    name: 'Executive Organizer',
    tag: 'Tournament Director',
    iconName: 'BarChart3',
    defaultPath: '/organizer',
    navItems: [
      { to: '/organizer', label: 'Event Overview', iconName: 'Activity' },
      { to: '/command-center', label: 'Risk & Safety', iconName: 'Shield' },
      { to: '/simulator', label: 'Stress Simulator', iconName: 'Sliders' },
      { to: '/hospitality-hub', label: 'Commercial & Hospitality', iconName: 'Hotel' },
    ],
  },
  fan: {
    id: 'fan',
    name: 'Fan / Attendee',
    tag: 'Matchday Passenger',
    iconName: 'Ticket',
    defaultPath: '/matches',
    navItems: [
      { to: '/matches', label: 'Fixtures & Tickets', iconName: 'Shield' },
      { to: '/ticket/FWC-IND-10492/confirmation', label: 'My Digital Pass', iconName: 'Activity' },
      { to: '/journey-planner', label: 'Trip Companion', iconName: 'Navigation' },
      { to: '/hospitality-hub', label: 'Hospitality & Perks', iconName: 'Hotel' },
    ],
  },
};

const RoleContext = createContext({
  role: 'stadium_ops',
  setRole: () => {},
  currentRoleConfig: ROLES.stadium_ops,
});

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState('stadium_ops');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stadia_demo_role');
      if (saved && ROLES[saved]) {
        setRoleState(saved);
      }
    } catch {
      // Ignore storage access errors in private windows
    }
  }, []);

  const setRole = (newRole) => {
    if (ROLES[newRole]) {
      setRoleState(newRole);
      try {
        localStorage.setItem('stadia_demo_role', newRole);
      } catch {
        // Ignore
      }
    }
  };

  const currentRoleConfig = ROLES[role] || ROLES.stadium_ops;

  return (
    <RoleContext.Provider value={{ role, setRole, currentRoleConfig }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
