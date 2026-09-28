import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PeopleCarousel } from "./PeopleCarousel";
import type { SuggestedProfile } from "./FriendSuggestionCard";

export function SuggestedPeople({ limit = 12 }: { limit?: number }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SuggestedProfile[]>([]);

  useEffect(() => {
    (async () => {
      let q = supabase
        .from("profiles")
        .select("id,username,display_name,avatar_url,bio,followers_count")
        .order("followers_count", { ascending: false })
        .limit(limit);
      if (user) q = q.neq("id", user.id);
      const { data } = await q;
      setProfiles((data ?? []) as SuggestedProfile[]);
    })();
  }, [user, limit]);

  return <PeopleCarousel profiles={profiles} />;
}
