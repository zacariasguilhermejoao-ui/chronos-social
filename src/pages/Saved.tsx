import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bookmark, Film } from "@/lib/icons";

type SavedRow = {
  video_id: string;
  created_at: string;
  videos: {
    id: string;
    title: string;
    video_url: string;
    thumbnail_url: string | null;
    user_id: string;
    views_count: number;
  } | null;
};

export default function Saved() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("saved_videos")
        .select("video_id, created_at, videos:video_id(id,title,video_url,thumbnail_url,user_id,views_count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-warning/15 grid place-items-center mx-auto mb-4">
          <Bookmark className="w-7 h-7 text-warning" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">Sem vídeos guardados</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Toca no ícone de marcador num vídeo para o guardar nos teus favoritos.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in">
      <h1 className="font-display font-bold text-2xl mb-4 flex items-center gap-2">
        <Bookmark className="w-6 h-6 text-warning" weight="fill" />
        Guardados
      </h1>
      <div className="grid grid-cols-3 gap-1.5">
        {items.map((it) => {
          const v = it.videos;
          if (!v) return null;
          return (
            <Link
              key={v.id}
              to={`/v/${v.id}`}
              className="aspect-[9/16] rounded-xl overflow-hidden bg-secondary relative group"
            >
              {v.thumbnail_url ? (
                <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <video src={v.video_url} className="w-full h-full object-cover" muted preload="metadata" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-[11px] text-white font-medium line-clamp-2">{v.title}</p>
              </div>
              <div className="absolute top-1.5 right-1.5">
                <Film className="w-3.5 h-3.5 text-white/90" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
