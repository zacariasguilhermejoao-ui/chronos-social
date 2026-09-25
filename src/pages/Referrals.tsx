import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Copy, Share, Gift, Users, Coins } from "@/lib/icons";
import { UserAvatar } from "@/components/UserAvatar";
import { formatPoints } from "@/lib/money";

type Row = {
  id: string;
  referred_user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  reward_coins: number;
  status: string;
  created_at: string;
};

export default function Referrals() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<{ total_invited: number; total_earned_coins: number }>({ total_invited: 0, total_earned_coins: 0 });

  const link = useMemo(() => {
    if (!profile?.username) return "";
    return `${window.location.origin}/invite/${profile.username}`;
  }, [profile?.username]);

  useEffect(() => {
    (async () => {
      const [r, s] = await Promise.all([
        supabase.rpc("get_my_referrals"),
        supabase.rpc("get_my_referral_stats"),
      ]);
      setRows((r.data as Row[] | null) ?? []);
      const sd = s.data as any;
      if (sd) setStats({ total_invited: Number(sd.total_invited ?? 0), total_earned_coins: Number(sd.total_earned_coins ?? 0) });
    })();
  }, []);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado");
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  const share = async () => {
    if (!link) return;
    const text = `Junta-te a mim no Chrónos e ganha dinheiro a ver vídeos! ${link}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Chrónos", text, url: link }); return; } catch {}
    }
    copy();
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <h1 className="font-display font-bold text-xl">Convidar amigos</h1>
      </div>

      <div className="rounded-3xl gradient-money p-6 shadow-money text-primary-foreground">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          <p className="font-display font-bold text-lg">Ganha 100 Kz por amigo</p>
        </div>
        <p className="text-primary-foreground/85 text-sm mt-1">
          Por cada novo utilizador que se registar com o teu link, recebes <b>100 Kz</b> automaticamente.
        </p>
        <p className="text-primary-foreground/70 text-[11px] mt-1">Saque mínimo: 1000 Kz</p>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">O teu link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-lg px-3 py-2 font-mono text-xs truncate">{link || "—"}</div>
          <Button size="icon" variant="outline" onClick={copy} aria-label="Copiar"><Copy className="w-4 h-4" /></Button>
        </div>
        <Button onClick={share} className="w-full gradient-money text-primary-foreground font-display font-bold">
          <Share className="w-4 h-4 mr-2" /> Partilhar link
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Users className="w-3.5 h-3.5" /> Convidados</div>
          <p className="font-display font-bold text-2xl mt-1">{stats.total_invited}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Coins className="w-3.5 h-3.5" /> Ganho com convites</div>
          <p className="font-display font-bold text-2xl mt-1 text-money">{formatPoints(stats.total_earned_coins)}</p>
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-lg mb-3 px-1">Histórico</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Ainda não convidaste ninguém. Partilha o teu link!
          </p>
        ) : (
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div key={r.id} className="glass rounded-xl p-3 flex items-center gap-3">
                <UserAvatar
                  userId={r.referred_user_id}
                  fallbackUrl={r.avatar_url ?? undefined}
                  fallbackName={r.display_name || r.username || "User"}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.display_name || r.username}</p>
                  <p className="text-[10px] text-muted-foreground">
                    @{r.username} · {new Date(r.created_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold tabular text-money">
                  +{formatPoints(r.reward_coins)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
