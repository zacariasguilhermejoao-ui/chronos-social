/**
 * Chrónos — Sistema de temas (claro / escuro / automático)
 * ---------------------------------------------------------
 * • Todas as cores vivem em variáveis CSS (ver src/index.css).
 * • Preferência guardada no dispositivo (localStorage) e na conta (profiles.theme).
 * • Sem "flash": o tema é aplicado por um script inline no index.html.
 */
import { supabase } from "@/integrations/supabase/client";
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
  if (meta) meta.setAttribute("content", resolved === "light" ? "#FAFAFA" : "#090909");
}

/** Muda o tema: aplica, guarda no dispositivo e sincroniza com a conta. */
export async function setTheme(choice: ThemeChoice, opts: { persistRemote?: boolean } = {}) {
  const { persistRemote = true } = opts;
  current = choice;
  applyTheme(choice);
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {}
  listeners.forEach((l) => l(choice));

  if (!persistRemote) return;
  try {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    await (supabase as any).from("profiles").update({ theme: choice }).eq("id", uid);
  } catch {}
}

export function getTheme(): ThemeChoice {
  return current;
}

/** Lê a preferência guardada na conta e aplica-a (uma vez por sessão). */
export async function syncThemeFromAccount() {
  try {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    const { data: row } = await (supabase as any)
      .from("profiles")
      .select("theme")
      .eq("id", uid)
      .maybeSingle();
    const remote = row?.theme as ThemeChoice | undefined;
    if (!remote) return;
    if (remote !== current) {
      current = remote;
      applyTheme(remote, false);
      try {
        localStorage.setItem(THEME_KEY, remote);
      } catch {}
      listeners.forEach((l) => l(remote));
    }
  } catch {}
}

export function useTheme() {
  const [theme, setLocal] = useState<ThemeChoice>(current);
  const [resolved, setResolved] = useState<ResolvedTheme>(resolveTheme(current));

  useEffect(() => {
    const fn = (c: ThemeChoice) => {
      setLocal(c);
      setResolved(resolveTheme(c));
    };
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (current !== "system") return;
      applyTheme("system", true);
      setResolved(systemTheme());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const change = useCallback((c: ThemeChoice) => {
    void setTheme(c);
  }, []);

  const toggle = useCallback(() => {
    void setTheme(resolveTheme(current) === "dark" ? "light" : "dark");
  }, []);

  return { theme, resolved, setTheme: change, toggle };
}

/** Sincroniza o tema da conta sempre que a sessão muda. */
export function useThemeSync() {
  useEffect(() => {
    applyTheme(current, false);
    void syncThemeFromAccount();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        void syncThemeFromAccount();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);
}
