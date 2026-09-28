import { useFollow } from "@/hooks/useFollow";
import { UserAvatar } from "@/components/UserAvatar";
import { useNavigate } from "react-router-dom";
import { X } from "@/lib/icons";

export type SuggestedProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  followers_count?: number;
};

export function FriendSuggestionCard({
  profile,
  onDismiss,
}: {
  profile: SuggestedProfile;
  onDismiss?: (id: string) => void;
}) {
  const { isFollowing, toggle, loading } = useFollow(profile.id);
  const navigate = useNavigate();

  return (
    <div className="relative shrink-0 w-[140px] glass rounded-2xl border border-border p-3 text-center">
      {onDismiss && (
        <button
          onClick={() => onDismiss(profile.id)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-secondary grid place-items-center"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <button onClick={() => profile.username && navigate(`/u/${profile.username}`)} className="w-full">
        <UserAvatar userId={profile.id} fallbackUrl={profile.avatar_url} fallbackName={profile.display_name} size={64} className="mx-auto" />
        <p className="mt-2 text-sm font-semibold truncate">{profile.display_name}</p>
        <p className="text-[11px] text-muted-foreground truncate">@{profile.username}</p>
      </button>
      <button
        onClick={toggle}
        disabled={loading}
        className="mt-2 w-full rounded-full gradient-money text-primary-foreground text-xs font-bold py-1.5 disabled:opacity-50"
      >
        {isFollowing ? "A seguir" : "Seguir"}
      </button>
    </div>
  );
}
