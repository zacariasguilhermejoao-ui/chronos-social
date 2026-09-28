import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "@/lib/icons";

export default function GroupInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from("groups").select("*").eq("id", id).maybeSingle().then(({ data }) => setGroup(data));
    supabase.from("group_members").select("user_id, role").eq("group_id", id).then(({ data }) => setMembers(data ?? []));
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary grid place-items-center mb-4">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <h1 className="font-display font-bold text-xl">{group?.name ?? "Grupo"}</h1>
      {group?.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
      <p className="text-sm mt-4 font-semibold">{members.length} membros</p>
      <button onClick={() => navigate(`/groups/${id}/catalog`)} className="mt-3 text-sm text-primary font-semibold">Ver catálogo</button>
    </div>
  );
}
