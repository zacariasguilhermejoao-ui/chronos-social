// Carregamento de perfis em lote.
//
// Cada avatar no ecrã pedia a sua própria linha em `profiles` (N+1: 20 cartões
// = 20 pedidos). Aqui juntamos todos os pedidos feitos na mesma janela de 30ms
// num único `in (...)`, com cache em memória para toda a sessão.
import { supabase } from "@/integrations/supabase/client";

export type MiniProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

const WINDOW_MS = 30;
const CHUNK = 200;

const cache = new Map<string, MiniProfile>();
const inflight = new Map<string, Promise<MiniProfile | null>>();
let queue = new Set<string>();
let timer: number | null = null;
let resolvers: Array<() => void> = [];

async function flush() {
  timer = null;
  const ids = [...queue];
  queue = new Set();
  const done = resolvers;
  resolvers = [];

  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const { data } = await supabase
      .from("profiles")
      .select("id,username,display_name,avatar_url")
      .in("id", slice);
    (data ?? []).forEach((p: any) => cache.set(p.id, p as MiniProfile));
    // ids sem resultado ficam em cache negativa para não repetir o pedido
    slice.forEach((id) => {
      if (!cache.has(id)) {
        cache.set(id, { id, username: null, display_name: null, avatar_url: null });
      }
    });
  }
  done.forEach((r) => r());
}

export function peekProfile(id: string): MiniProfile | undefined {
  return cache.get(id);
}

export function primeProfile(p: MiniProfile) {
  if (p?.id) cache.set(p.id, p);
}

export function getProfile(id: string): Promise<MiniProfile | null> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  const running = inflight.get(id);
  if (running) return running;

  const p = new Promise<MiniProfile | null>((resolve) => {
    queue.add(id);
    resolvers.push(() => resolve(cache.get(id) ?? null));
    if (timer === null) timer = window.setTimeout(() => void flush(), WINDOW_MS);
  }).finally(() => inflight.delete(id));

  inflight.set(id, p);
  return p;
}

/** Mantém a cache coerente quando o realtime traz um perfil atualizado. */
export function updateProfileCache(p: Partial<MiniProfile> & { id: string }) {
  const cur = cache.get(p.id);
  cache.set(p.id, { ...(cur ?? { id: p.id, username: null, display_name: null, avatar_url: null }), ...p });
}
