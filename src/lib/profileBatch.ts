import { supabase } from "@/integrations/supabase/client";

export type MiniProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

const cache = new Map<string, MiniProfile>();
const inflight = new Map<string, Promise<MiniProfile | null>>();
const queue = new Set<string>();
let resolvers: Array<() => void> = [];
let timer: number | null = null;
const WINDOW_MS = 20;

async function flush() {
  timer = null;
  const ids = Array.from(queue);
  queue.clear();
  const rs = resolvers;
  resolvers = [];
  if (!ids.length) {
    rs.forEach((r) => r());
    return;
  }
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", ids);
    (data ?? []).forEach((p: any) => cache.set(p.id, p));
  } catch {
    /* ignore */
  }
  rs.forEach((r) => r());
}

export function getProfileCached(id: string): MiniProfile | null {
  return cache.get(id) ?? null;
}

export function fetchProfile(id: string): Promise<MiniProfile | null> {
  if (!id) return Promise.resolve(null);
  if (cache.has(id)) return Promise.resolve(cache.get(id)!);
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

export function updateProfileCache(p: Partial<MiniProfile> & { id: string }) {
  const cur = cache.get(p.id);
  cache.set(p.id, {
    ...(cur ?? { id: p.id, username: null, display_name: null, avatar_url: null }),
    ...p,
  });
}
