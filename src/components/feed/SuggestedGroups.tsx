import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UsersThree } from "@phosphor-icons/react";

type Group = {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
};

export function SuggestedGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    (async () => {
      let joined: string[] = [];
      if (user) {
        const { data } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", user.id);
        joined = (data ?? []).map((r: any) => r.group_id);
      }
      let q = supabase
        .from("groups")
        .select("id,name,description,photo_url")
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(10);
      if (joined.length) q = q.not("id", "in", `(${joined.join(",")})`);
      const { data } = await q;
      setGroups((data ?? []) as Group[]);
    })();
  }, [user]);

  if (groups.length === 0) return null;

  return (
    <section className="glass rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center justify-between px-3 py-2">
        <h3 className="font-display font-bold text-sm">Grupos sugeridos</h3>
        <button onClick={() => navigate("/groups")} className="text-xs text-accent font-semibold">
          Ver todos
        </button>
      </header>
      <div className="flex gap-2 px-3 pb-3 overflow-x-auto no-scrollbar snap-x">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate(`/groups/${g.id}`)}
            className="shrink-0 w-40 rounded-xl bg-secondary/40 border border-border p-3 snap-start text-left"
          >
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-secondary grid place-items-center mb-2">
              {g.photo_url ? (
                <img src={g.photo_url} alt={g.name} loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <UsersThree size={32} weight="duotone" className="text-muted-foreground" />
              )}
            </div>
            <p className="text-xs font-semibold truncate">{g.name}</p>
            {g.description && (
              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{g.description}</p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
