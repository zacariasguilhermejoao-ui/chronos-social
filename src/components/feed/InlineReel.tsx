import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "@/lib/icons";
import { UserAvatar } from "@/components/UserAvatar";

export type InlineReelData = {
  id: string;
  user_id: string;
  title?: string;
  video_url: string;
  thumbnail_url?: string | null;
  views_count?: number;
  likes_count?: number;
  profile?: { username: string; display_name: string; avatar_url: string | null } | null;
};

export function InlineReel({ reel }: { reel: InlineReelData }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <article className="glass rounded-2xl border border-border overflow-hidden feed-item">
      <header className="flex items-center gap-2 p-3">
        <UserAvatar userId={reel.user_id} fallbackUrl={reel.profile?.avatar_url} fallbackName={reel.profile?.display_name} size={32} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{reel.profile?.display_name ?? "Utilizador"}</p>
          <p className="text-[11px] text-muted-foreground">@{reel.profile?.username ?? "…"}</p>
        </div>
      </header>
      <button type="button" className="relative block w-full aspect-[9/14] bg-black" onClick={() => navigate(`/v/${reel.id}`)}>
        <video
          ref={ref}
          src={reel.video_url}
          poster={reel.thumbnail_url ?? undefined}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
        <span className="absolute inset-0 grid place-items-center pointer-events-none">
          <Play className="w-12 h-12 text-white/80" />
        </span>
      </button>
      {reel.title && <p className="p-3 text-sm line-clamp-2">{reel.title}</p>}
    </article>
  );
}
