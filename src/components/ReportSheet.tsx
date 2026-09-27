import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Flag, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export type ReportTargetType =
  | "video"
  | "photo"
  | "video_comment"
  | "photo_comment"
  | "message"
  | "profile"
  | "group"
  | "marketplace_listing";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
};

const REASONS = [
  { key: "spam", label: "Spam ou golpe" },
  { key: "nudity", label: "Nudez ou conteúdo sexual" },
  { key: "sexual_exploitation", label: "Exploração sexual" },
  { key: "violence", label: "Violência extrema" },
  { key: "hate", label: "Discurso de ódio" },
  { key: "harassment", label: "Assédio ou bullying" },
  { key: "self_harm", label: "Automutilação ou suicídio" },
  { key: "misinformation", label: "Informação falsa" },
  { key: "illegal", label: "Atividade ilegal" },
  { key: "other", label: "Outro motivo" },
];

export default function ReportSheet({ open, onOpenChange, targetType, targetId }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    if (!reason) {
      toast.error("Escolhe um motivo");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("report_content", {
      p_target_type: targetType,
      p_target_id: targetId,
      p_reason: REASONS.find((r) => r.key === reason)?.label ?? reason,
      p_description: description.trim() || null,
    });
    setBusy(false);
    if (error) {
      if (error.message.includes("cannot_report_own_content")) {
        toast.error("Não podes denunciar o teu próprio conteúdo");
      } else {
        toast.error("Não foi possível enviar", { description: error.message });
      }
      return;
    }
    toast.success("Denúncia enviada", {
      description: "A nossa equipa vai rever este conteúdo.",
    });
    setReason(null);
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0 glass max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-destructive/15 grid place-items-center">
              <ShieldAlert className="w-4 h-4 text-destructive" />
            </div>
            <SheetTitle className="font-display">Denunciar conteúdo</SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            A tua denúncia é anónima. A nossa equipa vai analisar em breve.
          </p>
        </SheetHeader>

        <div className="space-y-2 mb-4">
          {REASONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setReason(r.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-left transition ${
                reason === r.key
                  ? "bg-primary/15 ring-2 ring-primary/40 text-foreground"
                  : "glass text-foreground/90 hover:bg-secondary/60"
              }`}
            >
              <Flag className="w-4 h-4 shrink-0 opacity-70" />
              <span className="flex-1">{r.label}</span>
            </button>
          ))}
        </div>

        <label className="text-xs text-muted-foreground mb-1 block">Detalhes (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Explica o que aconteceu…"
          className="w-full glass rounded-2xl p-3 text-sm bg-transparent outline-none border-0 focus:ring-2 focus:ring-primary/40 resize-none mb-4"
        />

        <div className="flex gap-2 pb-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="flex-1 px-4 py-3 rounded-full glass text-sm font-semibold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !reason}
            className="flex-1 px-4 py-3 rounded-full bg-destructive text-destructive-foreground text-sm font-bold disabled:opacity-50"
          >
            {busy ? "A enviar…" : "Enviar denúncia"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
