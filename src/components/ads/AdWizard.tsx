import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X } from "@/lib/icons";

export function AdWizard({
  open,
  onOpenChange,
  targetType,
  targetId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetType: "photo" | "video" | "page";
  targetId: string;
}) {
  const { user } = useAuth();
  const [headline, setHeadline] = useState("");
  const [budget, setBudget] = useState("100");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("ads").insert({
        promoter_id: user.id,
        target_type: targetType,
        target_id: targetId,
        headline: headline.trim() || null,
        budget_coins: parseInt(budget, 10) || 0,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Pedido de anúncio enviado");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Falha");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-card rounded-t-[28px] border-t border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Promover</h2>
          <button onClick={() => onOpenChange(false)} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Título do anúncio" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" />
          <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="Orçamento (pts)" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" />
          <button onClick={submit} disabled={busy} className="w-full rounded-2xl gradient-money text-primary-foreground font-bold py-3 disabled:opacity-50">
            Enviar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
