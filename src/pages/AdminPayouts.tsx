import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { formatPoints } from "@/lib/money";

export default function AdminPayouts() {
  const { isAdmin, loading } = useIsAdmin();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("payout_requests").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => setRows(data ?? []));
  }, [isAdmin]);

  if (loading) return null;
  if (!isAdmin) return <div className="p-8 text-center">Acesso restrito</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
      <h1 className="font-display font-bold text-xl">Levantamentos</h1>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Sem pedidos</p>}
      {rows.map((r) => (
        <div key={r.id} className="glass rounded-xl border border-border p-3 flex justify-between">
          <div>
            <p className="font-semibold text-sm">{r.status}</p>
            <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-PT")}</p>
          </div>
          <p className="font-bold tabular">{formatPoints(r.amount_coins ?? 0)}</p>
        </div>
      ))}
    </div>
  );
}
