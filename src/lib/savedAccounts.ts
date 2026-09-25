import type { Session } from "@supabase/supabase-js";

export type SavedAccount = {
  identifier: string;
  label: string;
  userId?: string | null;
  avatarUrl?: string | null;
  refreshToken?: string | null;
  lastUsed?: number;
};

export const SAVED_KEY = "chronos_saved_accounts";
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function readSavedAccounts(): SavedAccount[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function writeSavedAccounts(list: SavedAccount[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 5)));
  } catch {}
}

export function saveAccount(entry: SavedAccount) {
  const list = readSavedAccounts().filter((a) => a.identifier !== entry.identifier);
  list.unshift({ ...entry, lastUsed: Date.now() });
  writeSavedAccounts(list);
}

export function touchAccount(identifier: string, refreshToken?: string | null) {
  const list = readSavedAccounts().map((a) =>
    a.identifier === identifier
      ? { ...a, lastUsed: Date.now(), refreshToken: refreshToken ?? a.refreshToken }
      : a,
  );
  writeSavedAccounts(list);
}

export function forgetAccount(identifier: string) {
  try {
    writeSavedAccounts(readSavedAccounts().filter((a) => a.identifier !== identifier));
    if (localStorage.getItem("chronos_last_id") === identifier) {
      localStorage.removeItem("chronos_last_id");
    }
  } catch {}
}

export function syncSavedTokens(session: Session | null) {
  if (!session?.refresh_token || !session.user) return;
  const uid = session.user.id;
  const email = session.user.email?.toLowerCase() ?? null;
  const phone = session.user.phone ?? null;
  const list = readSavedAccounts();
  let changed = false;
  const next = list.map((a) => {
    const match =
      (a.userId && a.userId === uid) ||
      (!!email && a.identifier.toLowerCase() === email) ||
      (!!phone && a.identifier.replace(/[\s-]/g, "") === phone);
    if (!match) return a;
    changed = true;
    return { ...a, userId: uid, refreshToken: session.refresh_token, lastUsed: Date.now() };
  });
  if (changed) writeSavedAccounts(next);
}
