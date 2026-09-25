import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type BlockedProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export function useBlock(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState(false);
  const [blockedBy, setBlockedBy] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) {
      setBlocked(false);
      setBlockedBy(false);
      return;
    }
    const { data } = await supabase
      .from("user_blocks")
      .select("blocker_id,blocked_id")
      .or(
        `and(blocker_id.eq.${user.id},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${user.id})`
      );
    setBlocked(!!data?.some((r) => r.blocker_id === user.id));
    setBlockedBy(!!data?.some((r) => r.blocker_id === targetUserId));
  }, [user, targetUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const block = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return false;
    setLoading(true);
    const { error } = await supabase
      .from("user_blocks")
      .insert({ blocker_id: user.id, blocked_id: targetUserId });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) return false;
    setBlocked(true);
    return true;
  }, [user, targetUserId]);

  const unblock = useCallback(async () => {
    if (!user || !targetUserId) return false;
    setLoading(true);
    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", targetUserId);
    setLoading(false);
    if (error) return false;
    setBlocked(false);
    return true;
  }, [user, targetUserId]);

  return { blocked, blockedBy, block, unblock, loading, refresh };
}

export function useBlockedList() {
  const { user } = useAuth();
  const [rows, setRows] = useState<BlockedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id)
      .order("created_at", { ascending: false });
    const ids = (data ?? []).map((r) => r.blocked_id);
    if (!ids.length) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data: profs } = await supabase
      .from("profiles")
      .select("id,username,display_name,avatar_url")
      .in("id", ids);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    setRows(ids.map((id) => map.get(id)).filter(Boolean) as BlockedProfile[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const unblock = useCallback(
    async (id: string) => {
      if (!user) return;
      setRows((prev) => prev.filter((r) => r.id !== id));
      await supabase.from("user_blocks").delete().eq("blocker_id", user.id).eq("blocked_id", id);
    },
    [user]
  );

  return { rows, loading, unblock, refresh };
}
