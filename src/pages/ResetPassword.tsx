import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, KeyRound } from "@/lib/icons";
import chronosLogoAsset from "@/assets/chronos-c.png.asset.json";
const chronosLogo = chronosLogoAsset.url;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else {
        const hash = window.location.hash;
        if (!hash.includes("access_token") && !hash.includes("type=recovery")) {
          setError("Link inválido ou expirado. Pede um novo link de recuperação.");
        }
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Mínimo 6 caracteres");
    if (pw !== pw2) return toast.error("As passwords não coincidem");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password atualizada com sucesso");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center max-w-md mx-auto w-full">
        <button
          onClick={() => navigate("/auth")}
          className="self-start mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <img src={chronosLogo} alt="Chrónos" className="w-16 h-16 object-contain mb-3" />
        <h1 className="font-display font-bold text-2xl mb-1">Nova password</h1>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          Define uma nova password para a tua conta.
        </p>

        {error ? (
          <div className="w-full glass rounded-2xl p-6 text-center space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={() => navigate("/forgot-password")} className="w-full">
              Pedir novo link
            </Button>
          </div>
        ) : !ready ? (
          <div className="w-full glass rounded-2xl p-6 grid place-items-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <form onSubmit={submit} className="w-full space-y-3 glass rounded-2xl p-5 text-left">
            <div className="flex items-center gap-2 text-primary text-sm mb-1">
              <KeyRound className="w-4 h-4" />
              <span>Define a tua nova password</span>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pw">Nova password</Label>
              <Input
                id="pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••"
                autoComplete="new-password"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pw2">Confirmar password</Label>
              <Input
                id="pw2"
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="••••••"
                autoComplete="new-password"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full h-12 gradient-money text-primary-foreground font-display font-bold"
            >
              {busy ? "A guardar..." : "Guardar nova password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
