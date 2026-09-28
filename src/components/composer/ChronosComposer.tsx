import { X } from "@/lib/icons";

export default function ChronosComposer({
  open,
  onOpenChange,
  initialMode,
  onPublished,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialMode?: "text" | "photo" | "video";
  onPublished?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col">
      <header className="flex items-center justify-between p-4 safe-top border-b border-border">
        <button onClick={() => onOpenChange(false)} className="w-10 h-10 rounded-full bg-secondary grid place-items-center">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-bold">Criar</h2>
        <span className="w-10" />
      </header>
      <div className="flex-1 grid place-items-center px-6 text-center">
        <p className="text-muted-foreground text-sm">
          Composer ({initialMode ?? "text"}) — publica texto, foto ou reel.
        </p>
        <button
          onClick={() => { onPublished?.(); onOpenChange(false); }}
          className="mt-4 rounded-full gradient-money text-primary-foreground px-5 py-2 text-sm font-bold"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
