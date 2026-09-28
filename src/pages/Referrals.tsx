import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Copy } from "@/lib/icons";

export default function Referrals() {
  const { user } = useAuth();
  const code = user?.id?.slice(0, 8) ?? "";
  const link = typeof window !== "undefined" ? `${window.location.origin}/invite/${code}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado");
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="font-display font-bold text-xl">Convidar amigos</h1>
      <p className="text-sm text-muted-foreground">Partilha o teu link de convite.</p>
      <div className="glass rounded-xl border border-border p-4 flex items-center gap-2">
        <code className="flex-1 text-xs truncate">{link}</code>
        <button onClick={copy} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
