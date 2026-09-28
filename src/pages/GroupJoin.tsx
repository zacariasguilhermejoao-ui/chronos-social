import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Users } from "@/lib/icons";
import { toast } from "sonner";

export default function GroupJoin() {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase
      .from("groups")
      .select("*")
      .eq("invite_token", token)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err || !data) setError("Convite inválido ou expirado");
        else setGroup(data);
      });
  }, [token]);

  const join = async () => {
    if (!user || !group) return;
    setBusy(true);
    try {
      await supabase.from("group_members").upsert({ group_id: group.id, user_id: user.id, role: "member" });
      toast.success("Entraste no grupo");
      navigate(`/groups/${group.id}`);
    } catch (e: any) {
      toast.error(e?.message || "Falha");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && group && !busy) join();
  }, [authLoading, user, group]);

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <button onClick={() => navigate("/")} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <div className="glass rounded-3xl p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-3 rounded-3xl bg-secondary grid place-items-center overflow-hidden">
          {group?.photo_url ? <img src={group.photo_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-10 h-10" />}
        </div>
        {error ? (
          <>
            <h1 className="font-display font-bold text-xl mb-2">Convite indisponível</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : group ? (
          <>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Foste convidado para</p>
            <h1 className="font-display font-bold text-2xl mt-1">{group.name}</h1>
            {!user && !authLoading && (
              <button onClick={() => { try { localStorage.setItem("chronos_pending_group", token!); } catch {} navigate("/auth"); }} className="mt-4 rounded-full gradient-money text-primary-foreground px-5 py-2 text-sm font-bold">
                Entrar para aceitar
              </button>
            )}
            {user && (
              <button onClick={join} disabled={busy} className="mt-4 rounded-full gradient-money text-primary-foreground px-5 py-2 text-sm font-bold disabled:opacity-50">
                Entrar no grupo
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">A carregar…</p>
        )}
      </div>
    </div>
  );
}
