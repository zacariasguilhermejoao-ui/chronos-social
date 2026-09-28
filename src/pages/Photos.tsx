import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PhotoCard, { type Photo } from "@/components/PhotoCard";

export default function Photos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("photos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setPhotos((data ?? []) as Photo[]));
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 space-y-3">
      <h1 className="font-display font-bold text-xl">As tuas fotos</h1>
      {photos.map((p) => (
        <PhotoCard key={p.id} photo={p} />
      ))}
    </div>
  );
}
