import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, BrandMark, Field, PrimaryButton, inputClass } from "./Auth";
import { authErrorMessage } from "@/lib/authErrors";
import { AlertCircle } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            display_name: displayName.trim() || username.trim(),
          },
        },
      });
      if (err) throw err;
      if (data.user) navigate("/", { replace: true });
    } catch (err: any) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <div className="flex flex-col items-center pt-6 pb-4">
        <BrandMark size={64} />
        <h1 className="mt-3 text-2xl font-display font-extrabold">Criar conta</h1>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Nome de utilizador">
          <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        </Field>
        <Field label="Nome de apresentação">
          <input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>
        <Field label="Email">
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Palavra-passe">
          <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </Field>
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}
        <PrimaryButton type="submit" loading={busy}>Registar</PrimaryButton>
        <p className="text-center text-sm">
          Já tens conta? <Link to="/auth" className="text-primary font-medium">Entrar</Link>
        </p>
      </form>
    </AuthShell>
  );
}
