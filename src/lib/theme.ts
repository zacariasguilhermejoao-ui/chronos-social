import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "chronos:theme";

export function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  return choice === "system" ? systemTheme() : choice;
}

export function readStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return "system";
}

let current: ThemeChoice = readStoredTheme();
let listeners: Array<(c: ThemeChoice) => void> = [];

export function applyTheme(choice: ThemeChoice, animate = true) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = resolveTheme(choice);
  if (animate) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 280);
  }
  root.classList.toggle("light", resolved === "light");
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "light" ? "#fafafa" : "#090909");
}

export function setTheme(choice: ThemeChoice) {
  current = choice;
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {}
  applyTheme(choice);
  listeners.forEach((l) => l(choice));
}

export function getTheme() {
  return current;
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(current);
  useEffect(() => {
    const l = (c: ThemeChoice) => setChoice(c);
    listeners.push(l);
    applyTheme(current, false);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);
  const set = useCallback((c: ThemeChoice) => setTheme(c), []);
  return { theme: choice, resolved: resolveTheme(choice), setTheme: set };
}

if (typeof window !== "undefined") {
  applyTheme(current, false);
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if (current === "system") applyTheme("system", false);
  });
}
