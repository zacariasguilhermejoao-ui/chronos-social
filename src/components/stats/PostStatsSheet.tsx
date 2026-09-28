import { X, Eye, Heart, MessageCircle } from "@/lib/icons";

export function PostStatsSheet({
  open,
  onOpenChange,
  likes,
  comments,
  views,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  likes: number;
  comments: number;
  views: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col justify-end" onClick={() => onOpenChange(false)}>
      <div className="bg-card rounded-t-[28px] border-t border-border p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Estatísticas</h2>
          <button onClick={() => onOpenChange(false)} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="glass rounded-xl border border-border p-3">
            <Eye className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="font-bold tabular">{views}</p>
            <p className="text-[11px] text-muted-foreground">Vistas</p>
          </div>
          <div className="glass rounded-xl border border-border p-3">
            <Heart className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="font-bold tabular">{likes}</p>
            <p className="text-[11px] text-muted-foreground">Gostos</p>
          </div>
          <div className="glass rounded-xl border border-border p-3">
            <MessageCircle className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="font-bold tabular">{comments}</p>
            <p className="text-[11px] text-muted-foreground">Comentários</p>
          </div>
        </div>
      </div>
    </div>
  );
}
