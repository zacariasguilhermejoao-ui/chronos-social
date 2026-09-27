import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VideoCard } from "@/components/VideoCard";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";

export type FeedVideo = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  views_count: number;
  likes_count: number;
  comments_count?: number;
  total_revenue_coins: number;
  audio_source_video_id?: string | null;
  audio_uses_count?: number;
  category?: string | null;
  created_at: string;
  profiles: { username: string; display_name: string; avatar_url: string | null } | null;
};

const PAGE_SIZE = 10;
const FEED_TIMEOUT_MS = 6000;
const FEED_CACHE_KEY = "chronos.feed.cache.v2";

function isValidVideo(v: any): v is FeedVideo {
  return (
    v &&
    typeof v.id === "string" &&
    typeof v.user_id === "string" &&
    typeof v.video_url === "string" &&
    v.video_url.trim().length > 0 &&
    typeof v.title === "string"
  );
}

function VideoSkeleton() {
  return (
    <div className="h-[calc(100vh-9rem)] snap-start relative bg-black/60">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 animate-pulse" />
      <div className="absolute bottom-6 left-4 right-16 space-y-3">
        <div className="h-10 w-10 rounded-full bg-foreground/10 animate-pulse" />
        <div className="h-3 w-32 rounded bg-foreground/10 animate-pulse" />
        <div className="h-3 w-56 rounded bg-foreground/10 animate-pulse" />
      </div>
    </div>
  );
}

export type FeedPage = { rows: FeedVideo[]; cursor: { created_at: string; id: string } | null };
type Page = FeedPage;

export async function fetchFeedPage(cursor: { created_at: string; id: string } | null, signal: AbortSignal): Promise<Page> {
  try {
    const { data, error } = await (supabase.rpc as any)("feed_page", {
      p_limit: PAGE_SIZE,
      p_cursor_created_at: cursor?.created_at ?? null,
      p_cursor_id: cursor?.id ?? null,
    }).abortSignal(signal);
    if (!error && Array.isArray(data)) {
      const rows: FeedVideo[] = (data as any[])
        .map((r) => ({
          id: r.id,
          user_id: r.user_id,
          title: r.title,
          description: r.description,
          video_url: r.video_url,
          thumbnail_url: r.thumbnail_url,
          views_count: r.views_count,
          likes_count: r.likes_count,
          comments_count: r.comments_count,
          total_revenue_coins: r.total_revenue_coins,
          audio_source_video_id: r.audio_source_video_id,
          audio_uses_count: r.audio_uses_count,
          category: r.category,
          created_at: r.created_at,
          profiles: r.username
            ? { username: r.username, display_name: r.display_name, avatar_url: r.avatar_url }
            : null,
        }))
        .filter(isValidVideo);
      const last = rows[rows.length - 1];
      return { rows, cursor: last ? { created_at: last.created_at, id: last.id } : null };
    }
  } catch {
    /* fallback abaixo */
  }

  let q = supabase
    .from("videos")
    .select(
      "id,user_id,title,description,video_url,thumbnail_url,views_count,likes_count,comments_count,total_revenue_coins,audio_source_video_id,audio_uses_count,category,created_at"
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);
  if (cursor) {
    q = q.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    );
  }
  const { data: vids, error } = await q.abortSignal(signal);
  if (error) throw error;
  const safe = (vids ?? []).filter(isValidVideo);
  const userIds = Array.from(new Set(safe.map((v) => v.user_id)));
  let profilesMap = new Map<string, FeedVideo["profiles"]>();
  if (userIds.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id,username,display_name,avatar_url")
      .in("id", userIds)
      .abortSignal(signal);
    profilesMap = new Map(
      (profs ?? []).map((p: any) => [
        p.id,
        { username: p.username, display_name: p.display_name, avatar_url: p.avatar_url },
      ])
    );
  }
  const rows: FeedVideo[] = safe.map((v: any) => ({ ...v, profiles: profilesMap.get(v.user_id) ?? null }));
  const last = rows[rows.length - 1];
  return { rows, cursor: last ? { created_at: last.created_at, id: last.id } : null };
}

