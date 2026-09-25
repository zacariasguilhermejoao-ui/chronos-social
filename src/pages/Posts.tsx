import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PhotoCard, { type Photo } from "@/components/PhotoCard";
import { ImageIcon } from "@/lib/icons";

const PAGE_SIZE = 20;

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Hoje";
  if (sameDay(d, yest)) return "Ontem";
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const enrich = useCallback(async (rows: Photo[]) => {
    const ids = Array.from(new Set(rows.map((p) => p.user_id)));
    if (!ids.length) return rows;
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", ids);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    return rows.map((p) => ({ ...p, profile: map.get(p.user_id) ?? null }));
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1);
    const safe = (data ?? []).filter((p) => p && p.id && p.image_url && p.user_id);
    const withProfiles = await enrich(safe as Photo[]);
    setPosts(withProfiles);
    setHasMore((data?.length ?? 0) === PAGE_SIZE);
    setLoading(false);
  }, [enrich]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false })
      .range(posts.length, posts.length + PAGE_SIZE - 1);
    const safe = (data ?? []).filter((p) => p && p.id && p.image_url && p.user_id);
    const withProfiles = await enrich(safe as Photo[]);
    setPosts((prev) => [...prev, ...withProfiles]);
    setHasMore((data?.length ?? 0) === PAGE_SIZE);
    setLoadingMore(false);
  }, [posts.length, loadingMore, hasMore, enrich]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const channel = supabase.channel(`posts-global-${user?.id ?? "anon"}`);
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "photos" },
      async (payload) => {
        const p = payload.new as Photo;
        if (!p?.id || !p.image_url) return;
        setPosts((prev) => (prev.some((x) => x.id === p.id) ? prev : prev));
        const enriched = await enrich([p]);
        setPosts((prev) => (prev.some((x) => x.id === p.id) ? prev : [enriched[0], ...prev]));
      }
    );
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, enrich]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const groups: { label: string; items: Photo[] }[] = [];
  for (const p of posts) {
    const label = dayLabel(p.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(p);
    else groups.push({ label, items: [p] });
  }

  return (
    <div className="px-4 py-4 max-w-xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Publicações</h1>
        <span className="text-xs text-muted-foreground">{posts.length}</span>
      </div>

      {loading && <div className="text-sm text-muted-foreground py-12 text-center">A carregar...</div>}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16 glass rounded-2xl">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Sem publicações</p>
          <p className="text-xs text-muted-foreground mt-1">
            Segue pessoas para veres aqui as suas publicações mais recentes.
          </p>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.label} className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold sticky top-16 bg-background/80 backdrop-blur-sm py-1 z-10">
            {g.label}
          </h2>
          {g.items.map((p) => (
            <PhotoCard
              key={p.id}
              photo={p}
              onDelete={(id) => setPosts((arr) => arr.filter((x) => x.id !== id))}
            />
          ))}
        </section>
      ))}

      <div ref={sentinelRef} className="h-10" />
      {loadingMore && <div className="text-xs text-muted-foreground text-center">A carregar mais...</div>}
    </div>
  );
}
