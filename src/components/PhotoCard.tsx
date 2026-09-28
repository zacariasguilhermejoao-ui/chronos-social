import { memo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MessageCircle, Eye, MoreHorizontal } from "@/lib/icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { linkify } from "@/lib/linkify";
import { UserAvatar } from "./UserAvatar";
import { optimizedImageUrl } from "@/lib/imageUrl";

export type Photo = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  profile?: { username: string; display_name: string; avatar_url: string | null } | null;
};

function PhotoCardImpl({ photo, onDelete }: { photo: Photo; onDelete?: (id: string) => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(photo.likes_count);
  const rootRef = useRef<HTMLElement | null>(null);
  const isOwner = user?.id === photo.user_id;

  useEffect(() => {
    setLikes(photo.likes_count);
  }, [photo.likes_count]);

  useEffect(() => {
    if (!user) { setLiked(false); return; }
    let cancelled = false;
    supabase
      .from("photo_likes")
      .select("id")
      .eq("photo_id", photo.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (!cancelled) setLiked(!!data); });
    return () => { cancelled = true; };
  }, [user, photo.id]);

  useEffect(() => {
    if (!user || isOwner) return;
    const el = rootRef.current;
    if (!el) return;
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (done || !entries.some((e) => e.isIntersecting)) return;
        done = true;
        io.disconnect();
        supabase.from("photo_views").insert({ photo_id: photo.id, user_id: user.id }).then(() => {});
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [user, photo.id, isOwner]);

  const toggleLike = async () => {
    if (!user) { toast.info("Inicia sessão para curtir"); return; }
    if (liked) {
      setLiked(false); setLikes((n) => Math.max(0, n - 1));
      await supabase.from("photo_likes").delete().eq("photo_id", photo.id).eq("user_id", user.id);
    } else {
      setLiked(true); setLikes((n) => n + 1);
      await supabase.from("photo_likes").insert({ photo_id: photo.id, user_id: user.id });
    }
  };

  const src = optimizedImageUrl(photo.image_url, 720) ?? photo.image_url;

  return (
    <article ref={rootRef as any} className="glass rounded-2xl border border-border overflow-hidden feed-item">
      <header className="flex items-center gap-2.5 p-3">
        <button onClick={() => photo.profile?.username && navigate(`/u/${photo.profile.username}`)} className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
          <UserAvatar
            userId={photo.user_id}
            fallbackUrl={photo.profile?.avatar_url}
            fallbackName={photo.profile?.display_name}
            size={36}
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{photo.profile?.display_name ?? "Utilizador"}</p>
            <p className="text-[11px] text-muted-foreground truncate">@{photo.profile?.username ?? "…"}</p>
          </div>
        </button>
        {isOwner && onDelete && (
          <button
            onClick={async () => {
              await supabase.from("photos").delete().eq("id", photo.id);
              onDelete(photo.id);
            }}
            className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground hover:text-destructive"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </header>

      <button onClick={toggleLike} className="block w-full" type="button">
        <img src={src} alt={photo.caption ?? ""} className="w-full aspect-square object-cover" loading="lazy" />
      </button>

      <div className="p-3 space-y-2">
        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className="flex items-center gap-1.5">
            <Heart className={cn("w-5 h-5", liked && "fill-destructive text-destructive")} />
            <span className="text-sm font-semibold tabular">{likes}</span>
          </button>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm tabular">{photo.comments_count}</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground ml-auto">
            <Eye className="w-4 h-4" />
            <span className="text-xs tabular">{photo.views_count}</span>
          </span>
        </div>
        {photo.caption && (
          <p className="text-sm whitespace-pre-wrap break-words">{linkify(photo.caption)}</p>
        )}
      </div>
    </article>
  );
}

const PhotoCard = memo(PhotoCardImpl);
export default PhotoCard;
