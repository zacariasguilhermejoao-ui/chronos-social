import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminModeration() {
  const { isAdmin, loading } = useIsAdmin();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => setReports(data ?? []));
  }, [isAdmin]);

  if (loading) return null;
  if (!isAdmin) return <div className="p-8 text-center">Acesso restrito</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
      <h1 className="font-display font-bold text-xl">Moderação</h1>
      {reports.length === 0 && <p className="text-sm text-muted-foreground">Sem denúncias</p>}
      {reports.map((r) => (
        <div key={r.id} className="glass rounded-xl border border-border p-3 text-sm">
          <p className="font-semibold">{r.target_type} · {r.reason}</p>
          <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-PT")}</p>
        </div>
      ))}
    </div>
  );
}
