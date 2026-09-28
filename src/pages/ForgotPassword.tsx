import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "@/lib/icons";
import chronosLogoAsset from "@/assets/chronos-c.png.asset.json";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      toast.error("Introduz um email válido");
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
      toast.error(err?.message || "Não foi possível enviar o email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto w-full">
        <button onClick={() => navigate("/auth")} className="self-start mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <img src={chronosLogoAsset.url} alt="Chrónos" className="w-16 h-16 mb-4" />
        <h1 className="font-display font-bold text-2xl mb-2">Recuperar palavra-passe</h1>
        {sent ? (
          <div className="text-center space-y-3">
            <Mail className="w-10 h-10 mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Enviámos um link para {email}</p>
            <button onClick={() => navigate("/auth")} className="text-primary font-semibold text-sm">Voltar ao login</button>
          </div>
        ) : (
          <form onSubmit={submit} className="w-full space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@email.com"
              className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl gradient-money text-primary-foreground font-bold py-3.5 disabled:opacity-50"
            >
              {busy ? "A enviar…" : "Enviar link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
