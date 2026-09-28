import { useEffect, useState, useCallback } from "react";

export type Prefs = {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  vibration: boolean;
  notifications: {
    likes: boolean;
    comments: boolean;
    followers: boolean;
    messages: boolean;
    earnings: boolean;
    masterEnabled: boolean;
  };
  privacy: {
    privateAccount: boolean;
    whoCanDM: "everyone" | "followers" | "friends";
  };
};

const DEFAULTS: Prefs = {
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  vibration: true,
  notifications: {
    likes: true,
    comments: true,
    followers: true,
    messages: true,
    earnings: true,
    masterEnabled: true,
  },
  privacy: {
    privateAccount: false,
    whoCanDM: "everyone",
  },
};

const KEY = "chronos:prefs";

function load(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      notifications: { ...DEFAULTS.notifications, ...(parsed.notifications ?? {}) },
      privacy: { ...DEFAULTS.privacy, ...(parsed.privacy ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

function save(p: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(load);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-large-text", prefs.largeText);
    root.classList.toggle("a11y-high-contrast", prefs.highContrast);
    root.classList.toggle("a11y-reduce-motion", prefs.reduceMotion);
  }, [prefs]);

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = {
        ...prev,
        ...patch,
        notifications: { ...prev.notifications, ...(patch.notifications ?? {}) },
        privacy: { ...prev.privacy, ...(patch.privacy ?? {}) },
      };
      save(next);
      return next;
    });
  }, []);

  return { prefs, update };
}
