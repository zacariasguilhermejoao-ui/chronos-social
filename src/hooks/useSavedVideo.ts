import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { batchHas, batchSet } from "@/lib/batchQuery";

export function useSavedVideo(videoId: string | undefined) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !videoId) return;
    batchHas("saved_videos", "video_id", videoId, user.id).then(setSaved);
  }, [user, videoId]);

  const toggle = useCallback(async () => {
    if (!user || !videoId) return;
    setLoading(true);
    const next = !saved;
    setSaved(next);
    batchSet("saved_videos", "video_id", videoId, user.id, next);
    try {
      if (next) {
        await supabase.from("saved_videos").insert({ user_id: user.id, video_id: videoId });
      } else {
        await supabase.from("saved_videos").delete().eq("user_id", user.id).eq("video_id", videoId);
      }
    } catch {
      setSaved(!next);
      batchSet("saved_videos", "video_id", videoId, user.id, !next);
    } finally {
      setLoading(false);
    }
  }, [user, videoId, saved]);

  return { saved, toggle, loading };
}
