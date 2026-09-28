import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import PhotoCard, { type Photo } from "@/components/PhotoCard";
import { SuggestedGroups } from "@/components/feed/SuggestedGroups";
import { StoriesRail } from "@/components/stories/StoriesRail";
import { SponsoredCard, type SponsoredAd } from "@/components/ads/SponsoredCard";
import { type SuggestedProfile } from "@/components/feed/FriendSuggestionCard";
import { PeopleCarousel } from "@/components/feed/PeopleCarousel";
import { InlineReel, type InlineReelData } from "@/components/feed/InlineReel";
import { Plus } from "@/lib/icons";
import { readView, writeView, isStale, saveScroll, readScroll, invalidateView } from "@/lib/viewCache";
import ChronosComposer from "@/components/composer/ChronosComposer";

const PHOTOS_PER_PAGE = 10;
const REELS_PER_PAGE = 4;
const SUGGESTIONS_PER_PAGE = 12;
const SUGGESTIONS_PER_CAROUSEL = 6;
const DISMISS_KEY = "chronos.feed.dismissedSuggestions.v1";

type FeedItem =
  | { kind: "photo"; key: string; photo: Photo }
  | { kind: "reel"; key: string; reel: InlineReelData }
  | { kind: "suggestion"; key: string; profiles: SuggestedProfile[] }
  | { kind: "ad"; key: string; ad: SponsoredAd }
  | { kind: "groups"; key: string };

function loadDismissed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
function persistDismissed(set: Set<string>) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(Array.from(set).slice(-500)));
  } catch {}
}

async function attachProfiles<T extends { user_id: string; profile?: any }>(rows: T[]): Promise<T[]> {
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  if (!ids.length) return rows;
  const { data: profs } = await supabase
    .from("profiles")
    .select("id,username,display_name,avatar_url")
    .in("id", ids);
  const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
  rows.forEach((r) => (r.profile = map.get(r.user_id) ?? null));
  return rows;
}

async function fetchPhotosBefore(before: string | null, limit: number, exclude: Set<string>) {
  let q = supabase.from("photos").select("*").order("created_at", { ascending: false }).limit(limit + 8);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  const safe = (data ?? []).filter((p: any) => p?.id && p.image_url && p.user_id && !exclude.has(p.id)) as Photo[];
  const trimmed = safe.slice(0, limit);
  await attachProfiles(trimmed as any);
  return trimmed;
}

async function fetchReelsBefore(before: string | null, limit: number, exclude: Set<string>) {
  let q = supabase
    .from("videos")
    .select("id,user_id,title,video_url,thumbnail_url,views_count,likes_count,created_at")
    .order("created_at", { ascending: false })
    .limit(limit + 8);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  const rows: (InlineReelData & { created_at: string })[] = (data ?? [])
    .filter((v: any) => v?.id && v.video_url && !exclude.has(v.id))
    .slice(0, limit)
    .map((v: any) => ({
      id: v.id,
      user_id: v.user_id,
      title: v.title ?? "",
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url,
      views_count: v.views_count ?? 0,
      likes_count: v.likes_count ?? 0,
      created_at: v.created_at,
    }));
  await attachProfiles(rows as any);
  return rows;
}

async function fetchSuggestions(userId: string | undefined, limit: number, exclude: Set<string>): Promise<SuggestedProfile[]> {
  let excludeIds: string[] = Array.from(exclude);
  if (userId) {
    const { data: f } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
    (f ?? []).forEach((x: any) => excludeIds.push(x.following_id));
    excludeIds.push(userId);
  }
  let q = supabase
    .from("profiles")
    .select("id,username,display_name,avatar_url,bio,followers_count")
    .order("followers_count", { ascending: false })
    .limit(limit + 12);
  if (excludeIds.length) q = q.not("id", "in", `(${excludeIds.join(",")})`);
  const { data } = await q;
  return ((data ?? []) as SuggestedProfile[]).slice(0, limit);
}

