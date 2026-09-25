import { useSyncExternalStore } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { syncSavedTokens } from "@/lib/savedAccounts";

const AUTH_SAFETY_TIMEOUT_MS = 2500;

type AuthState = { session: Session | null; user: User | null; loading: boolean };

let state: AuthState = { session: null, user: null, loading: true };
const listeners = new Set<() => void>();
let started = false;

function emit() {
  listeners.forEach((l) => l());
}

function settle(session: Session | null) {
  const user = session?.user ?? null;
  if (state.session?.access_token === session?.access_token && !state.loading && state.user?.id === user?.id) {
    return;
  }
  state = { session, user, loading: false };
  emit();
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  supabase.auth.onAuthStateChange((_event, s) => {
    syncSavedTokens(s);
    settle(s);
  });

  supabase.auth
    .getSession()
    .then(({ data }) => {
      syncSavedTokens(data.session ?? null);
      settle(data.session ?? null);
    })
    .catch(() => settle(null));

  window.setTimeout(() => {
    if (state.loading) {
      state = { ...state, loading: false };
      emit();
    }
  }, AUTH_SAFETY_TIMEOUT_MS);
}

start();

function subscribe(cb: () => void) {
  start();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => state;

export function useAuth() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function currentUserId(): string | null {
  return state.user?.id ?? null;
}

export const signOut = () => supabase.auth.signOut({ scope: "local" });
