import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useSavedVideo(videoId: string) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("saved_videos")
        .select("id")
        .eq("video_id", videoId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setSaved(!!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, videoId]);

  const toggle = async () => {
    if (!user) {
      toast.info("Inicia sessão para guardar vídeos");
      return;
    }
    if (busy) return;
    setBusy(true);
    const prev = saved;
    setSaved(!prev);
    try {
      if (prev) {
        const { error } = await supabase
          .from("saved_videos")
          .delete()
          .eq("video_id", videoId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_videos")
          .insert({ video_id: videoId, user_id: user.id });
        if (error) throw error;
        toast.success("Guardado nos favoritos");
      }
    } catch (e: any) {
      setSaved(prev);
      toast.error(e?.message ?? "Falhou");
    } finally {
      setBusy(false);
    }
  };

  return { saved, toggle, busy };
}
