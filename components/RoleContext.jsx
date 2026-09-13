'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
  stadium_ops: {
    id: 'stadium_ops',
    name: 'Stadium Operations',
    tag: 'Turnstile & Crowd Safety Command',
    iconName: 'Activity',
    defaultPath: '/command-center',
    navItems: [
      { to: '/command-center', label: 'Command Center', iconName: 'Activity' },
      { to: '/organizer/gates', label: 'Gates & Turnstiles', iconName: 'Shield' },
      { to: '/crowd-flow', label: 'Corridor Flow', iconName: 'Navigation' },
      { to: '/simulator', label: 'Stress Simulator', iconName: 'Sliders' },
    ],
  },
  mobility_ops: {
    id: 'mobility_ops',
    name: 'Mobility Operations',
    tag: 'Transit & Parking Inflow Ops',
    iconName: 'Bus',
    defaultPath: '/organizer/shuttles',
    navItems: [
      { to: '/organizer/shuttles', label: 'Shuttle Corridors', iconName: 'Bus' },
      { to: '/command-center', label: 'Venue Radar', iconName: 'Activity' },
      { to: '/organizer/gates', label: 'Gate Ingress', iconName: 'Shield' },
      { to: '/simulator', label: 'Disruption Simulator', iconName: 'Sliders' },
    ],
  },
  executive: {
    id: 'executive',
    name: 'Executive Organizer',
    tag: 'Tournament Operational Director',
    iconName: 'BarChart3',
    defaultPath: '/organizer',
    navItems: [
      { to: '/organizer', label: 'Executive Overview', iconName: 'BarChart3' },
      { to: '/command-center', label: 'Live Incident Command', iconName: 'Activity' },
      { to: '/hospitality-hub', label: 'Hospitality Alliance', iconName: 'Hotel' },
      { to: '/simulator', label: 'Stress Simulator', iconName: 'Sliders' },
    ],
  },
  fan: {
    id: 'fan',
    name: 'Fan Journey',
    tag: 'Live Ingress & Journey Coordination',
    iconName: 'Ticket',
    defaultPath: '/',
    navItems: [
      { to: '/ticket/FWC-IND-10492/confirmation', label: 'Live Pass & Gate Route', iconName: 'Activity' },
      { to: '/journey-planner', label: 'Journey Coordinator', iconName: 'Navigation' },
      { to: '/crowd-flow', label: 'Concourse Crowd Radar', iconName: 'Shield' },
      { to: '/hospitality-hub', label: 'Dispersal & Perks', iconName: 'Hotel' },
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
