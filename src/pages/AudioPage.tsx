import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Music, Plus } from "@/lib/icons";
import { Button } from "@/components/ui/button";

type SourceVideo = {
  id: string;
  title: string;
  user_id: string;
  audio_uses_count: number;
  video_url: string;
  thumbnail_url: string | null;
};

type Profile = { username: string; display_name: string; avatar_url: string | null };

export default function AudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [source, setSource] = useState<SourceVideo | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [uses, setUses] = useState<{ id: string; title: string; thumbnail_url: string | null; video_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: src } = await supabase
        .from("videos")
        .select("id,title,user_id,audio_uses_count,video_url,thumbnail_url")
        .eq("id", id)
        .maybeSingle();
      if (!src) { setLoading(false); return; }
      setSource(src as any);
      const { data: prof } = await supabase
        .from("profiles")
        .select("username,display_name,avatar_url")
        .eq("id", src.user_id)
        .maybeSingle();
      setAuthor((prof as any) ?? null);
      const { data: u } = await supabase
        .from("videos")
        .select("id,title,thumbnail_url,video_url")
        .eq("audio_source_video_id", id)
        .order("created_at", { ascending: false })
        .limit(60);
      setUses((u as any) ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="grid place-items-center py-20"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!source) {
    return <div className="p-6 text-center text-muted-foreground">Áudio não encontrado.</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border/60">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-display font-bold text-lg">Áudio</h1>
      </div>

      <div className="px-4 py-5 flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl gradient-violet grid place-items-center shadow-violet shrink-0">
          <Music className="w-9 h-9 text-accent-foreground animate-spin-slow" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-bold text-base truncate">{source.title}</h2>
          {author && (
            <Link to={`/u/${author.username}`} className="text-xs text-muted-foreground truncate block">
              Original • @{author.username}
            </Link>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            {source.audio_uses_count} {source.audio_uses_count === 1 ? "vídeo usa" : "vídeos usam"} este áudio
          </p>
        </div>
      </div>

      <div className="px-4">
        <Button
          onClick={() => navigate(`/upload?audio=${source.id}`)}
          className="w-full h-11 gradient-money text-primary-foreground font-display font-bold shadow-money"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Usar este áudio
        </Button>
      </div>

      <div className="px-4 py-5">
        <h3 className="font-display font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
          Vídeos com este áudio
        </h3>
        {uses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sê o primeiro a usar este áudio.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {uses.map((v) => (
              <Link key={v.id} to={`/v/${v.id}`} className="aspect-[9/16] rounded-xl overflow-hidden bg-secondary relative">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <video src={v.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <p className="text-[10px] text-white line-clamp-2">{v.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
