import { memo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MessageCircle, Eye, Play } from "@/lib/icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { linkify } from "@/lib/linkify";
import { UserAvatar } from "./UserAvatar";

export type Video = {
  id: string;
  user_id: string;
  title?: string | null;
  caption?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  profile?: { username: string; display_name: string; avatar_url: string | null } | null;
};

function VideoCardImpl({ video }: { video: Video }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(video.likes_count);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("video_likes")
      .select("id")
      .eq("video_id", video.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [user, video.id]);

  const toggleLike = async () => {
    if (!user) { toast.info("Inicia sessão"); return; }
    if (liked) {
      setLiked(false); setLikes((n) => Math.max(0, n - 1));
      await supabase.from("video_likes").delete().eq("video_id", video.id).eq("user_id", user.id);
    } else {
      setLiked(true); setLikes((n) => n + 1);
      await supabase.from("video_likes").insert({ video_id: video.id, user_id: user.id });
    }
  };

  return (
    <article className="glass rounded-2xl border border-border overflow-hidden feed-item">
      <header className="flex items-center gap-2.5 p-3">
        <button onClick={() => video.profile?.username && navigate(`/u/${video.profile.username}`)} className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
          <UserAvatar userId={video.user_id} fallbackUrl={video.profile?.avatar_url} fallbackName={video.profile?.display_name} size={36} />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{video.profile?.display_name ?? "Utilizador"}</p>
            <p className="text-[11px] text-muted-foreground">@{video.profile?.username ?? "…"}</p>
          </div>
        </button>
      </header>
      <div className="relative aspect-[9/14] bg-black" onClick={() => navigate(`/v/${video.id}`)}>
        <video
          ref={videoRef}
          src={video.video_url}
          poster={video.thumbnail_url ?? undefined}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <Play className="w-12 h-12 text-white/80" />
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className="flex items-center gap-1.5">
            <Heart className={cn("w-5 h-5", liked && "fill-destructive text-destructive")} />
            <span className="text-sm font-semibold tabular">{likes}</span>
          </button>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm tabular">{video.comments_count}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground ml-auto">
            <Eye className="w-4 h-4" />
            <span className="text-xs tabular">{video.views_count}</span>
          </span>
        </div>
        {(video.title || video.caption) && (
          <p className="text-sm">{linkify(video.title || video.caption || "")}</p>
        )}
      </div>
    </article>
  );
}

const VideoCard = memo(VideoCardImpl);
export default VideoCard;
