import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import chronosLogoAsset from "@/assets/chronos-c.png.asset.json";
const chronosLogo = chronosLogoAsset.url;
import { Gift } from "@/lib/icons";

type Referrer = { id: string; username: string; display_name: string; avatar_url: string | null };

export default function Invite() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) return;
    try { localStorage.setItem("chronos_ref", code.toLowerCase()); } catch {}
    (async () => {
      const { data } = await supabase.rpc("lookup_referrer", { p_code: code });
      const row = (data as Referrer[] | null)?.[0];
      if (row) setReferrer(row);
      else setNotFound(true);
    })();
  }, [code]);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center max-w-md mx-auto bg-gradient-hero">
      <img src={chronosLogo} alt="Chrónos" className="w-20 h-20 object-contain mb-3" />
      <h1 className="font-display font-bold text-3xl mb-1">
        Chrónos<span className="text-money">.</span>
      </h1>
      <p className="text-muted-foreground text-sm mb-6">A tua atenção vale dinheiro.</p>

      {notFound ? (
        <div className="glass rounded-2xl p-6 w-full">
          <p className="font-display font-bold">Convite inválido</p>
          <p className="text-sm text-muted-foreground mt-1">
            Este link de convite não foi encontrado. Podes registar-te à mesma e começar a ganhar.
          </p>
        </div>
      ) : referrer ? (
        <div className="glass rounded-2xl p-6 w-full space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-money text-primary-foreground mx-auto">
            <Gift className="w-7 h-7" />
          </div>
          <p className="text-sm text-muted-foreground">Foste convidado por</p>
          <p className="font-display font-bold text-xl">@{referrer.username}</p>
          <p className="text-xs text-muted-foreground">
            Cria a tua conta e recebe <span className="text-money font-semibold">500 Kz</span> de boas-vindas.
            <br />O @{referrer.username} também ganha por te trazer!
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 w-full">
          <p className="text-sm text-muted-foreground">A carregar convite…</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 w-full mt-5">
        <Button variant="outline" onClick={() => navigate("/")}>Ver feed</Button>
        <Button
          onClick={() => navigate("/auth", { state: { mode: "signup" } })}
          className="gradient-money text-primary-foreground font-display font-bold"
        >
          Criar conta
        </Button>
      </div>
    </div>
  );
}
