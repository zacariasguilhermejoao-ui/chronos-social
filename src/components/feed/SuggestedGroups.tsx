import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "@/lib/icons";

export function SuggestedGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("groups")
      .select("id,name,photo_url,description")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setGroups(data ?? []));
  }, []);

  if (!groups.length) return null;

  return (
    <div className="py-1">
      <p className="text-xs font-semibold text-muted-foreground px-1 mb-2">Grupos</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate(`/groups/${g.id}`)}
            className="shrink-0 w-[140px] glass rounded-2xl border border-border p-3 text-left press"
          >
            <div className="w-12 h-12 rounded-2xl bg-secondary overflow-hidden grid place-items-center mb-2">
              {g.photo_url ? <img src={g.photo_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-6 h-6" />}
            </div>
            <p className="text-sm font-semibold truncate">{g.name}</p>
            {g.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{g.description}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
