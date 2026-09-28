import { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import chronosLogo from "@/assets/chronos-c.png.asset.json";
import { authErrorMessage } from "@/lib/authErrors";
import {
  type SavedAccount,
  readSavedAccounts,
  saveAccount,
  touchAccount,
} from "@/lib/savedAccounts";

const BRAND = "hsl(var(--primary))";

function isEmailLike(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
function isPhoneLike(v: string) {
  return /^\+?[0-9][0-9\s-]{5,17}$/.test(v.trim());
}

export function BrandMark({ size = 72 }: { size?: number }) {
  return (
    <img
      src={chronosLogo.url}
      alt="Chrónos"
      width={size}
      height={size}
      className="object-contain select-none"
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full text-foreground antialiased" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[420px] flex-col px-6 pb-10 pt-[max(env(safe-area-inset-top),1.25rem)]">
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground/70">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-[12px] text-red-400">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-4 py-3.5 text-[15px] text-foreground placeholder:text-foreground/25 outline-none transition-all duration-200 focus:border-primary/60 focus:bg-foreground/[0.06] focus:ring-4 focus:ring-primary/10";

export function PrimaryButton({
  children,
  loading,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={
        "relative flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-primary-foreground transition-all duration-200 active:scale-[0.985] disabled:opacity-40 " +
        (rest.className ?? "")
      }
      style={{ backgroundColor: BRAND, boxShadow: "var(--shadow-money)" }}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from ?? "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ id: false, pw: false });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    try {
      const lastId = localStorage.getItem("chronos_last_id");
      if (lastId) setIdentifier(lastId);
      setAccounts(readSavedAccounts());
    } catch {}
  }, []);

  const idError = useMemo(() => {
    if (!touched.id || !identifier) return null;
    if (isEmailLike(identifier) || isPhoneLike(identifier)) return null;
    return "Introduz um email ou número válido";
  }, [identifier, touched.id]);

  const pwError = useMemo(() => {
    if (!touched.pw || !password) return null;
    return password.length < 6 ? "Palavra-passe demasiado curta" : null;
  }, [password, touched.pw]);

  const canSubmit = !!identifier && !!password && !idError && !pwError;

  if (loading) return null;
  if (user) {
    let pending: string | null = null;
    try { pending = localStorage.getItem("chronos_pending_group"); } catch {}
    return <Navigate to={pending ? `/g/join/${pending}` : from} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ id: true, pw: true });
    if (!canSubmit) return;
    setBusy(true);
    setFormError(null);
    try {
      const id = identifier.trim();
      const email = isEmailLike(id) ? id : undefined;
      const { data, error } = await supabase.auth.signInWithPassword(
        email ? { email, password } : { email: id, password }
      );
      if (error) throw error;
      try {
        localStorage.setItem("chronos_last_id", id);
        if (data.user) {
          saveAccount({
            identifier: id,
            userId: data.user.id,
            refreshToken: data.session?.refresh_token,
          });
          touchAccount(id, data.session?.refresh_token);
        }
      } catch {}
      navigate(from, { replace: true });
    } catch (err: any) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <div className="flex flex-col items-center pt-8 pb-6">
        <BrandMark size={80} />
        <h1 className="mt-4 text-2xl font-display font-extrabold tracking-tight">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bem-vindo de volta à Chrónos</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 flex-1">
        <Field label="Email ou telefone" error={idError}>
          <input
            className={inputClass}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, id: true }))}
            autoComplete="username"
            placeholder="nome@email.com"
          />
        </Field>
        <Field label="Palavra-passe" error={pwError}>
          <div className="relative">
            <input
              className={inputClass + " pr-12"}
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pw: true }))}
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        {formError && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {formError}
          </p>
        )}

        <PrimaryButton type="submit" loading={busy} disabled={!canSubmit}>
          Entrar
        </PrimaryButton>

        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="text-primary font-medium">Esqueceste-te?</Link>
          <Link to="/signup" className="text-primary font-medium">Criar conta</Link>
        </div>

        {accounts.length > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground">Contas guardadas</p>
            {accounts.map((a) => (
              <button
                key={a.identifier}
                type="button"
                onClick={() => setIdentifier(a.identifier)}
                className="w-full text-left rounded-xl bg-secondary/50 px-3 py-2 text-sm"
              >
                {a.displayName ?? a.identifier}
              </button>
            ))}
          </div>
        )}
      </form>
    </AuthShell>
  );
}
