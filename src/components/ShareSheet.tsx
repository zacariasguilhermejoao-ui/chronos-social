import { X, Copy, Link2 } from "@/lib/icons";
import { toast } from "sonner";

export function ShareSheet({
  open,
  onOpenChange,
  url,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url: string;
  title?: string;
}) {
  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? "Chrónos", url });
      } catch {}
    } else {
      copy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-end" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-xl mx-auto bg-card rounded-t-[28px] p-5 pb-10 border-t border-border" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-secondary mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Partilhar</h2>
          <button onClick={() => onOpenChange(false)} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={copy} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/50 press">
            <Copy className="w-6 h-6" />
            <span className="text-xs font-medium">Copiar link</span>
          </button>
          <button onClick={nativeShare} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/50 press">
            <Link2 className="w-6 h-6" />
            <span className="text-xs font-medium">Partilhar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareSheet;
