import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X } from "@/lib/icons";

const REASONS = [
  "Spam",
  "Assédio",
  "Conteúdo ilegal",
  "Nudez",
  "Violência",
  "Desinformação",
  "Outro",
];

export default function ReportSheet({
  open,
  onOpenChange,
  targetType,
  targetId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetType: string;
  targetId: string;
}) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!user || !reason) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        target_type: targetType,
        target_id: targetId,
        reason,
      });
      if (error) throw error;
      toast.success("Denúncia enviada");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Falha");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col justify-end" onClick={() => onOpenChange(false)}>
      <div className="bg-card rounded-t-[28px] border-t border-border p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Denunciar</h2>
          <button onClick={() => onOpenChange(false)} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left rounded-xl px-4 py-3 text-sm border ${reason === r ? "border-primary bg-primary/10" : "border-border"}`}
            >
              {r}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={!reason || busy}
          className="mt-4 w-full rounded-2xl gradient-money text-primary-foreground font-bold py-3 disabled:opacity-40"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
