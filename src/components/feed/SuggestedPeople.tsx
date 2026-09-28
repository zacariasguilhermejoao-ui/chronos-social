import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import { UserPlus, Check } from "@/lib/icons";
import { cn } from "@/lib/utils";

type Person = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  followers_count: number;
};

export function SuggestedPeople() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      let excludeIds: string[] = [];
      if (user) {
        const { data: f } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);
        excludeIds = (f ?? []).map((x: any) => x.following_id);
        excludeIds.push(user.id);
      }
      let q = supabase
        .from("profiles")
        .select("id,username,display_name,avatar_url,followers_count")
        .order("followers_count", { ascending: false })
        .limit(12);
      if (excludeIds.length) q = q.not("id", "in", `(${excludeIds.join(",")})`);
      const { data } = await q;
      setPeople((data ?? []) as Person[]);
    })();
  }, [user]);

  const toggleFollow = async (id: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (following.has(id)) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", id);
      setFollowing((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: id });
      setFollowing((s) => new Set(s).add(id));
    }
  };

  if (people.length === 0) return null;

  return (
    <section className="glass rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center justify-between px-3 py-2">
        <h3 className="font-display font-bold text-sm">Pessoas que talvez conheças</h3>
        <button onClick={() => navigate("/friends")} className="text-xs text-accent font-semibold">
          Ver todos
        </button>
      </header>
      <div className="flex gap-2 px-3 pb-3 overflow-x-auto no-scrollbar snap-x">
        {people.map((p) => {
          const isFollowing = following.has(p.id);
          return (
            <div
              key={p.id}
              className="shrink-0 w-36 rounded-xl bg-secondary/40 border border-border p-3 snap-start"
            >
              <button
                onClick={() => navigate(`/u/${p.username}`)}
                className="w-full flex flex-col items-center text-center"
              >
                <UserAvatar
                  userId={p.id}
                  fallbackUrl={p.avatar_url}
                  fallbackName={p.display_name}
                  size={56}
                />
                <p className="mt-2 text-xs font-semibold truncate w-full">{p.display_name}</p>
                <p className="text-[10px] text-muted-foreground truncate w-full">@{p.username}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {p.followers_count ?? 0} seguidores
                </p>
              </button>
              <button
                onClick={() => toggleFollow(p.id)}
                className={cn(
                  "mt-2 w-full rounded-full text-[11px] font-bold py-1.5 flex items-center justify-center gap-1 transition-colors",
                  isFollowing
                    ? "bg-secondary text-foreground"
                    : "gradient-money text-primary-foreground"
                )}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3 h-3" /> A seguir
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" /> Seguir
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
