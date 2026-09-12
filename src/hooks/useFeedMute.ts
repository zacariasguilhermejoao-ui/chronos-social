import { useEffect, useState, useCallback } from "react";

const KEY = "chronos:feedMuted";
let current: boolean = (() => {
  if (typeof window === "undefined") return false;
  const v = localStorage.getItem(KEY);
  return v === null ? false : v === "1";
})();
let listeners: Array<(m: boolean) => void> = [];

export function useFeedMute() {
  const [muted, setMuted] = useState<boolean>(current);

  useEffect(() => {
    const fn = (m: boolean) => setMuted(m);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  const toggleMuted = useCallback(() => {
    current = !current;
    try {
      localStorage.setItem(KEY, current ? "1" : "0");
    } catch {}
    listeners.forEach((l) => l(current));
  }, []);

  const setMutedGlobal = useCallback((m: boolean) => {
    current = m;
    try {
      localStorage.setItem(KEY, current ? "1" : "0");
    } catch {}
    listeners.forEach((l) => l(current));
  }, []);

  return { muted, toggleMuted, setMutedGlobal };
}
