import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "@/lib/icons";
import chronosLogoAsset from "@/assets/chronos-c.png.asset.json";
const chronosLogo = chronosLogoAsset.url;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      toast.error("Introduz um email válido (ex.: nome@dominio.com)");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Verifica o teu email");
    } catch (err: any) {
      const status = err?.status ?? err?.code;
      const raw = String(err?.message ?? "");
      let msg = "Não foi possível enviar o email. Tenta novamente.";
      if (status === 429 || /rate limit|too many/i.test(raw)) {
        msg = "Demasiados pedidos. Aguarda alguns minutos e tenta novamente.";
      } else if (/invalid|email/i.test(raw) && /format|address/i.test(raw)) {
        msg = "Email inválido. Verifica o endereço.";
      } else if (/fetch|network|failed to fetch/i.test(raw)) {
        msg = "Sem ligação ao servidor. Verifica a internet e tenta novamente.";
      } else if (raw) {
        msg = raw;
      }
      toast.error(msg);
    } finally {
      setBusy(false);
    }
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
        <h1 className="font-display font-bold text-2xl mb-1">Recuperar password</h1>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          Enviamos-te um link para criar uma nova password.
        </p>

        {sent ? (
          <div className="w-full glass rounded-2xl p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 grid place-items-center mx-auto">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm">
              Email enviado para <span className="font-semibold">{email}</span>.
            </p>
            <p className="text-xs text-muted-foreground">
              Verifica a tua caixa de entrada (e a pasta de spam). Clica no link para definir uma nova password.
            </p>
            <Link to="/auth" className="block text-sm text-primary hover:underline pt-2">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="w-full space-y-3 glass rounded-2xl p-5 text-left">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@exemplo.com"
                autoComplete="email"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full h-12 gradient-money text-primary-foreground font-display font-bold"
            >
              {busy ? "A enviar..." : "Enviar link de recuperação"}
            </Button>
            <Link
              to="/auth"
              className="block text-center text-sm text-muted-foreground hover:text-foreground pt-1"
            >
              Lembrei-me da password
            </Link>
          </form>
        )}

        <p className="mt-4 text-xs text-muted-foreground max-w-xs">
          Só funciona com contas registadas por email. Se usaste telefone, contacta o suporte.
        </p>
      </div>
    </div>
  );
}
