import { UserAvatar } from "@/components/UserAvatar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TrendingUp, UserPlus, Check } from "@/lib/icons";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  followers_count: number;
  created_at: string;
};

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [popular, setPopular] = useState<Profile[]>([]);
  const [recent, setRecent] = useState<Profile[]>([]);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [pop, rec, fol] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, followers_count, created_at")
          .neq("id", user.id)
          .order("followers_count", { ascending: false })
          .limit(20),
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, followers_count, created_at")
          .neq("id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("follows").select("following_id").eq("follower_id", user.id),
      ]);
      setPopular((pop.data as Profile[]) ?? []);
      setRecent((rec.data as Profile[]) ?? []);
      setFollowingSet(new Set((fol.data ?? []).map((f) => f.following_id)));
    })();
  }, [user]);

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

  const Row = ({ p }: { p: Profile }) => {
    const following = followingSet.has(p.id);
    return (
      <div className="glass rounded-xl p-3 flex items-center gap-3">
        <button onClick={() => navigate(`/u/${p.username}`)} className="shrink-0">
          <UserAvatar
            userId={p.id}
            fallbackUrl={p.avatar_url}
            fallbackName={p.display_name}
            size={44}
          />
        </button>
        <button onClick={() => navigate(`/u/${p.username}`)} className="flex-1 text-left min-w-0">
          <p className="font-semibold text-sm truncate">{p.display_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            @{p.username} · {p.followers_count} seguidores
          </p>
        </button>
        <Button size="sm" variant={following ? "outline" : "default"} onClick={() => toggleFollow(p.id)}>
          {following ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        </Button>
      </div>
    );
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Descobrir</h1>
        <Button size="sm" variant="outline" onClick={() => navigate("/posts")}>
          Ver publicações
        </Button>
      </div>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-money" /> Populares
        </h2>
        {popular.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sem dados.</p>
        ) : (
          popular.map((p) => <Row key={p.id} p={p} />)
        )}
      </section>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <UserPlus className="w-4 h-4 text-primary" /> Novos por aqui
        </h2>
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sem dados.</p>
        ) : (
          recent.map((p) => <Row key={p.id} p={p} />)
        )}
      </section>
    </div>
  );
}
