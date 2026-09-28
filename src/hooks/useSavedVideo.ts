import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSavedVideo(videoId: string | undefined) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || !videoId) return;
    supabase
      .from("saved_videos")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, videoId]);

  const toggle = useCallback(async () => {
    if (!user || !videoId) return;
    if (saved) {
      await supabase.from("saved_videos").delete().eq("user_id", user.id).eq("video_id", videoId);
      setSaved(false);
    } else {
      await supabase.from("saved_videos").insert({ user_id: user.id, video_id: videoId });
      setSaved(true);
    }
  }, [user, videoId, saved]);

  return { saved, toggle };
}
