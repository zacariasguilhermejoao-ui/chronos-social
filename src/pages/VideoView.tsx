import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import VideoCard, { type Video } from "@/components/VideoCard";

export default function VideoView() {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
      if (!data) return;
      const { data: prof } = await supabase.from("profiles").select("username,display_name,avatar_url").eq("id", data.user_id).maybeSingle();
      setVideo({ ...(data as any), profile: prof });
    })();
  }, [id]);

  if (!video) return <div className="p-8 text-center text-muted-foreground">A carregar…</div>;
  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <VideoCard video={video} />
    </div>
  );
}
