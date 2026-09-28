import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminAds() {
  const { isAdmin, loading } = useIsAdmin();
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("ads").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => setAds(data ?? []));
  }, [isAdmin]);

  if (loading) return null;
  if (!isAdmin) return <div className="p-8 text-center">Acesso restrito</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
      <h1 className="font-display font-bold text-xl">Anúncios</h1>
      {ads.map((a) => (
        <div key={a.id} className="glass rounded-xl border border-border p-3">
          <p className="font-semibold text-sm">{a.headline ?? a.id}</p>
          <p className="text-xs text-muted-foreground">{a.status}</p>
        </div>
      ))}
    </div>
  );
}
