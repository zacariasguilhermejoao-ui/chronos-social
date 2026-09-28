import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { formatPoints, formatKz } from "@/lib/money";
import { Wallet as WalletIcon } from "@/lib/icons";

export default function Wallet() {
  const { user } = useAuth();
  const { profile, refresh } = useProfile();
  const [tx, setTx] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    refresh();
    supabase
      .from("coin_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setTx(data ?? []));
  }, [user]);

  const balance = profile?.balance_coins ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <div className="glass rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 grid place-items-center">
            <WalletIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className="text-2xl font-display font-extrabold tabular">{formatPoints(balance)}</p>
            <p className="text-xs text-muted-foreground">{formatKz(balance)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-muted-foreground text-xs">Ganhos</p>
            <p className="font-bold tabular">{formatPoints(profile?.total_earned_coins ?? 0)}</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <p className="text-muted-foreground text-xs">Gastos</p>
            <p className="font-bold tabular">{formatPoints(profile?.total_spent_coins ?? 0)}</p>
          </div>
        </div>
      </div>

      <h2 className="font-bold text-sm">Movimentos</h2>
      <div className="space-y-2">
        {tx.length === 0 && <p className="text-sm text-muted-foreground">Sem movimentos ainda</p>}
        {tx.map((t) => (
          <div key={t.id} className="flex justify-between items-center glass rounded-xl border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">{t.reason ?? t.type ?? "Movimento"}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(t.created_at).toLocaleString("pt-PT")}</p>
            </div>
            <p className={`font-bold tabular text-sm ${(t.amount ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
              {formatPoints(t.amount ?? 0, { sign: true })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
