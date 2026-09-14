import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImagePlus } from "@/lib/icons";

export default function PhotoUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Só imagens");
    if (f.size > 10 * 1024 * 1024) return toast.error("Máx 10 MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!user || !file) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
      const { error: insErr } = await supabase.from("photos").insert({
        user_id: user.id,
        image_url: pub.publicUrl,
        caption: caption.trim() ? caption.trim().slice(0, 500) : null,
      });
      if (insErr) throw insErr;
      toast.success("Foto publicada");
      navigate("/photos");
    } catch (e: any) {
      toast.error(e.message ?? "Falhou");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto space-y-4 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Nova foto</h1>

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-square rounded-2xl border-2 border-dashed border-border bg-secondary/30 hover:border-primary transition-colors grid place-items-center overflow-hidden"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus className="w-10 h-10" />
            <p className="font-medium text-sm">Toca para escolher</p>
            <p className="text-xs">JPG / PNG · até 10 MB</p>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Legenda (opcional)"
        maxLength={500}
      />

      <div className="glass rounded-xl p-3 text-xs text-muted-foreground">
        Fotos são <span className="text-foreground font-medium">grátis</span>. Visíveis para os teus seguidores.
      </div>

      <Button
        onClick={submit}
        disabled={!file || busy}
        className="w-full h-12 gradient-money text-primary-foreground font-display font-bold"
      >
        {busy ? "A publicar..." : "Publicar foto"}
      </Button>
    </div>
  );
}
