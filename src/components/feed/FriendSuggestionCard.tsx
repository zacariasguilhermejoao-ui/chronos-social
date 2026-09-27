import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import { UserPlus, Check, X } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type SuggestedProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  mutual_count?: number;
};

export function FriendSuggestionCard({
  profile,
  onDismiss,
}: {
  profile: SuggestedProfile;
  onDismiss: (id: string) => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [friendReq, setFriendReq] = useState<"none" | "sent">("none");
  const [busy, setBusy] = useState(false);

  const requireAuth = () => {
    if (!user) {
      navigate("/auth");
      return false;
    }
    return true;
  };

  const toggleFollow = async () => {
    if (!requireAuth() || busy) return;
    setBusy(true);
    const prev = following;
    setFollowing(!prev);
    const { error } = prev
      ? await supabase.from("follows").delete().eq("follower_id", user!.id).eq("following_id", profile.id)
      : await supabase.from("follows").insert({ follower_id: user!.id, following_id: profile.id });
    if (error) {
      setFollowing(prev);
      toast.error("Não foi possível atualizar.");
    }
    setBusy(false);
  };

  const addFriend = async () => {
    if (!requireAuth() || busy || friendReq === "sent") return;
    setBusy(true);
    const { error } = await supabase.from("friendships").insert({
      requester_id: user!.id,
      addressee_id: profile.id,
      status: "pending",
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível enviar pedido.");
      return;
    }
    setFriendReq("sent");
    toast.success("Pedido de amizade enviado");
  };

  return (
    <article className="glass rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          <UserPlus className="w-3.5 h-3.5" />
          Pessoa que talvez conheças
        </div>
        <button
          onClick={() => onDismiss(profile.id)}
          className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground"
          aria-label="Dispensar"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="px-4 pt-3 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(`/u/${profile.username}`)}
          className="shrink-0"
          aria-label={profile.display_name}
        >
          <UserAvatar
            userId={profile.id}
            fallbackUrl={profile.avatar_url}
            fallbackName={profile.display_name}
            size={64}
          />
        </button>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => navigate(`/u/${profile.username}`)}
            className="text-left w-full"
          >
            <p className="font-display font-bold text-sm truncate">{profile.display_name}</p>
            <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
          </button>
          {profile.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{profile.bio}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-muted-foreground">
            <span>{profile.followers_count ?? 0} seguidores</span>
            {profile.mutual_count && profile.mutual_count > 0 ? (
              <span>{profile.mutual_count} amigos em comum</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
        <button
          onClick={toggleFollow}
          disabled={busy}
          className={cn(
            "rounded-full text-xs font-bold py-2 flex items-center justify-center gap-1.5 transition-colors",
            following
              ? "bg-secondary text-foreground"
              : "gradient-money text-primary-foreground shadow-money"
          )}
        >
          {following ? <><Check className="w-3.5 h-3.5" /> A seguir</> : <><UserPlus className="w-3.5 h-3.5" /> Seguir</>}
        </button>
        <button
          onClick={addFriend}
          disabled={busy || friendReq === "sent"}
          className={cn(
            "rounded-full text-xs font-bold py-2 flex items-center justify-center gap-1.5 transition-colors",
            friendReq === "sent"
              ? "bg-secondary text-muted-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/70"
          )}
        >
          {friendReq === "sent" ? <><Check className="w-3.5 h-3.5" /> Pedido enviado</> : <><UserPlus className="w-3.5 h-3.5" /> Adicionar amigo</>}
        </button>
      </div>
    </article>
  );
}
