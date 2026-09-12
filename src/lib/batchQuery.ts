// Agrupa dezenas de pedidos "eu gostei disto?" num único pedido ao servidor.
// Cada cartão do feed pedia a sua própria linha (N+1). Aqui juntamos todos os
// pedidos feitos na mesma janela de 40ms num só `in (...)`.
import { supabase } from "@/integrations/supabase/client";

type Key = string;

const WINDOW_MS = 40;
const CHUNK = 200;

const pending = new Map<Key, { ids: Set<string>; resolvers: Array<() => void>; timer: number | null }>();
const cache = new Map<Key, Map<string, boolean>>();

function keyOf(table: string, column: string, userId: string) {
  return `${table}|${column}|${userId}`;
}

async function flush(key: Key, table: string, column: string, userId: string) {
  const entry = pending.get(key);
  if (!entry) return;
  pending.delete(key);
  const ids = [...entry.ids];
  const store = cache.get(key) ?? new Map<string, boolean>();
  cache.set(key, store);

  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const { data } = await supabase
      .from(table as any)
      .select(column)
      .eq("user_id", userId)
      .in(column, slice);
    const hit = new Set((data ?? []).map((r: any) => r[column] as string));
    for (const id of slice) store.set(id, hit.has(id));
  }
  entry.resolvers.forEach((r) => r());
}

/** true/false se o utilizador já interagiu (like, guardado, ...) com este id. */
export async function batchHas(
  table: string,
  column: string,
  id: string,
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false;
  const key = keyOf(table, column, userId);
  const cached = cache.get(key)?.get(id);
  if (cached !== undefined) return cached;

  let entry = pending.get(key);
  if (!entry) {
    entry = { ids: new Set(), resolvers: [], timer: null };
    pending.set(key, entry);
    entry.timer = window.setTimeout(() => void flush(key, table, column, userId), WINDOW_MS);
  }
  entry.ids.add(id);
  await new Promise<void>((resolve) => entry!.resolvers.push(resolve));
  return cache.get(key)?.get(id) ?? false;
}

/** Mantém a cache coerente após uma ação otimista do utilizador. */
export function batchSet(table: string, column: string, id: string, userId: string | null | undefined, value: boolean) {
  if (!userId) return;
  const key = keyOf(table, column, userId);
  const store = cache.get(key) ?? new Map<string, boolean>();
  store.set(id, value);
  cache.set(key, store);
}
