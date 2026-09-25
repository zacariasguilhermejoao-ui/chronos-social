import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ImagePlus, X } from "@/lib/icons";
import { toast } from "sonner";
import { z } from "zod";
import { MARKET_CATEGORIES } from "./Marketplace";

const schema = z.object({
  title: z.string().trim().min(3, "Título muito curto").max(100),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  price_kz: z.coerce.number().min(0, "Preço inválido").max(1_000_000_000),
  category: z.string().min(1, "Categoria obrigatória"),
  location: z.string().trim().max(80).optional().or(z.literal("")),
});

const MAX_PHOTOS = 6;
const MAX_BYTES = 8 * 1024 * 1024;

export default function MarketplaceNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price_kz: "",
    category: "",
    location: "",
  });

  if (!user) {
    navigate("/auth", { state: { from: "/marketplace/new" } });
    return null;
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list);
    for (const f of arr) {
      if (files.length >= MAX_PHOTOS) {
        toast.error(`Máximo ${MAX_PHOTOS} fotos`);
        break;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} excede 8MB`);
        continue;
      }
      setFiles((p) => [...p, f]);
      setPreviews((p) => [...p, URL.createObjectURL(f)]);
    }
  };

  const removePhoto = (i: number) => {
    setFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => {
      const copy = [...p];
      const [removed] = copy.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (files.length === 0) {
      toast.error("Adiciona pelo menos uma foto");
      return;
    }
    setBusy(true);
    try {
      const photos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${Date.now()}-${i}.${ext}`;
        const { error } = await supabase.storage
          .from("marketplace")
          .upload(path, f, { contentType: f.type, upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("marketplace").getPublicUrl(path);
        photos.push(pub.publicUrl);
      }

      const { data, error } = await supabase
        .from("marketplace_listings")
        .insert({
          user_id: user.id,
          title: parsed.data.title,
          description: parsed.data.description || null,
          price_kz: parsed.data.price_kz,
          category: parsed.data.category,
          location: parsed.data.location || null,
          photos,
        })
        .select("id")
        .single();
      if (error) throw error;

      toast.success("Anúncio publicado");
      navigate(`/marketplace/${data.id}`, { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao publicar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-display font-bold text-xl">Novo anúncio</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label className="mb-2 block">Fotos ({files.length}/{MAX_PHOTOS})</Label>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                <img src={src} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 grid place-items-center"
                  aria-label="Remover"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {files.length < MAX_PHOTOS && (
              <label className="aspect-square rounded-xl bg-secondary/50 border-2 border-dashed border-border grid place-items-center cursor-pointer hover:bg-secondary transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <ImagePlus className="w-6 h-6 text-muted-foreground" />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex: iPhone 13 Pro Max 256GB"
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="price">Preço (Kz)</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={form.price_kz}
              onChange={(e) => setForm({ ...form, price_kz: e.target.value })}
              placeholder="50000"
            />
          </div>
          <div className="space-y-1">
            <Label>Categoria</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleciona" />
              </SelectTrigger>
              <SelectContent>
                {MARKET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="location">Localização (opcional)</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Ex: Luanda, Talatona"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder="Descreve o produto, estado, condições, etc."
            maxLength={2000}
          />
        </div>

        <Button
          type="submit"
          disabled={busy}
          className="w-full h-12 gradient-money text-primary-foreground font-display font-bold"
        >
          {busy ? "A publicar..." : "Publicar anúncio"}
        </Button>
      </form>
    </div>
  );
}
