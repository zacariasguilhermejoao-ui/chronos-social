import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { optimizedImage } from "@/lib/imageUrl";

type Cached = { avatar_url: string | null; display_name: string | null };
const cache = new Map<string, Cached>();
const listeners = new Map<string, Set<(c: Cached) => void>>();
let realtimeReady = false;

function ensureRealtime() {
  if (realtimeReady) return;
  realtimeReady = true;
  supabase
    .channel("profiles-avatars-global")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles" },
      (payload) => {
        const p = payload.new as any;
        if (!p?.id) return;
        const next: Cached = { avatar_url: p.avatar_url ?? null, display_name: p.display_name ?? null };
        cache.set(p.id, next);
        listeners.get(p.id)?.forEach((fn) => fn(next));
      }
    )
    .subscribe();
}

async function fetchProfile(userId: string): Promise<Cached> {
  const { data } = await supabase
    .from("profiles")
    .select("avatar_url, display_name")
    .eq("id", userId)
    .maybeSingle();
  const c: Cached = { avatar_url: data?.avatar_url ?? null, display_name: data?.display_name ?? null };
  cache.set(userId, c);
  return c;
}

type Props = {
  userId?: string | null;
  fallbackUrl?: string | null;
  fallbackName?: string | null;
  className?: string;
  size?: number;
  online?: boolean;
};

export function UserAvatar({ userId, fallbackUrl, fallbackName, className, size = 36, online }: Props) {
  const [data, setData] = useState<Cached>(() => {
    if (userId && cache.has(userId)) return cache.get(userId)!;
    return { avatar_url: fallbackUrl ?? null, display_name: fallbackName ?? null };
  });

  useEffect(() => {
    if (!userId) return;
    ensureRealtime();
    let alive = true;
    if (!cache.has(userId)) {
      fetchProfile(userId).then((c) => alive && setData(c));
    } else {
      setData(cache.get(userId)!);
    }
    const set = listeners.get(userId) ?? new Set();
    const fn = (c: Cached) => alive && setData(c);
    set.add(fn);
    listeners.set(userId, set);
    return () => {
      alive = false;
      set.delete(fn);
    };
  }, [userId]);

  const url = data.avatar_url ?? fallbackUrl ?? null;
  const name = data.display_name ?? fallbackName ?? "?";
  const src = url ? optimizedImage(url, size * 2) : null;
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover bg-secondary"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-secondary grid place-items-center font-display font-bold text-muted-foreground"
          style={{ fontSize: Math.max(12, size * 0.4) }}
        >
          {initial}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
      )}
    </div>
  );
}
