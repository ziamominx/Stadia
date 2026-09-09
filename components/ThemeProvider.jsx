'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('stadia_theme') || 'light';
    setThemeState(saved);
    applyTheme(saved);
    setMounted(true);
  }, []);

  const applyTheme = (t) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(t);
    root.style.colorScheme = t;
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('stadia_theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
