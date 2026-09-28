import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Eye, Users, Heart, MessageCircle, Send, Bookmark, UserPlus } from "@/lib/icons";

export type StatsKind = "photo" | "video" | "page_post";

type Stats = {
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  new_followers: number;
  created_at?: string;
};

const EMPTY: Stats = {
  views: 0,
  reach: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  new_followers: 0,
};

function Tile({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: typeof Eye;
}) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-4">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <p className="text-2xl font-display font-extrabold tabular-nums leading-none">
        {value.toLocaleString("pt-PT")}
      </p>
      <p className="text-[12px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export function PostStatsSheet({
  open,
  onOpenChange,
  kind,
  id,
  fallback,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: StatsKind;
  id: string;
  fallback?: Partial<Stats>;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    setFailed(false);
    (async () => {
      const { data, error } = await (supabase.rpc as any)("post_stats", {
        p_kind: kind,
        p_id: id,
      });
      if (!alive) return;
      if (error || !data) {
        if (fallback && Object.keys(fallback).length) {
          setStats({ ...EMPTY, ...fallback });
        } else {
          setFailed(true);
          setStats(null);
        }
      } else {
        setStats({ ...EMPTY, ...(data as Stats) });
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [open, kind, id]);

  const hasData =
    !!stats &&
    stats.views + stats.reach + stats.likes + stats.comments + stats.saves + stats.new_followers > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-t border-border p-0 max-h-[80dvh] overflow-y-auto"
      >
        <div className="px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="w-10 h-1 rounded-full bg-secondary mx-auto mb-5" />
          <h2 className="font-display font-extrabold text-xl mb-1">Estatísticas</h2>
          <p className="text-[13px] text-muted-foreground mb-5">
            Desempenho desta publicação
          </p>

          {loading && (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[104px] rounded-2xl bg-secondary/40 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && (hasData || (stats && !failed)) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Tile label="Visualizações" value={stats!.views} Icon={Eye} />
                <Tile label="Alcance" value={stats!.reach} Icon={Users} />
                <Tile label="Curtidas" value={stats!.likes} Icon={Heart} />
                <Tile label="Comentários" value={stats!.comments} Icon={MessageCircle} />
                <Tile label="Partilhas" value={stats!.shares} Icon={Send} />
                <Tile label="Guardados" value={stats!.saves} Icon={Bookmark} />
                {stats!.new_followers > 0 && (
                  <Tile label="Novos seguidores" value={stats!.new_followers} Icon={UserPlus} />
                )}
              </div>
              {!hasData && (
                <p className="text-[13px] text-muted-foreground text-center mt-5">
                  Ainda não existem estatísticas para este post.
                </p>
              )}
            </>
          )}

          {!loading && failed && (
            <p className="text-[14px] text-muted-foreground text-center py-10">
              Ainda não existem estatísticas para este post.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
