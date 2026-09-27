import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload as UploadIcon, Film, Music, X } from "@/lib/icons";
import { z } from "zod";
import { generateVideoThumbnail } from "@/lib/videoThumbnail";
import { requestReelProcessing } from "@/lib/reelDownload";

const schema = z.object({
  title: z.string().trim().min(2, "Título muito curto").max(80),
  description: z.string().trim().max(500).optional(),
});

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const audioFromUrl = params.get("audio");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [audioSourceId, setAudioSourceId] = useState<string | null>(audioFromUrl);
  const [audioSourceMeta, setAudioSourceMeta] = useState<{ title: string; username: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!audioSourceId) { setAudioSourceMeta(null); return; }
    (async () => {
      const { data: v } = await supabase
        .from("videos")
        .select("title,user_id")
        .eq("id", audioSourceId)
        .maybeSingle();
      if (!v) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", v.user_id)
        .maybeSingle();
      setAudioSourceMeta({ title: v.title, username: p?.username ?? "criador" });
    })();
  }, [audioSourceId]);

  const onPick = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) { toast.error("Só vídeos"); return; }
    if (f.size > 50 * 1024 * 1024) { toast.error("Máx 50 MB nesta versão"); return; }
    setFile(f);
  };

  const submit = async () => {
    if (!user || !file) return;
    const parsed = schema.safeParse({ title, description });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }

    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "mp4";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("videos").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      setProgress(60);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);

      let thumbnailUrl: string | null = null;
      try {
        const thumbBlob = await generateVideoThumbnail(file);
        if (thumbBlob) {
          const thumbPath = `${user.id}/${crypto.randomUUID()}.jpg`;
          const { error: thErr } = await supabase.storage
            .from("videos")
            .upload(thumbPath, thumbBlob, { contentType: "image/jpeg", upsert: false });
          if (!thErr) {
            const { data: thPub } = supabase.storage.from("videos").getPublicUrl(thumbPath);
            thumbnailUrl = thPub.publicUrl;
          }
        }
      } catch {
        /* ignora */
      }
      setProgress(85);

      const { data: inserted, error: insErr } = await supabase.from("videos").insert({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        video_url: pub.publicUrl,
        thumbnail_url: thumbnailUrl,
        audio_source_video_id: audioSourceId,
      }).select("id").maybeSingle();
      if (insErr) throw insErr;
      if (inserted?.id) void requestReelProcessing(inserted.id);
      setProgress(100);
      toast.success("Vídeo publicado", { description: "Já está a gerar receita." });
      navigate("/");
    } catch (e: any) {
      toast.error(e.message ?? "Falhou");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto space-y-4 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Novo vídeo</h1>

      {audioSourceMeta && (
        <div className="flex items-center justify-between rounded-2xl bg-secondary/60 border border-border/60 p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl gradient-violet grid place-items-center shrink-0">
              <Music className="w-5 h-5 text-accent-foreground animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">A usar áudio de</p>
              <p className="font-semibold text-sm truncate">{audioSourceMeta.title}</p>
              <p className="text-[11px] text-muted-foreground">@{audioSourceMeta.username}</p>
            </div>
          </div>
          <button onClick={() => setAudioSourceId(null)} className="p-2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-video rounded-2xl border-2 border-dashed border-border bg-secondary/30 hover:border-primary transition-colors grid place-items-center text-center p-4"
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <Film className="w-10 h-10 text-money" />
            <p className="font-medium text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadIcon className="w-10 h-10" />
            <p className="font-medium text-sm">Toca para escolher um vídeo</p>
            <p className="text-xs">MP4 · até 50 MB</p>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      <div className="space-y-3">
        <div>
          <Label>Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Algo cativante..." maxLength={80} />
        </div>
        <div>
          <Label>Descrição (opcional)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Conta a história..." maxLength={500} />
        </div>
      </div>

      <div className="glass rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
        <span className="text-foreground font-medium">Monetização ativa.</span> Vais receber <span className="text-money font-bold">70%</span> de cada visualização. Cada 30s assistidos = <span className="text-money font-bold">0.14 Kz</span> para ti.
      </div>

      {progress > 0 && (
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full gradient-money transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <Button
        onClick={submit}
        disabled={!file || busy}
        className="w-full h-12 gradient-money text-primary-foreground font-display font-bold shadow-money"
      >
        {busy ? "A publicar..." : "Publicar"}
      </Button>
    </div>
  );
}
