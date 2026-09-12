// Cache local (localStorage) de últimas mensagens por conversa.
// Ligeiro, sem dependências. Renderiza a conversa instantaneamente.
const KEY = (threadId: string) => `chronos.chat.thread.${threadId}.v1`;
const INBOX_KEY = "chronos.chat.inbox.v1";
const MAX_MSGS = 40;

export function readThreadCache<T = unknown>(threadId: string): T[] | null {
  try {
    const raw = localStorage.getItem(KEY(threadId));
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

export function writeThreadCache(threadId: string, messages: unknown[]) {
  try {
    const slim = messages.slice(-MAX_MSGS);
    localStorage.setItem(KEY(threadId), JSON.stringify(slim));
  } catch {}
}

export function appendThreadCache(threadId: string, msg: unknown) {
  try {
    const cur = readThreadCache(threadId) ?? [];
    cur.push(msg);
    writeThreadCache(threadId, cur);
  } catch {}
}

export function readInboxCache<T = unknown>(): T[] | null {
  try {
    const raw = localStorage.getItem(INBOX_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

export function writeInboxCache(inbox: unknown[]) {
  try {
    localStorage.setItem(INBOX_KEY, JSON.stringify(inbox.slice(0, 40)));
  } catch {}
}
