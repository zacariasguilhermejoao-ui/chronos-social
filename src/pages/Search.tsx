import { UserAvatar } from "@/components/UserAvatar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, UserPlus, Check } from "@/lib/icons";
import { Button } from "@/components/ui/button";

type Result = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  followers_count: number;
};

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim() || !user) {
        setResults([]);
        return;
      }
      const term = q.trim();
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, followers_count")
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .neq("id", user.id)
        .limit(30);
      setResults((data as Result[]) ?? []);
      if (data && data.length) {
        const { data: fol } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id)
          .in("following_id", data.map((d) => d.id));
        setFollowingSet(new Set((fol ?? []).map((f) => f.following_id)));
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, user]);

  const toggleFollow = async (id: string) => {
    if (!user) return;
    if (followingSet.has(id)) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", id);
      setFollowingSet((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: id });
      setFollowingSet((s) => new Set(s).add(id));
    }
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto space-y-3 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Pesquisar</h1>

      <div className="relative">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Procurar por nome ou @username"
          className="pl-9 h-11"
        />
      </div>

      <div className="space-y-2 pt-2">
        {results.map((r) => {
          const following = followingSet.has(r.id);
          return (
            <div key={r.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <button onClick={() => navigate(`/u/${r.username}`)} className="shrink-0">
                <UserAvatar
                  userId={r.id}
                  fallbackUrl={r.avatar_url}
                  fallbackName={r.display_name}
                  size={44}
                />
              </button>
              <button onClick={() => navigate(`/u/${r.username}`)} className="flex-1 text-left min-w-0">
                <p className="font-semibold text-sm truncate">{r.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  @{r.username} · {r.followers_count} seguidores
                </p>
              </button>
              <Button size="sm" variant={following ? "outline" : "default"} onClick={() => toggleFollow(r.id)}>
                {following ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </Button>
            </div>
          );
        })}
        {q && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Sem resultados.</p>
        )}
      </div>
    </div>
  );
}
