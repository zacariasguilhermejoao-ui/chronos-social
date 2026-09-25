import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, Check, Search, Users } from "@/lib/icons";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";

type Candidate = { id: string; username: string; display_name: string; avatar_url: string | null };

export default function GroupCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupType, setGroupType] = useState<"social" | "commercial" | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Map<string, Candidate>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      const ids = Array.from(new Set((follows ?? []).map((f: any) => f.following_id)));
      if (!ids.length) return;
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,username,display_name,avatar_url")
        .in("id", ids)
        .limit(100);
      setCandidates((profs ?? []) as Candidate[]);
    })();
  }, [user]);

  const filtered = candidates.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.username.toLowerCase().includes(q) ||
      (c.display_name || "").toLowerCase().includes(q)
    );
  });

  const toggle = (c: Candidate) => {
    const next = new Map(selected);
    if (next.has(c.id)) next.delete(c.id);
    else next.set(c.id, c);
    setSelected(next);
  };

  const onPhoto = (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Dá um nome ao grupo");
      return;
    }
    setSubmitting(true);
    try {
      const { data: gid, error } = await supabase.rpc("create_group_v2", {
        p_name: name.trim(),
        p_description: description.trim() || null,
        p_photo_url: null,
        p_member_ids: Array.from(selected.keys()),
        p_group_type: groupType ?? "social",
      });
      if (error || !gid) throw error ?? new Error("Falha ao criar grupo");

      if (photoFile) {
        const ext = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${gid}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("group-photos")
          .upload(path, photoFile, { upsert: true, contentType: photoFile.type });
        if (!upErr) {
          const { data } = supabase.storage.from("group-photos").getPublicUrl(path);
          await supabase.from("groups").update({ photo_url: data.publicUrl }).eq("id", gid as string);
        }
      }

      toast.success("Grupo criado");
      navigate(`/groups/${gid}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Erro ao criar grupo");
    } finally {
      setSubmitting(false);
    }
  };

  if (!groupType) {
    return (
      <div className="px-4 py-6 max-w-xl mx-auto animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate("/groups")} className="p-1" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-xl flex-1">Criar grupo</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Que tipo de grupo pretende criar?</p>
        <button
          onClick={() => setGroupType("social")}
          className="w-full glass rounded-2xl p-4 text-left mb-3 hover:bg-secondary/50 transition-colors"
        >
          <p className="font-display font-bold mb-1">Grupo Social</p>
          <p className="text-xs text-muted-foreground">
            Para conversar com amigos, família, colegas, escola, trabalho, jogos e comunidades.
          </p>
        </button>
        <button
          onClick={() => setGroupType("commercial")}
          className="w-full glass rounded-2xl p-4 text-left border-chronos-pink hover:bg-secondary/50 transition-colors"
        >
          <p className="font-display font-bold mb-1 text-chronos-pink">Grupo Comercial</p>
          <p className="text-xs text-muted-foreground">
            Para vender produtos, divulgar serviços, atender clientes e gerir um catálogo dentro do grupo.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate("/groups")} className="p-1" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-xl flex-1">Novo grupo</h1>
      </div>

      <div className="glass rounded-2xl p-4 mb-3 flex items-center gap-3">
        <label className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-violet grid place-items-center cursor-pointer shrink-0">
          {photoPreview ? (
            <img src={photoPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPhoto(f);
            }}
          />
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do grupo"
          maxLength={60}
          className="flex-1"
        />
      </div>

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (opcional)"
        maxLength={300}
        className="mb-3"
        rows={2}
      />

      {selected.size > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {Array.from(selected.values()).map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c)}
              className="shrink-0 flex flex-col items-center gap-1 w-14"
              title="Remover"
            >
              <div className="relative">
                <UserAvatar userId={c.id} fallbackUrl={c.avatar_url} fallbackName={c.display_name} size={48} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] grid place-items-center font-bold">×</span>
              </div>
              <span className="text-[10px] truncate w-full text-center">{c.display_name?.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar pessoas que segues..."
          className="pl-9"
        />
      </div>

      <p className="text-xs text-muted-foreground mb-2 px-1">
        {selected.size} {selected.size === 1 ? "membro selecionado" : "membros selecionados"}
      </p>

      <div className="space-y-1.5 mb-24">
        {filtered.length === 0 && (
          <div className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Segue pessoas para as poderes adicionar a grupos.
          </div>
        )}
        {filtered.map((c) => {
          const on = selected.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c)}
              className={`w-full glass rounded-xl p-3 flex items-center gap-3 transition-colors ${
                on ? "ring-2 ring-primary" : "hover:bg-secondary/50"
              }`}
            >
              <UserAvatar userId={c.id} fallbackUrl={c.avatar_url} fallbackName={c.display_name} size={40} />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-sm truncate">{c.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{c.username}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full grid place-items-center ${
                  on ? "gradient-money text-primary-foreground" : "border border-border"
                }`}
              >
                {on && <Check className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-20 inset-x-0 px-4 z-20">
        <div className="max-w-xl mx-auto">
          <Button
            onClick={submit}
            disabled={submitting || !name.trim()}
            className="w-full gradient-money text-primary-foreground h-12 text-base font-semibold shadow-money"
          >
            {submitting ? "A criar..." : `Criar grupo${selected.size ? ` com ${selected.size + 1}` : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
