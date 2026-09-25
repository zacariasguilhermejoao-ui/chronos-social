import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeedPage, type FeedVideo, type FeedPage } from "@/pages/Feed";
import { ReelItem } from "@/components/reels/ReelItem";

export default function Reels() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const startId = params.get("start");

  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<FeedPage["cursor"]>(null);
  const loadingMoreRef = useRef(false);
  const doneRef = useRef(false);
  const jumpedRef = useRef(false);

  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        let first: FeedVideo[] = [];
        if (startId) {
          const { data: v } = await supabase
            .from("videos")
            .select(
              "id,user_id,title,description,video_url,thumbnail_url,views_count,likes_count,comments_count,total_revenue_coins,audio_source_video_id,audio_uses_count,category,created_at"
            )
            .eq("id", startId)
            .maybeSingle();
          if (v) {
            const { data: p } = await supabase
              .from("profiles")
              .select("username,display_name,avatar_url")
              .eq("id", (v as any).user_id)
              .maybeSingle();
            first = [{ ...(v as any), profiles: (p as any) ?? null }];
          }
        }
        const page = await fetchFeedPage(null, ac.signal);
        cursorRef.current = page.cursor;
        const merged = [...first, ...page.rows.filter((r) => !first.some((f) => f.id === r.id))];
        setVideos(merged);
        setActiveId(merged[0]?.id ?? null);
      } catch {
        /* silencioso */
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [startId]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || doneRef.current || !cursorRef.current) return;
    loadingMoreRef.current = true;
    const ac = new AbortController();
    try {
      const page = await fetchFeedPage(cursorRef.current, ac.signal);
      cursorRef.current = page.cursor;
      if (page.rows.length === 0) doneRef.current = true;
      setVideos((prev) => {
        const seen = new Set(prev.map((v) => v.id));
        return [...prev, ...page.rows.filter((r) => !seen.has(r.id))];
      });
    } catch {
      /* ignora */
    } finally {
      loadingMoreRef.current = false;
    }
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || videos.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = (top?.target as HTMLElement | undefined)?.dataset?.id;
        if (id) {
          setActiveId(id);
          const idx = videos.findIndex((v) => v.id === id);
          if (idx >= 0 && idx >= videos.length - 3) loadMore();
        }
      },
      { root, threshold: [0.6] }
    );
    root.querySelectorAll("section[data-id]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [videos, loadMore]);

  useEffect(() => {
    if (jumpedRef.current || !startId || videos.length === 0) return;
    const el = containerRef.current?.querySelector(`section[data-id="${CSS.escape(startId)}"]`);
    if (el) {
      (el as HTMLElement).scrollIntoView({ block: "start" });
      jumpedRef.current = true;
      setActiveId(startId);
    }
  }, [startId, videos]);

  const activeIndex = useMemo(() => videos.findIndex((v) => v.id === activeId), [videos, activeId]);

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar overscroll-contain"
        style={{ scrollBehavior: "auto" }}
      >
        {loading && (
          <div className="h-[100dvh] grid place-items-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="h-[100dvh] grid place-items-center px-10 text-center">
            <p className="text-white/70 text-sm">Ainda não há reels para mostrar.</p>
          </div>
        )}

        {videos.map((v, i) => (
          <ReelItem
            key={v.id}
            video={v}
            active={v.id === activeId}
            viewerId={user?.id ?? null}
            preload={Math.abs(i - activeIndex) <= 1 ? "auto" : "none"}
          />
        ))}
      </div>
    </div>
  );
}
