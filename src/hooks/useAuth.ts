import { useSyncExternalStore } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { syncSavedTokens } from "@/lib/savedAccounts";

// Fallback de segurança: se por qualquer motivo (rede, worker suspenso,
// storage bloqueado) o getSession/onAuthStateChange não responder,
// nunca deixamos a app presa em spinner.
const AUTH_SAFETY_TIMEOUT_MS = 2500;

/**
 * Store de autenticação em singleton.
 *
 * Antes cada componente que chamava useAuth() criava a sua própria
 * subscrição + getSession(). Com ~20 cartões no feed isso eram dezenas de
 * pedidos e listeners duplicados a cada render de ecrã. Agora existe UMA
 * subscrição para toda a app e todos os componentes leem o mesmo snapshot.
 */
type AuthState = { session: Session | null; user: User | null; loading: boolean };

let state: AuthState = { session: null, user: null, loading: true };
const listeners = new Set<() => void>();
let started = false;

function emit() {
  listeners.forEach((l) => l());
}

function settle(session: Session | null) {
  const user = session?.user ?? null;
  // Evita re-render global quando nada mudou de facto.
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

/** Leitura síncrona fora de React (utilitários, caches). */
export function currentUserId(): string | null {
  return state.user?.id ?? null;
}

// scope "local": termina a sessão neste dispositivo sem revogar os refresh
// tokens guardados, para o login rápido das contas guardadas continuar válido.
export const signOut = () => supabase.auth.signOut({ scope: "local" });