export default function Feed() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const startId = searchParams.get("start");
  const [videos, setVideos] = useState<FeedVideo[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(FEED_CACHE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => videos.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(() => videos[0]?.id ?? null);
  const [cursor, setCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set(videos.map((v) => v.id)));

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
    (async () => {
      try {
        const page = await fetchFeedPage(null, controller.signal);
        if (cancelled) return;
        seenIdsRef.current = new Set(page.rows.map((v) => v.id));
        setVideos(page.rows);
        setCursor(page.cursor);
        setHasMore(page.rows.length >= PAGE_SIZE);
        setError(null);
        if (page.rows.length > 0) setActiveId(page.rows[0].id);
        try {
          window.localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(page.rows.slice(0, 20)));
        } catch {}
      } catch (e: any) {
        if (cancelled) return;
        if (videos.length === 0) {
          const isAbort = e?.name === "AbortError" || String(e?.message ?? "").toLowerCase().includes("abort");
          setError(isAbort ? "A ligação demorou demasiado. Tenta novamente." : e?.message ?? "Falhou a carregar o feed.");
        }
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTick]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursor) return;
    setLoadingMore(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
    try {
      const page = await fetchFeedPage(cursor, controller.signal);
      const fresh = page.rows.filter((r) => !seenIdsRef.current.has(r.id));
      fresh.forEach((r) => seenIdsRef.current.add(r.id));
      setVideos((prev) => [...prev, ...fresh]);
      setCursor(page.cursor);
      setHasMore(page.rows.length >= PAGE_SIZE);
    } catch {
      /* silencioso */
    } finally {
      window.clearTimeout(timeout);
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore]);

  useEffect(() => {
    if (!sentinelRef.current || !containerRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { root: containerRef.current, rootMargin: "800px 0px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loadMore]);

  useEffect(() => {
    if (!containerRef.current || videos.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.7) {
            setActiveId(e.target.getAttribute("data-id"));
          }
        });
      },
      { threshold: [0.7], root: containerRef.current }
    );
    const els = containerRef.current.querySelectorAll("[data-id]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [videos]);

  useEffect(() => {
    if (!activeId || !hasMore || loadingMore) return;
    const idx = videos.findIndex((v) => v.id === activeId);
    if (idx >= 0 && videos.length - idx <= 3) {
      loadMore();
    }
  }, [activeId, videos, hasMore, loadingMore, loadMore]);

  useEffect(() => {
    if (!startId || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-id="${startId}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
      setActiveId(startId);
    }
  }, [startId, videos]);

  if (loading && videos.length === 0) {
    return (
      <div className="h-[calc(100vh-9rem)] overflow-hidden">
        <VideoSkeleton />
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="h-[calc(100vh-9rem)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-warning/15 grid place-items-center mb-4">
          <AlertTriangle className="w-7 h-7 text-warning" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">Não foi possível carregar o feed</h2>
        <p className="text-muted-foreground text-sm max-w-xs mb-5">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            setLoading(true);
            setReloadTick((t) => t + 1);
          }}
          variant="outline"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-[calc(100vh-9rem)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-2xl gradient-violet grid place-items-center shadow-violet mb-6">
          <Plus className="w-10 h-10 text-accent-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">O feed está vazio</h2>
        <p className="text-muted-foreground text-sm max-w-xs mb-6">
          Sê o primeiro criador. Faz upload de um vídeo e começa a ganhar pela atenção que receberes.
        </p>
        <Link to="/upload">
          <Button className="gradient-money text-primary-foreground font-display font-bold shadow-money">
            Fazer upload
          </Button>
        </Link>
      </div>
    );
  }

  const activeIndex = Math.max(0, videos.findIndex((v) => v.id === activeId));

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-9rem)] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      style={{ WebkitOverflowScrolling: "touch" as any, overscrollBehaviorY: "contain" }}
    >
      {videos.map((v, i) => {
        const dist = Math.abs(i - activeIndex);
        const preload: "auto" | "metadata" | "none" =
          dist === 0 ? "auto" : dist === 1 ? "metadata" : "none";
        return (
          <VideoCard
            key={v.id}
            video={v}
            active={activeId === v.id}
            viewerId={user?.id ?? null}
            viewerProfileId={user?.id ?? null}
            preload={preload}
          />
        );
      })}
      {hasMore && (
        <div ref={sentinelRef} className="h-24 grid place-items-center text-muted-foreground text-xs">
          {loadingMore ? "A carregar mais…" : ""}
        </div>
      )}
    </div>
  );
}
