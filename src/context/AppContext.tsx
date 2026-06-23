import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'dark' | 'light';
export type Density = 'comfortable' | 'compact' | 'dense';

interface AppContextType {
  theme: Theme; accent: string; density: Density;
  setTheme: (t: Theme) => void; toggleTheme: () => void;
  setAccent: (a: string) => void; setDensity: (d: Density) => void;
  darkMode: boolean; toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
function getGap(d: Density) { return d==='compact'?'14px':d==='dense'?'8px':'20px'; }

export const AppProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const s = localStorage.getItem('auriq-theme');
    if (s==='light'||s==='dark') return s;
    return window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  });
  const [accent, setAccentState] = useState<string>(() => {
    const a = localStorage.getItem('auriq-accent');
    return (a && /^#[0-9a-fA-F]{6}$/.test(a)) ? a : '#00D4FF';
  });
  const [density, setDensityState] = useState<Density>(() => {
    const d = localStorage.getItem('auriq-density');
    return (['comfortable','compact','dense'].includes(d||'') ? d : 'comfortable') as Density;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-rgb', hexToRgb(accent));
    root.style.setProperty('--text-accent', accent);
    root.style.setProperty('--border-accent', accent+'73');
    root.style.setProperty('--accent-soft', accent+'22');
    root.style.setProperty('--gap', getGap(density));
  }, [theme, accent, density]);

  const setTheme = useCallback((t: Theme) => { setThemeState(t); localStorage.setItem('auriq-theme',t); }, []);
  const toggleTheme = useCallback(() => setTheme(theme==='dark'?'light':'dark'), [theme, setTheme]);
  const setAccent = useCallback((a: string) => { setAccentState(a); localStorage.setItem('auriq-accent',a); }, []);
  const setDensity = useCallback((d: Density) => { setDensityState(d); localStorage.setItem('auriq-density',d); }, []);

  return (
    <AppContext.Provider value={{ theme, accent, density, setTheme, toggleTheme, setAccent, setDensity, darkMode: theme==='dark', toggleDarkMode: toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
export const useTheme = useApp;
export const ThemeProvider = AppProvider;