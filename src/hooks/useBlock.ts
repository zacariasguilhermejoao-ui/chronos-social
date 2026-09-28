import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useBlock(targetUserId?: string) {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || !targetUserId) { setBlocked(false); return; }
    const { data } = await supabase
      .from("blocks")
      .select("id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", targetUserId)
      .maybeSingle();
    setBlocked(!!data);
  }, [user, targetUserId]);

  useEffect(() => { refresh(); }, [refresh]);

  const block = async () => {
    if (!user || !targetUserId) return;
    await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: targetUserId });
    setBlocked(true);
  };

  const unblock = async () => {
    if (!user || !targetUserId) return;
    await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", targetUserId);
    setBlocked(false);
  };

  return { blocked, block, unblock, refresh };
}
