import { useState } from "react";
import { StoriesRail } from "@/components/stories/StoriesRail";
import { StoryCreate } from "@/components/stories/StoryCreate";
import { Button } from "@/components/ui/button";
import { Plus } from "@/lib/icons";

export default function Stories() {
  const [creating, setCreating] = useState(false);
  return (
    <div className="px-3 py-4 max-w-xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Stories</h1>
        <Button
          onClick={() => setCreating(true)}
          className="rounded-full gradient-money text-primary-foreground font-bold"
        >
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </div>

      <StoriesRail />

      <p className="text-xs text-muted-foreground text-center pt-4">
        Os stories desaparecem após 24 horas. Toca num círculo para abrir.
      </p>

      {creating && <StoryCreate onClose={() => setCreating(false)} />}
    </div>
  );
}
