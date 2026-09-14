import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, ArrowLeft } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GroupJoin() {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [group, setGroup] = useState<{ id: string; name: string; photo_url: string | null; description: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    try { localStorage.setItem("chronos_pending_group", token); } catch {}
    (async () => {
      const { data, error: rpcError } = await supabase.rpc("lookup_group_invite", { p_token: token });
      if (rpcError) {
        setError("Não foi possível carregar este convite.");
        return;
      }
      const row = (data as any[] | null)?.[0];
      if (!row) {
        setError("Convite inválido, expirado ou desativado.");
        return;
      }
      setGroup({
        id: row.group_id,
        name: row.name,
        photo_url: row.photo_url,
        description: row.description,
      });
    })();
  }, [token]);

  const join = async () => {
    if (!token) return;
    if (!user) {
      navigate("/auth", { state: { from: `/g/join/${token}` } });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("join_group_by_token", { p_token: token });
    setBusy(false);
    if (error || !(data as any)?.ok) {
      toast.error((data as any)?.error ?? error?.message ?? "Falha");
      return;
    }
    try { localStorage.removeItem("chronos_pending_group"); } catch {}
    toast.success("Entraste no grupo");
    navigate(`/groups/${(data as any).group_id}`);
  };

  useEffect(() => {
    if (!authLoading && user && group && !busy) {
      join();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, group]);

  return (
    <div className="px-4 py-6 max-w-md mx-auto animate-fade-in">
      <button onClick={() => navigate("/")} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <div className="glass rounded-3xl p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-3 rounded-3xl overflow-hidden grid place-items-center bg-gradient-violet text-white">
          {group?.photo_url ? (
            <img src={group.photo_url} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <Users className="w-10 h-10" />
          )}
        </div>
        {error ? (
          <>
            <h1 className="font-display font-bold text-xl mb-2">Convite indisponível</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : group ? (
          <>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Foste convidado para</p>
            <h1 className="font-display font-bold text-2xl mt-1 mb-1">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
            )}
            {authLoading ? null : (
              <Button
                onClick={join}
                disabled={busy}
                className="w-full mt-4 gradient-money text-primary-foreground font-display font-bold"
              >
                {busy ? "A entrar..." : user ? "Entrar no grupo" : "Iniciar sessão e entrar"}
              </Button>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-8">A carregar convite...</p>
        )}
      </div>
    </div>
  );
}
