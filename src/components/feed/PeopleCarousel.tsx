import { FriendSuggestionCard, type SuggestedProfile } from "./FriendSuggestionCard";

export function PeopleCarousel({
  profiles,
  onDismiss,
}: {
  profiles: SuggestedProfile[];
  onDismiss?: (id: string) => void;
}) {
  if (!profiles.length) return null;
  return (
    <div className="py-1">
      <p className="text-xs font-semibold text-muted-foreground px-1 mb-2">Pessoas para seguir</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {profiles.map((p) => (
          <FriendSuggestionCard key={p.id} profile={p} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}
