/**
 * Cache de ecrã em memória (dura toda a sessão da app, sobrevive a
 * desmontagens de rota). Serve para o padrão:
 *   mostrar já o que existe → revalidar em segundo plano.
 *
 * Não substitui a base de dados nem guarda nada sensível: só o último
 * snapshot renderizado por ecrã, mais a posição de scroll.
 */
type Entry<T> = { data: T; at: number };

const store = new Map<string, Entry<unknown>>();
const scroll = new Map<string, number>();

export function readView<T>(key: string): { data: T; age: number } | null {
  const e = store.get(key) as Entry<T> | undefined;
  if (!e) return null;
  return { data: e.data, age: Date.now() - e.at };
}

export function writeView<T>(key: string, data: T) {
  store.set(key, { data, at: Date.now() });
}

export function invalidateView(key: string) {
  store.delete(key);
}

export function isStale(age: number, ttlMs: number) {
  return age > ttlMs;
}

export function saveScroll(key: string, y: number) {
  scroll.set(key, y);
}

export function readScroll(key: string): number {
  return scroll.get(key) ?? 0;
}
