"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

const THEME_KEY = "sayara:theme";
const listeners = new Set<() => void>();

function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getThemeSnapshot(): Theme {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    return saved === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        // ignore storage errors
      }
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(next);
      listeners.forEach((l) => l());
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
