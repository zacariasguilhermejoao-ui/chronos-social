import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Users } from "@/lib/icons";

export default function Groups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("group_members")
      .select("group_id, groups(id, name, photo_url, description)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setGroups((data ?? []).map((r: any) => r.groups).filter(Boolean));
      });
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-extrabold text-xl">Grupos</h1>
        <button
          onClick={() => navigate("/groups/new")}
          className="rounded-full gradient-money text-primary-foreground px-4 py-2 text-sm font-bold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>
      {groups.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">Ainda não estás em nenhum grupo</p>
      )}
      {groups.map((g) => (
        <button
          key={g.id}
          onClick={() => navigate(`/groups/${g.id}`)}
          className="w-full flex items-center gap-3 glass rounded-xl border border-border p-3 text-left press"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary overflow-hidden grid place-items-center shrink-0">
            {g.photo_url ? <img src={g.photo_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{g.name}</p>
            {g.description && <p className="text-xs text-muted-foreground truncate">{g.description}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}
