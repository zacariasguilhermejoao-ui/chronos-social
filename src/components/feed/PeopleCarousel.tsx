import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import { UserPlus, Check, X } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SuggestedProfile } from "./FriendSuggestionCard";

type FriendState = "none" | "sent" | "incoming" | "friends";

function PersonCard({
  profile,
  onDismiss,
}: {
  profile: SuggestedProfile;
  onDismiss: (id: string) => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(profile.followers_count ?? 0);
  const [friend, setFriend] = useState<FriendState>("none");
  const [friendRow, setFriendRow] = useState<string | null>(null);
  const [busyFollow, setBusyFollow] = useState(false);
  const [busyFriend, setBusyFriend] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!user || user.id === profile.id) return;
    (async () => {
      const [{ data: f }, { data: fr }, { count }] = await Promise.all([
        supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .maybeSingle(),
        supabase
          .from("friendships")
          .select("id,requester_id,status")
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`
          )
          .maybeSingle(),
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", profile.id),
      ]);
      if (!alive) return;
      setFollowing(!!f);
      if (typeof count === "number") setFollowers(count);
      if (fr) {
        setFriendRow(fr.id);
        if (fr.status === "accepted") setFriend("friends");
        else if (fr.status === "pending") setFriend(fr.requester_id === user.id ? "sent" : "incoming");
        else setFriend("none");
      } else {
        setFriendRow(null);
        setFriend("none");
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, profile.id]);

  const requireAuth = () => {
    if (!user) {
      navigate("/auth");
      return false;
    }
    return true;
  };

  const toggleFollow = async () => {
    if (!requireAuth() || busyFollow) return;
    setBusyFollow(true);
    const prev = following;
    setFollowing(!prev);
    setFollowers((n) => Math.max(0, n + (prev ? -1 : 1)));
    const { error } = prev
      ? await supabase.from("follows").delete().eq("follower_id", user!.id).eq("following_id", profile.id)
      : await supabase.from("follows").insert({ follower_id: user!.id, following_id: profile.id });
    if (error) {
      setFollowing(prev);
      setFollowers((n) => Math.max(0, n + (prev ? 1 : -1)));
      toast.error("Não foi possível atualizar.");
    }
    setBusyFollow(false);
  };

  const friendAction = async () => {
    if (!requireAuth() || busyFriend) return;
    setBusyFriend(true);
    try {
      if (friend === "none") {
        const { data, error } = await supabase
          .from("friendships")
          .insert({ requester_id: user!.id, addressee_id: profile.id, status: "pending" })
          .select("id")
          .single();
        if (error) throw error;
        setFriendRow(data.id);
        setFriend("sent");
        toast.success("Pedido de amizade enviado");
      } else if (friend === "sent" && friendRow) {
        const { error } = await supabase.from("friendships").delete().eq("id", friendRow);
        if (error) throw error;
        setFriendRow(null);
        setFriend("none");
        toast("Pedido cancelado");
      } else if (friend === "incoming" && friendRow) {
        const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendRow);
        if (error) throw error;
        setFriend("friends");
        toast.success("Amizade aceite");
      } else if (friend === "friends" && friendRow) {
        const { error } = await supabase.from("friendships").delete().eq("id", friendRow);
        if (error) throw error;
        setFriendRow(null);
        setFriend("none");
        toast("Amizade removida");
      }
    } catch (e: any) {
      toast.error("Não foi possível concluir.", { description: e?.message });
    } finally {
      setBusyFriend(false);
    }
  };

  const friendLabel =
    friend === "sent"
      ? "PEDIDO ENVIADO"
      : friend === "incoming"
        ? "ACEITAR"
        : friend === "friends"
          ? "AMIGOS"
          : "AMIZADE";

  return (
    <div className="relative shrink-0 snap-start w-[205px] sm:w-[225px] rounded-[20px] border border-border bg-card p-4 flex flex-col items-center text-center">
      <button
        onClick={() => onDismiss(profile.id)}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-secondary text-muted-foreground"
        aria-label="Dispensar"
      >
        <X className="w-4 h-4" />
      </button>

      <button onClick={() => navigate(`/u/${profile.username}`)} className="mt-2 press">
        <UserAvatar
          userId={profile.id}
          fallbackUrl={profile.avatar_url}
          fallbackName={profile.display_name}
          size={112}
        />
      </button>

      <button onClick={() => navigate(`/u/${profile.username}`)} className="mt-3 w-full">
        <p className="text-[17px] font-bold leading-tight truncate">{profile.display_name}</p>
      </button>

      <p className="mt-1 text-[13px] text-muted-foreground truncate w-full">
        {followers} {followers === 1 ? "seguidor" : "seguidores"}
        {profile.mutual_count && profile.mutual_count > 0
          ? ` · ${profile.mutual_count} em comum`
          : ""}
      </p>

      <div className="mt-3.5 w-full grid grid-cols-2 gap-2">
        <button
          onClick={toggleFollow}
          disabled={busyFollow}
          className={cn(
            "h-11 rounded-xl text-[13px] font-extrabold uppercase tracking-[0.04em] flex items-center justify-center transition-colors disabled:opacity-70",
            following
              ? "bg-primary/12 text-primary border border-primary/40"
              : "bg-primary text-primary-foreground"
          )}
        >
          {following ? "A SEGUIR" : "SEGUIR"}
        </button>
        <button
          onClick={friendAction}
          disabled={busyFriend}
          className={cn(
            "h-11 rounded-xl text-[13px] font-extrabold uppercase tracking-[0.04em] flex items-center justify-center px-1 transition-colors disabled:opacity-70",
            friend === "none" || friend === "incoming"
              ? "bg-primary text-primary-foreground"
              : "bg-primary/12 text-primary border border-primary/40"
          )}
        >
          <span className="truncate">{friendLabel}</span>
        </button>
      </div>
    </div>
  );
}

export function PeopleCarousel({
  profiles,
  onDismiss,
}: {
  profiles: SuggestedProfile[];
  onDismiss: (id: string) => void;
}) {
  if (!profiles.length) return null;
  return (
    <section className="surface py-4">
      <h2 className="px-4 pb-3 text-[15px] font-extrabold tracking-[0.02em] text-foreground">
        SEGUIR OU CRIAR AMIZADES
      </h2>
      <div className="overflow-x-auto no-scrollbar px-4">
        <div className="flex gap-3.5 snap-x snap-mandatory pb-1">
          {profiles.map((p) => (
            <PersonCard key={p.id} profile={p} onDismiss={onDismiss} />
          ))}
        </div>
      </div>
    </section>
  );
}
