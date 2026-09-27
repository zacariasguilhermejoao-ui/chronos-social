import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  coins_balance?: number;
  [key: string]: any;
};

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const id = userId ?? user?.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (!alive) return;
      setProfile((data as any) ?? null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return { profile, loading, setProfile };
}
