import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { X } from "@/lib/icons";
import { toast } from "sonner";
import { CommentComposer } from "./comments/CommentComposer";
import { CommentItem, type CommentRow } from "./comments/CommentItem";

export function VideoComments({
  videoId,
  open,
  onClose,
}: {
  videoId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [postOwnerId, setPostOwnerId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<CommentRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data }, { data: v }] = await Promise.all([
      supabase
        .from("video_comments")
        .select("id, user_id, content, audio_url, audio_duration_sec, parent_id, likes_count, created_at")
        .eq("video_id", videoId)
        .order("created_at", { ascending: true }),
      supabase.from("videos").select("user_id").eq("id", videoId).maybeSingle(),
    ]);
    setPostOwnerId((v as any)?.user_id ?? null);
    if (!data) { setItems([]); setLoading(false); return; }
    const ids = Array.from(new Set(data.map((c: any) => c.user_id)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", ids)
      : { data: [] as any[] };
    const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
    setItems(data.map((c: any) => ({ ...c, profile: map.get(c.user_id) ?? null })));
    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    if (!open) return;
    load();
    const ch = supabase
      .channel(`video-comments-${videoId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "video_comments", filter: `video_id=eq.${videoId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [open, videoId, load]);

  const submit = async (
    payload:
      | { kind: "text"; content: string }
      | { kind: "audio"; audio_url: string; audio_path: string; audio_duration_sec: number }
  ) => {
    if (!user) return;
    const row: any = {
      video_id: videoId,
      user_id: user.id,
      parent_id: replyTo?.id ?? null,
    };
    if (payload.kind === "text") row.content = payload.content;
    else {
      row.audio_url = payload.audio_url;
      row.audio_duration_sec = payload.audio_duration_sec;
    }
    const { error } = await supabase.from("video_comments").insert(row);
    if (error) toast.error("Falha ao comentar");
    else {
      setReplyTo(null);
      load();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-card rounded-t-[28px] border-t border-border max-h-[75dvh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-bold">Comentários</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading && <p className="text-sm text-muted-foreground">A carregar…</p>}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Sem comentários ainda</p>
          )}
          {items.map((c) => (
            <CommentItem
              key={c.id}
              kind="video"
              comment={c}
              postOwnerId={postOwnerId}
              onReply={setReplyTo}
              onDeleted={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
        <div className="p-3 border-t border-border safe-bottom">
          {replyTo && (
            <p className="text-xs text-muted-foreground mb-1">
              A responder a {replyTo.profile?.display_name ?? "…"}{" "}
              <button onClick={() => setReplyTo(null)} className="text-primary">Cancelar</button>
            </p>
          )}
          <CommentComposer onSubmit={submit} />
        </div>
      </div>
    </div>
  );
}
