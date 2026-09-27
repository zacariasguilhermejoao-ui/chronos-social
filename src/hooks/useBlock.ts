import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type BlockedProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export function useBlock() {
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
