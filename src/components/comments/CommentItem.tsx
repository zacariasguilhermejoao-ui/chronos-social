import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Heart, MessageCircle, Trash2, AlertTriangle, Mic } from "@/lib/icons";
import { UserAvatar } from "@/components/UserAvatar";
import { linkify } from "@/lib/linkify";
import { CommentAudioPlayer } from "./CommentAudioPlayer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type CommentKind = "video" | "photo";

export type CommentRow = {
  id: string;
  user_id: string;
  content: string | null;
  audio_url: string | null;
  audio_duration_sec: number | null;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  profile?: { username: string; display_name: string; avatar_url: string | null } | null;
};

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const TABLES = {
  video: { comments: "video_comments", likes: "video_comment_likes" },
  photo: { comments: "photo_comments", likes: "photo_comment_likes" },
} as const;

export function CommentItem({
  kind,
  comment,
  postOwnerId,
  onReply,
  onDeleted,
}: {
  kind: CommentKind;
  comment: CommentRow;
  postOwnerId: string | null;
  onReply?: (c: CommentRow) => void;
  onDeleted?: (id: string) => void;
}) {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes_count ?? 0);

  const canDelete = !!user && (user.id === comment.user_id || user.id === postOwnerId || isAdmin);
  const isAudio = !!comment.audio_url;

  useEffect(() => {
    setLikes(comment.likes_count ?? 0);
    if (!user) { setLiked(false); return; }
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from(TABLES[kind].likes)
        .select("id")
        .eq("comment_id", comment.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (alive) setLiked(!!data);
    })();
    return () => { alive = false; };
  }, [user, comment.id, comment.likes_count, kind]);

  const toggleLike = async () => {
    if (!user) { toast.info("Inicia sessão para curtir"); return; }
    if (liked) {
      setLiked(false); setLikes((n) => Math.max(0, n - 1));
      await supabase.from(TABLES[kind].likes).delete().eq("comment_id", comment.id).eq("user_id", user.id);
    } else {
      setLiked(true); setLikes((n) => n + 1);
      await supabase.from(TABLES[kind].likes).insert({ comment_id: comment.id, user_id: user.id });
    }
  };

  const remove = async () => {
    if (!canDelete) return;
    const { error } = await supabase.from(TABLES[kind].comments).delete().eq("id", comment.id);
    if (error) toast.error("Falha ao apagar");
    else onDeleted?.(comment.id);
  };

  const report = async () => {
    if (!user) { toast.info("Inicia sessão"); return; }
    const { error } = await (supabase as any).from("reports").insert({
      reporter_id: user.id,
      target_type: "comment",
      target_id: comment.id,
      reason: "inappropriate",
    });
    if (error) toast.error("Falha ao denunciar");
    else toast.success("Denúncia enviada");
  };

  return (
    <div className="flex gap-2.5 items-start group">
      <UserAvatar
        userId={comment.user_id}
        fallbackUrl={comment.profile?.avatar_url}
        fallbackName={comment.profile?.display_name}
        size={36}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-semibold text-sm truncate">
            {comment.profile?.display_name ?? "anon"}
          </span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(comment.created_at)}</span>
          {isAudio && (
            <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
              <Mic className="w-2.5 h-2.5" /> Áudio
            </span>
          )}
        </div>

        {isAudio ? (
          <div className="mt-1">
            <CommentAudioPlayer
              src={comment.audio_url!}
              durationHint={comment.audio_duration_sec}
            />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">
            {linkify(comment.content ?? "")}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <button onClick={toggleLike} className="flex items-center gap-1 hover:text-foreground">
            <Heart
              className={cn("w-3.5 h-3.5", liked && "fill-destructive text-destructive")}
              weight={liked ? "fill" : "bold"}
            />
            {likes > 0 && <span className="font-mono tabular">{likes}</span>}
          </button>
          {onReply && (
            <button onClick={() => onReply(comment)} className="flex items-center gap-1 hover:text-foreground">
              <MessageCircle className="w-3.5 h-3.5" /> Responder
            </button>
          )}
          <button onClick={report} className="flex items-center gap-1 hover:text-destructive ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
          {canDelete && (
            <button onClick={remove} className="flex items-center gap-1 hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
