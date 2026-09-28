import { useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from "@/lib/icons";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

export type ReelData = {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  likes_count?: number;
  comments_count?: number;
  profile?: { username: string; display_name: string; avatar_url: string | null } | null;
};

export function ReelItem({
  reel,
  active,
  muted,
  onToggleMute,
}: {
  reel: ReelData;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);

  if (ref.current) {
    if (active) ref.current.play().catch(() => {});
    else ref.current.pause();
  }

  return (
    <div className="relative h-full w-full bg-black snap-start">
      <video
        ref={ref}
        src={reel.video_url}
        poster={reel.thumbnail_url ?? undefined}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={muted}
      />
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <UserAvatar userId={reel.user_id} fallbackUrl={reel.profile?.avatar_url} fallbackName={reel.profile?.display_name} size={36} />
          <span className="text-white font-semibold text-sm">{reel.profile?.display_name ?? "@user"}</span>
        </div>
        {reel.title && <p className="text-white text-sm line-clamp-2">{reel.title}</p>}
      </div>
      <div className="absolute right-3 bottom-24 flex flex-col gap-4 items-center">
        <button onClick={() => setLiked((v) => !v)} className="text-white flex flex-col items-center">
          <Heart className={cn("w-7 h-7", liked && "fill-destructive text-destructive")} />
          <span className="text-xs">{reel.likes_count ?? 0}</span>
        </button>
        <button className="text-white flex flex-col items-center">
          <MessageCircle className="w-7 h-7" />
          <span className="text-xs">{reel.comments_count ?? 0}</span>
        </button>
        <button onClick={onToggleMute} className="text-white">
          {muted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
        </button>
      </div>
    </div>
  );
}
