import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Mínimo 6 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("As palavras-passe não coincidem");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Palavra-passe atualizada");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Falha ao atualizar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4">
        <h1 className="font-display font-bold text-2xl text-center">Nova palavra-passe</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nova palavra-passe"
          className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3.5 text-sm outline-none"
          required
          minLength={6}
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirmar"
          className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3.5 text-sm outline-none"
          required
        />
        <button type="submit" disabled={busy} className="w-full rounded-2xl gradient-money text-primary-foreground font-bold py-3.5 disabled:opacity-50">
          {busy ? "A guardar…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
