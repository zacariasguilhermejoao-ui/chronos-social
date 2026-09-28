type Entry<T> = { data: T; age: number };

const store = new Map<string, Entry<any>>();

export function readView<T>(key: string): Entry<T> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Entry<T>;
      store.set(key, parsed);
      return parsed;
    }
  } catch {}
  return store.get(key) ?? null;
}

export function writeView<T>(key: string, data: T) {
  const entry = { data, age: Date.now() };
  store.set(key, entry);
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

export function isStale(age: number, maxMs: number) {
  return Date.now() - age > maxMs;
}

export function invalidateView(key: string) {
  store.delete(key);
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

export function saveScroll(key: string) {
  try {
    sessionStorage.setItem(`scroll:${key}`, String(window.scrollY));
  } catch {}
}

export function readScroll(key: string): number {
  try {
    return parseInt(sessionStorage.getItem(`scroll:${key}`) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}
