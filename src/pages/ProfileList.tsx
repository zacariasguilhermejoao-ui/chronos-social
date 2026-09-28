import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserAvatar } from "@/components/UserAvatar";
import { ArrowLeft } from "@/lib/icons";

export default function ProfileList() {
  const { username, kind } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("id").eq("username", username === "me" ? "" : username!).maybeSingle();
      // For /me/:kind use auth elsewhere; simplified list
      if (kind === "followers" || kind === "following") {
        const col = kind === "followers" ? "following_id" : "follower_id";
        const other = kind === "followers" ? "follower_id" : "following_id";
        if (!prof?.id) return;
        const { data } = await supabase.from("follows").select(`${other}`).eq(col, prof.id).limit(100);
        const ids = (data ?? []).map((r: any) => r[other]);
        if (ids.length) {
          const { data: profiles } = await supabase.from("profiles").select("id,username,display_name,avatar_url").in("id", ids);
          setList(profiles ?? []);
        }
      }
    })();
  }, [username, kind]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary grid place-items-center mb-3">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <h1 className="font-display font-bold text-xl capitalize mb-3">{kind}</h1>
      <div className="space-y-2">
        {list.map((p) => (
          <button key={p.id} onClick={() => navigate(`/u/${p.username}`)} className="w-full flex items-center gap-3 p-2 text-left press">
            <UserAvatar userId={p.id} fallbackUrl={p.avatar_url} fallbackName={p.display_name} size={40} />
            <div>
              <p className="font-semibold text-sm">{p.display_name}</p>
              <p className="text-xs text-muted-foreground">@{p.username}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