function buildInterlaced(photos: Photo[], reels: InlineReelData[], suggestions: SuggestedProfile[], pageIndex: number): FeedItem[] {
  const items: FeedItem[] = [];
  const rotation: Array<"suggestion" | "reel" | "suggestion" | "reel" | "groups"> = ["suggestion", "reel", "suggestion", "reel", "groups"];
  let rIdx = 0;
  let sIdx = 0;
  let rot = 0;
  const dedupePhoto = new Set<string>();
  photos.forEach((p, i) => {
    if (dedupePhoto.has(p.id)) return;
    dedupePhoto.add(p.id);
    items.push({ kind: "photo", key: `photo-${p.id}`, photo: p });
    if ((i + 1) % 2 === 0) {
      const slot = rotation[rot % rotation.length];
      rot++;
      if (slot === "reel" && rIdx < reels.length) {
        const r = reels[rIdx++];
        items.push({ kind: "reel", key: `reel-${r.id}`, reel: r });
      } else if (slot === "suggestion" && sIdx < suggestions.length) {
        const chunk = suggestions.slice(sIdx, sIdx + SUGGESTIONS_PER_CAROUSEL);
        sIdx += chunk.length;
        if (chunk.length) items.push({ kind: "suggestion", key: `sugg-${chunk[0].id}`, profiles: chunk });
      } else if (slot === "groups" && pageIndex === 0) {
        items.push({ kind: "groups", key: `groups-${pageIndex}` });
      } else if (rIdx < reels.length) {
        const r = reels[rIdx++];
        items.push({ kind: "reel", key: `reel-${r.id}`, reel: r });
      } else if (sIdx < suggestions.length) {
        const chunk = suggestions.slice(sIdx, sIdx + SUGGESTIONS_PER_CAROUSEL);
        sIdx += chunk.length;
        if (chunk.length) items.push({ kind: "suggestion", key: `sugg-${chunk[0].id}`, profiles: chunk });
      }
    }
  });
  while (rIdx < reels.length) {
    const r = reels[rIdx++];
    items.push({ kind: "reel", key: `reel-${r.id}`, reel: r });
  }
  while (sIdx < suggestions.length) {
    const chunk = suggestions.slice(sIdx, sIdx + SUGGESTIONS_PER_CAROUSEL);
    sIdx += chunk.length;
    if (chunk.length) items.push({ kind: "suggestion", key: `sugg-${chunk[0].id}`, profiles: chunk });
  }
  return items;
}

type HomeSnapshot = {
  pages: FeedItem[][];
  hasMore: boolean;
  oldestPhotoAt: string | null;
  oldestReelAt: string | null;
  pageIndex: number;
  seenPhotoIds: string[];
  seenReelIds: string[];
  seenSuggestIds: string[];
};

const HOME_CACHE_KEY = "view:home-feed";
const HOME_STALE_MS = 3 * 60_000;

