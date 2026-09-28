import { X } from "@/lib/icons";

export function StoryCreate({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex flex-col">
      <header className="flex items-center justify-between p-4 safe-top">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-secondary grid place-items-center" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-bold">Nova história</h2>
        <span className="w-10" />
      </header>
      <div className="flex-1 grid place-items-center px-6 text-center">
        <p className="text-muted-foreground text-sm">
          Selecciona uma foto ou vídeo para partilhar na tua história (24h).
        </p>
      </div>
    </div>
  );
}
