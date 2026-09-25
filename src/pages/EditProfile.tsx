import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, ImagePlus, ArrowLeft, Loader2 } from "@/lib/icons";
import { toast } from "sonner";

export default function EditProfile() {
  const { user } = useAuth();
  const { profile, refresh } = useProfile();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setUsername(profile.username ?? "");
      setBio(profile.bio ?? "");
      setLocation(profile.location ?? "");
      setAvatarUrl(profile.avatar_url);
      setCoverUrl(profile.cover_url);
    }
  }, [profile]);

  const uploadImage = async (file: File, kind: "avatar" | "cover") => {
    if (!user) return null;
    if (!file.type.startsWith("image/")) {
      toast.error("Só imagens");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máx 5 MB");
      return null;
    }
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) {
      toast.error(upErr.message);
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const onPickAvatar = async (f: File | null) => {
    if (!f) return;
    setUploadingAvatar(true);
    const url = await uploadImage(f, "avatar");
    if (url) setAvatarUrl(url);
    setUploadingAvatar(false);
  };

  const onPickCover = async (f: File | null) => {
    if (!f) return;
    setUploadingCover(true);
    const url = await uploadImage(f, "cover");
    if (url) setCoverUrl(url);
    setUploadingCover(false);
  };

  const save = async () => {
    if (!user) return;
    if (!displayName.trim()) return toast.error("Nome obrigatório");
    if (!username.trim() || username.length < 3) return toast.error("Username (mín. 3)");
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return toast.error("Username só letras, números e _");

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim().slice(0, 50),
        username: username.trim().toLowerCase().slice(0, 30),
        bio: bio.trim() ? bio.trim().slice(0, 200) : null,
        location: location.trim() ? location.trim().slice(0, 80) : null,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Username já existe" : error.message);
      return;
    }
    toast.success("Perfil atualizado");
    await refresh();
    navigate("/me");
  };

  if (!profile) {
    return <div className="grid place-items-center py-12 text-muted-foreground text-sm">A carregar...</div>;
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-8">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full glass grid place-items-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-xl">Editar perfil</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => coverInput.current?.click()}
          className="w-full h-40 bg-secondary/50 overflow-hidden relative group"
        >
          {coverUrl ? (
            <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-violet" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
            <ImagePlus className="w-7 h-7 text-white" />
          </div>
          {uploadingCover && (
            <div className="absolute inset-0 bg-black/60 grid place-items-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </button>
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickCover(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={() => avatarInput.current?.click()}
          className="absolute -bottom-12 left-4 w-24 h-24 rounded-3xl bg-gradient-violet shadow-violet grid place-items-center overflow-hidden border-4 border-background group"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-3xl text-white">
              {displayName?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-black/60 grid place-items-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </button>
        <input
          ref={avatarInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="px-4 pt-16 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={30}
            placeholder="seu_username"
          />
          <p className="text-xs text-muted-foreground">@{username || "username"}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conta algo sobre ti..."
            maxLength={200}
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="loc">Localização</Label>
          <Input
            id="loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={80}
            placeholder="Luanda, Angola"
          />
        </div>

        <Button
          onClick={save}
          disabled={saving || uploadingAvatar || uploadingCover}
          className="w-full h-12 gradient-money text-primary-foreground font-display font-bold"
        >
          {saving ? "A salvar..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