export default function Home() {
  const { user } = useAuth();
  const cachedRef = useRef(readView<HomeSnapshot>(HOME_CACHE_KEY));
  const cached = cachedRef.current?.data ?? null;

  const [pages, setPages] = useState<FeedItem[][]>(cached?.pages ?? []);
  const [loading, setLoading] = useState(!cached);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(cached?.hasMore ?? true);
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);

  const seenPhotoIds = useRef<Set<string>>(new Set(cached?.seenPhotoIds ?? []));
  const seenReelIds = useRef<Set<string>>(new Set(cached?.seenReelIds ?? []));
  const seenSuggestIds = useRef<Set<string>>(new Set(cached?.seenSuggestIds ?? []));
  const dismissed = useRef<Set<string>>(loadDismissed());
  const oldestPhotoAt = useRef<string | null>(cached?.oldestPhotoAt ?? null);
  const oldestReelAt = useRef<string | null>(cached?.oldestReelAt ?? null);
  const pageIndexRef = useRef(cached?.pageIndex ?? 0);
  const pagesRef = useRef<FeedItem[][]>(pages);
  const hasMoreRef = useRef(hasMore);
  pagesRef.current = pages;
  hasMoreRef.current = hasMore;

  const persist = useCallback(() => {
    writeView<HomeSnapshot>(HOME_CACHE_KEY, {
      pages: pagesRef.current,
      hasMore: hasMoreRef.current,
      oldestPhotoAt: oldestPhotoAt.current,
      oldestReelAt: oldestReelAt.current,
      pageIndex: pageIndexRef.current,
      seenPhotoIds: [...seenPhotoIds.current],
      seenReelIds: [...seenReelIds.current],
      seenSuggestIds: [...seenSuggestIds.current],
    });
  }, []);

  const loadPage = useCallback(
    async (initial = false) => {
      const wantAds = pageIndexRef.current === 0;
      const [photos, reels, suggestions, adsRes] = await Promise.all([
        fetchPhotosBefore(oldestPhotoAt.current, PHOTOS_PER_PAGE, seenPhotoIds.current),
        fetchReelsBefore(oldestReelAt.current, REELS_PER_PAGE, seenReelIds.current),
        fetchSuggestions(user?.id, SUGGESTIONS_PER_PAGE, new Set([...Array.from(seenSuggestIds.current), ...Array.from(dismissed.current)])),
        wantAds
          ? (supabase as any).from("ads").select("id,target_type,target_id,headline,description,media_url,cta_type,cta_url,promoter_id").eq("status", "approved").order("created_at", { ascending: false }).limit(4)
          : Promise.resolve({ data: [] }),
      ]);

      const ads = ((adsRes?.data ?? []) as SponsoredAd[]).filter((a) => a && a.id);
      photos.forEach((p) => seenPhotoIds.current.add(p.id));
      reels.forEach((r) => seenReelIds.current.add(r.id));
      suggestions.forEach((s) => seenSuggestIds.current.add(s.id));
      if (photos.length) oldestPhotoAt.current = photos[photos.length - 1].created_at;
      if (reels.length) oldestReelAt.current = reels[reels.length - 1].created_at;

      const items = buildInterlaced(photos, reels, suggestions, pageIndexRef.current);
      ads.forEach((ad, i) => {
        const idx = 4 + i * 6;
        if (idx <= items.length) items.splice(idx, 0, { kind: "ad", key: `ad-${ad.id}-${pageIndexRef.current}-${i}`, ad });
      });
      pageIndexRef.current += 1;
      setPages((prev) => (initial ? [items] : [...prev, items]));
      setHasMore(photos.length >= PHOTOS_PER_PAGE || reels.length >= REELS_PER_PAGE);
      window.setTimeout(persist, 0);
    },
    [user?.id, persist]
  );

  const resetCursors = useCallback(() => {
    seenPhotoIds.current = new Set();
    seenReelIds.current = new Set();
    seenSuggestIds.current = new Set();
    oldestPhotoAt.current = null;
    oldestReelAt.current = null;
    pageIndexRef.current = 0;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const snap = cachedRef.current;
    const fresh = snap && !isStale(snap.age, HOME_STALE_MS) && snap.data.pages.length > 0;
    if (fresh) return;
    (async () => {
      const hadContent = pagesRef.current.length > 0;
      if (!hadContent) setLoading(true);
      resetCursors();
      await loadPage(true);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [loadPage, resetCursors]);

  useEffect(() => {
    const y = readScroll(HOME_CACHE_KEY);
    if (y > 0 && pagesRef.current.length > 0) {
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    }
    return () => {
      saveScroll(HOME_CACHE_KEY);
      persist();
    };
  }, [persist]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const onSeeMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    try { await loadPage(false); } finally { setLoadingMore(false); }
  }, [loadingMore, hasMore, loading, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) onSeeMore(); }, { rootMargin: "800px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [onSeeMore]);

  useEffect(() => {
    const channel = supabase.channel(`home-feed-realtime-${user?.id ?? "anon"}`);
    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "photos" }, (payload) => {
      const p: any = payload.new;
      if (!p?.id || seenPhotoIds.current.has(p.id)) return;
      setPendingNewCount((n) => n + 1);
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const refreshTop = async () => {
    setPendingNewCount(0);
    resetCursors();
    saveScroll(HOME_CACHE_KEY);
    invalidateView(HOME_CACHE_KEY);
    await loadPage(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handler = () => { refreshTop(); };
    window.addEventListener("home:refresh", handler);
    return () => window.removeEventListener("home:refresh", handler);
  }, [user?.id]);

  const dismissSuggestion = (id: string) => {
    dismissed.current.add(id);
    persistDismissed(dismissed.current);
    setPages((prev) =>
      prev.map((page) =>
        page
          .map((it) => (it.kind === "suggestion" ? { ...it, profiles: it.profiles.filter((p) => p.id !== id) } : it))
          .filter((it) => !(it.kind === "suggestion" && it.profiles.length === 0))
      )
    );
  };

  const removePhoto = (id: string) => {
    setPages((prev) => prev.map((page) => page.filter((it) => !(it.kind === "photo" && it.photo.id === id))));
  };

  const flatItems = useMemo(() => pages.flat(), [pages]);

  return (
    <div className="max-w-2xl mx-auto px-3 pb-6 space-y-3">
      <StoriesRail />

      {pendingNewCount > 0 && (
        <button
          onClick={refreshTop}
          className="w-full rounded-full gradient-money text-primary-foreground text-sm font-bold py-2 press"
        >
          {pendingNewCount} {pendingNewCount === 1 ? "nova publicação" : "novas publicações"}
        </button>
      )}

      <button
        onClick={() => setComposerOpen(true)}
        className="w-full glass rounded-2xl border border-border p-3 flex items-center gap-3 text-left press"
      >
        <span className="w-10 h-10 rounded-full bg-primary/15 grid place-items-center">
          <Plus className="w-5 h-5 text-primary" />
        </span>
        <span className="text-sm text-muted-foreground">O que estás a pensar?</span>
      </button>

      <ChronosComposer open={composerOpen} onOpenChange={setComposerOpen} onPublished={refreshTop} />

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl border border-border overflow-hidden animate-pulse">
              <div className="flex items-center gap-2 p-3">
                <div className="w-9 h-9 rounded-full bg-secondary" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-secondary rounded" />
                  <div className="h-2 w-20 bg-secondary rounded" />
                </div>
              </div>
              <div className="aspect-square bg-secondary/60" />
            </div>
          ))}
        </div>
      )}

      {!loading && flatItems.length === 0 && (
        <div className="text-center py-10 glass rounded-2xl border border-border">
          <p className="font-semibold">A preparar o teu feed…</p>
          <p className="text-xs text-muted-foreground mt-1">Descobre pessoas para começares a explorar.</p>
          <Link to="/discover" className="inline-block mt-3 rounded-full gradient-money text-primary-foreground text-xs font-bold px-4 py-2">
            Descobrir
          </Link>
        </div>
      )}

      {flatItems.map((it) => {
        if (it.kind === "photo") return <PhotoCard key={it.key} photo={it.photo} onDelete={removePhoto} />;
        if (it.kind === "reel") return <InlineReel key={it.key} reel={it.reel} />;
        if (it.kind === "suggestion") return <PeopleCarousel key={it.key} profiles={it.profiles} onDismiss={dismissSuggestion} />;
        if (it.kind === "groups") return <SuggestedGroups key={it.key} />;
        if (it.kind === "ad") return <SponsoredCard key={it.key} ad={it.ad} />;
        return null;
      })}

      <div ref={sentinelRef} className="h-12" />
      {!loading && loadingMore && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl border border-border overflow-hidden animate-pulse">
              <div className="flex items-center gap-2 p-3">
                <div className="w-9 h-9 rounded-full bg-secondary" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-secondary rounded" />
                  <div className="h-2 w-20 bg-secondary rounded" />
                </div>
              </div>
              <div className="aspect-square bg-secondary/60" />
            </div>
          ))}
        </div>
      )}
      {!loading && !hasMore && (
        <p className="text-xs text-muted-foreground py-6 text-center">Já viste tudo por agora</p>
      )}
    </div>
  );
}
