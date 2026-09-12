import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "@/lib/icons";

const STORAGE_KEY = "chronos:signup-prompt-dismissed";
const DELAY_MS = 12000;

export function SignupPromptPopup() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || user) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [loading, user]);

  if (!open || user) return null;

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 px-3 animate-fade-in pointer-events-none">
      <div className="max-w-md mx-auto glass rounded-2xl p-4 shadow-soft border border-primary/30 pointer-events-auto relative">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 w-7 h-7 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 grid place-items-center shrink-0">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm leading-tight">
              Junta-te à Chrónos
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publica, comenta, envia mensagens e liga-te aos teus amigos.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={dismiss} variant="ghost" className="flex-1 h-9 text-xs">
            Agora não
          </Button>
          <Button
            onClick={() => {
              sessionStorage.setItem(STORAGE_KEY, "1");
              setOpen(false);
              navigate("/auth", { state: { mode: "signup" } });
            }}
            className="flex-1 h-9 text-xs bg-primary text-primary-foreground font-bold"
          >
            Criar conta
          </Button>
        </div>
      </div>
    </div>
  );
}
