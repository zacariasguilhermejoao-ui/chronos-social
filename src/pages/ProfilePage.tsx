import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { UserAvatar } from "@/components/UserAvatar";
import { Settings } from "@/lib/icons";

export default function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const { profile: mine } = useProfile();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);

  const isMe = !username || username === "me" || username === mine?.username;

  useEffect(() => {
    (async () => {
      if (isMe && mine) {
        setProfile(mine);
        const { data } = await supabase.from("photos").select("*").eq("user_id", mine.id).order("created_at", { ascending: false }).limit(30);
        setPhotos(data ?? []);
        return;
      }
      if (!username) return;
      const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
      setProfile(data);
      if (data) {
        const { data: ph } = await supabase.from("photos").select("*").eq("user_id", data.id).order("created_at", { ascending: false }).limit(30);
        setPhotos(ph ?? []);
      }
    })();
  }, [username, isMe, mine]);

  if (!profile) {
    return <div className="p-8 text-center text-muted-foreground">A carregar…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="relative h-32 bg-secondary">
        {profile.cover_url && <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="px-4 -mt-10">
        <div className="flex items-end justify-between">
          <UserAvatar userId={profile.id} fallbackUrl={profile.avatar_url} fallbackName={profile.display_name} size={80} />
          {isMe ? (
            <div className="flex gap-2 mb-1">
              <Link to="/me/edit" className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold">Editar</Link>
              <button onClick={() => navigate("/settings")} className="w-9 h-9 rounded-full border border-border grid place-items-center">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
        <h1 className="mt-3 font-display font-extrabold text-xl">{profile.display_name}</h1>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
        {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        <p className="mt-2 text-sm">
          <span className="font-bold">{profile.followers_count ?? 0}</span>{" "}
          <span className="text-muted-foreground">seguidores</span>
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-0.5">
        {photos.map((p) => (
          <img key={p.id} src={p.image_url} alt="" className="aspect-square object-cover w-full" loading="lazy" />
        ))}
      </div>
      {photos.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">Sem publicações</p>
      )}
    </div>
  );
}
