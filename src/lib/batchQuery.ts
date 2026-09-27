/**
 * Debounced batch lookups for boolean presence (likes, saves, follows).
 * Collects IDs for ~16ms then fires a single .in() query per table.
 */
type Key = string;
const pending = new Map<Key, Set<string>>();
const resolvers = new Map<Key, Array<(map: Map<string, boolean>) => void>>();
const cache = new Map<Key, Map<string, boolean>>();
let timers = new Map<Key, number>();

function keyOf(table: string, col: string, userId: string) {
  return `${table}|${col}|${userId}`;
}

export function batchHas(table: string, col: string, id: string, userId: string): Promise<boolean> {
  const k = keyOf(table, col, userId);
  const cached = cache.get(k)?.get(id);
  if (cached !== undefined) return Promise.resolve(cached);

  if (!pending.has(k)) pending.set(k, new Set());
  pending.get(k)!.add(id);

  return new Promise((resolve) => {
    if (!resolvers.has(k)) resolvers.set(k, []);
    resolvers.get(k)!.push((map) => resolve(!!map.get(id)));
    if (!timers.has(k)) {
      timers.set(
        k,
        window.setTimeout(async () => {
          const ids = Array.from(pending.get(k) ?? []);
          pending.delete(k);
          timers.delete(k);
          const map = cache.get(k) ?? new Map<string, boolean>();
          try {
            const { supabase } = await import("@/integrations/supabase/client");
            const { data } = await supabase
              .from(table as any)
              .select(col)
              .eq("user_id", userId)
              .in(col, ids);
            ids.forEach((id) => map.set(id, false));
            (data ?? []).forEach((row: any) => map.set(row[col], true));
          } catch {
            ids.forEach((id) => map.set(id, false));
          }
          cache.set(k, map);
          const rs = resolvers.get(k) ?? [];
          resolvers.delete(k);
          rs.forEach((r) => r(map));
        }, 16),
      );
    }
  });
}

export function batchSet(table: string, col: string, id: string, userId: string, value: boolean) {
  const k = keyOf(table, col, userId);
  if (!cache.has(k)) cache.set(k, new Map());
  cache.get(k)!.set(id, value);
}
