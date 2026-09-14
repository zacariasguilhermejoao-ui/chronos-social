import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PhotoCard, { type Photo } from "@/components/PhotoCard";
import { ImageIcon } from "@/lib/icons";

export default function Photos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: phs, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const safe = (phs ?? []).filter((p) => p && p.id && p.image_url && p.user_id);
      const ids = Array.from(new Set(safe.map((p) => p.user_id)));
      let map = new Map<string, any>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", ids);
        map = new Map((profs ?? []).map((p) => [p.id, p]));
      }
      setPhotos(safe.map((p) => ({ ...p, profile: map.get(p.user_id) ?? null })));
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`photos-feed-${user.id}`);
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "photos" },
      () => load()
    );
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  return (
    <div className="px-4 py-4 max-w-xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Fotos</h1>
        <span className="text-xs text-muted-foreground">{photos.length} posts</span>
      </div>

      {loading && <div className="text-sm text-muted-foreground py-12 text-center">A carregar...</div>}

      {!loading && photos.length === 0 && (
        <div className="text-center py-16 glass rounded-2xl">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Nenhuma foto ainda</p>
          <p className="text-xs text-muted-foreground mt-1">Segue pessoas ou publica a primeira foto.</p>
        </div>
      )}

      {photos.map((p) => (
        <PhotoCard key={p.id} photo={p} onDelete={(id) => setPhotos((arr) => arr.filter((x) => x.id !== id))} />
      ))}
    </div>
  );
}
