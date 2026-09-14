import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoCard } from "@/components/VideoCard";
import type { FeedVideo } from "@/pages/Feed";
import { ArrowLeft } from "@/lib/icons";

export default function VideoView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<FeedVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: v } = await supabase
        .from("videos")
        .select("id,user_id,title,description,video_url,views_count,likes_count,comments_count,total_revenue_coins,audio_source_video_id,audio_uses_count,category,created_at")
        .eq("id", id)
        .maybeSingle();
      if (!v) { setLoading(false); return; }
      const { data: p } = await supabase
        .from("profiles")
        .select("username,display_name,avatar_url")
        .eq("id", v.user_id)
        .maybeSingle();
      setVideo({ ...(v as any), profiles: (p as any) ?? null });
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="h-screen grid place-items-center bg-black"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!video) {
    return <div className="p-6 text-center text-muted-foreground">Vídeo não encontrado.</div>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full glass grid place-items-center text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <VideoCard video={video} active />
    </div>
  );
}
