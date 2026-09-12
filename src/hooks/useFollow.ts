import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle();
    setIsFollowing(!!data);
  }, [user, targetUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
        setIsFollowing(false);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
        setIsFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, toggle, loading, refresh };
}
