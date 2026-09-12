import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  balance_coins: number;
  total_earned_coins: number;
  total_spent_coins: number;
  followers_count: number;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(data as Profile | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Realtime: atualizar saldo quando muda
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`profile-rt-${user.id}-${Date.now()}`);
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
      (payload) => {
        setProfile((prev) => (prev ? { ...prev, ...(payload.new as Profile) } : (payload.new as Profile)));
      }
    );
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { profile, loading, refresh: fetchProfile };
}
