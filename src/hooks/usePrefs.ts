import { useCallback, useEffect, useState } from "react";

type Prefs = {
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

function applyToDOM(p: Prefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("a11y-large-text", p.largeText);
  root.classList.toggle("a11y-high-contrast", p.highContrast);
  root.classList.toggle("a11y-reduce-motion", p.reduceMotion);
}

let listeners: Array<(p: Prefs) => void> = [];
let current: Prefs = typeof window !== "undefined" ? load() : DEFAULTS;
if (typeof window !== "undefined") applyToDOM(current);

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(current);

  useEffect(() => {
    const fn = (p: Prefs) => setPrefs(p);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  const update = useCallback((patch: Partial<Prefs> | ((p: Prefs) => Prefs)) => {
    const next = typeof patch === "function" ? patch(current) : { ...current, ...patch };
    current = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    applyToDOM(next);
    listeners.forEach((l) => l(next));
  }, []);

  return { prefs, update };
}

export function vibrate(ms = 20) {
  try {
    const p = current;
    if (!p.vibration) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      (navigator as any).vibrate(ms);
    }
  } catch {}
}
