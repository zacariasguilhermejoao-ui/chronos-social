import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Play, Eye } from "@/lib/icons";

type Reel = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string;
  views_count: number;
  user_id: string;
};

export function ReelsRail() {
  const [reels, setReels] = useState<Reel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("videos")
        .select("id,title,thumbnail_url,video_url,views_count,user_id")
        .order("created_at", { ascending: false })
        .limit(10);
      setReels((data ?? []) as Reel[]);
    })();
  }, []);

  if (reels.length === 0) return null;

  return (
    <section className="glass rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg gradient-violet grid place-items-center">
            <Play className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-display font-bold text-sm">Reels</h3>
        </div>
        <button
          onClick={() => navigate("/reels")}
          className="text-xs text-accent font-semibold"
        >
          Ver todos
        </button>
      </header>
      <div className="flex gap-2 px-3 pb-3 overflow-x-auto no-scrollbar snap-x">
        {reels.map((r) => (
          <button
            key={r.id}
            onClick={() => navigate(`/reels?start=${r.id}`)}
            className="relative shrink-0 w-28 aspect-[9/16] rounded-xl overflow-hidden bg-secondary snap-start group"
          >
            {r.thumbnail_url ? (
              <img
                src={r.thumbnail_url}
                alt={r.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 text-[10px] text-white/90 font-mono bg-black/40 rounded-full px-1.5 py-0.5">
              <Eye className="w-3 h-3" />
              {r.views_count ?? 0}
            </div>
            <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[11px] text-white font-semibold line-clamp-2 text-left leading-tight">
              {r.title}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
