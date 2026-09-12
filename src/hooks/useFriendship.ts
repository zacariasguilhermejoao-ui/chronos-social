import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type FriendshipStatus = "none" | "pending_out" | "pending_in" | "accepted" | "rejected";

export function useFriendship(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [status, setStatus] = useState<FriendshipStatus>("none");
  const [rowId, setRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;
    const { data } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();
    if (!data) {
      setStatus("none");
      setRowId(null);
      return;
    }
    setRowId(data.id);
    if (data.status === "accepted") setStatus("accepted");
    else if (data.status === "rejected") setStatus("rejected");
    else if (data.requester_id === user.id) setStatus("pending_out");
    else setStatus("pending_in");
  }, [user, targetUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendRequest = async () => {
    if (!user || !targetUserId) return;
    setLoading(true);
    try {
      await supabase.from("friendships").insert({ requester_id: user.id, addressee_id: targetUserId, status: "pending" });
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const accept = async () => {
    if (!rowId) return;
    setLoading(true);
    try {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", rowId);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    if (!rowId) return;
    setLoading(true);
    try {
      await supabase.from("friendships").update({ status: "rejected" }).eq("id", rowId);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!rowId) return;
    setLoading(true);
    try {
      await supabase.from("friendships").delete().eq("id", rowId);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return { status, sendRequest, accept, reject, remove, loading, refresh };
}
