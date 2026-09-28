import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X } from "@/lib/icons";

export function PagePostComposer({
  pageId,
  open,
  onOpenChange,
  onPublished,
}: {
  pageId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPublished?: () => void;
}) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const publish = async () => {
    if (!user || !content.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("page_posts").insert({
        page_id: pageId,
        author_id: user.id,
        content: content.trim(),
      });
      if (error) throw error;
      toast.success("Publicado");
      setContent("");
      onPublished?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Falha");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => onOpenChange(false)} className="w-10 h-10 rounded-full bg-secondary grid place-items-center">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-bold">Publicar na página</h2>
        <button onClick={publish} disabled={busy || !content.trim()} className="rounded-full gradient-money text-primary-foreground px-4 py-2 text-sm font-bold disabled:opacity-40">
          Publicar
        </button>
      </header>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="O que queres partilhar?"
        className="flex-1 p-4 bg-transparent outline-none resize-none text-sm"
        autoFocus
      />
    </div>
  );
}
