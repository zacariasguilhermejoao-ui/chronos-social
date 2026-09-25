import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { ArrowLeft, Heart, MessageCircle, UserPlus, Send, Users, Coins, CheckCircle2, XCircle, Bell, Share } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";

const meta: Record<string, { icon: any; label: (n: Notification) => string; route: (n: Notification) => string | null; tone: string }> = {
  like_video:    { icon: Heart, label: () => `gostou do teu vídeo`, route: (n) => n.entity_id ? `/v/${n.entity_id}` : null, tone: "text-destructive" },
  like_photo:    { icon: Heart, label: () => `gostou da tua foto`,  route: () => "/photos", tone: "text-destructive" },
  comment_video: { icon: MessageCircle, label: (n) => `comentou: "${n.data?.preview ?? ""}"`, route: (n) => n.entity_id ? `/v/${n.entity_id}` : null, tone: "text-primary" },
  comment_photo: { icon: MessageCircle, label: (n) => `comentou a tua foto: "${n.data?.preview ?? ""}"`, route: () => "/photos", tone: "text-primary" },
  reply_comment: { icon: MessageCircle, label: () => `respondeu ao teu comentário`, route: (n) => n.entity_id ? `/v/${n.entity_id}` : null, tone: "text-primary" },
  follow:        { icon: UserPlus, label: () => `começou a seguir-te`, route: (n) => n.actor?.username ? `/u/${n.actor.username}` : null, tone: "text-violet" },
  message:       { icon: Send, label: (n) => `enviou: "${n.data?.preview ?? "Nova mensagem"}"`, route: (n) => n.data?.thread_id ? `/messages/${n.data.thread_id}` : "/messages", tone: "text-primary" },
  group_added:   { icon: Users, label: () => `adicionou-te a um grupo`, route: (n) => n.entity_id ? `/groups/${n.entity_id}` : "/groups", tone: "text-violet" },
  group_message: { icon: MessageCircle, label: () => `nova mensagem no grupo`, route: (n) => n.entity_id ? `/groups/${n.entity_id}` : "/groups", tone: "text-primary" },
  share:         { icon: Share, label: () => `partilhou o teu post`, route: (n) => n.entity_id ? `/v/${n.entity_id}` : null, tone: "text-violet" },
  earn_view:     { icon: Coins, label: (n) => `+${((n.data?.amount_coins ?? 0)/100).toFixed(2)} Kz pela tua visualização`, route: (n) => n.entity_id ? `/v/${n.entity_id}` : "/wallet", tone: "text-money" },
  payout_paid:     { icon: CheckCircle2, label: (n) => `Saque pago: ${n.data?.amount_kz ?? ""} Kz`, route: () => "/wallet", tone: "text-money" },
  payout_approved: { icon: CheckCircle2, label: (n) => `Saque aprovado: ${n.data?.amount_kz ?? ""} Kz`, route: () => "/wallet", tone: "text-money" },
  payout_rejected: { icon: XCircle, label: (n) => `Saque rejeitado: ${n.data?.amount_kz ?? ""} Kz`, route: () => "/wallet", tone: "text-destructive" },
};

function relativeTime(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("pt-PT");
}

function dayKey(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoje";
  if (d.toDateString() === yest.toDateString()) return "Ontem";
  const diff = (Date.now() - d.getTime()) / 86400000;
  if (diff < 7) return "Esta semana";
  if (diff < 30) return "Este mês";
  return "Mais antigas";
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { items, loading, markAllRead, markRead } = useNotifications();

  useEffect(() => {
    const t = setTimeout(() => markAllRead(), 1500);
    return () => clearTimeout(t);
  }, [markAllRead]);

  const grouped = useMemo(() => {
    const g = new Map<string, Notification[]>();
    items.forEach((n) => {
      const k = dayKey(n.created_at);
      if (!g.has(k)) g.set(k, []);
      g.get(k)!.push(n);
    });
    return Array.from(g.entries());
  }, [items]);

  const handleClick = async (n: Notification) => {
    if (!n.read_at) await markRead(n.id);
    const route = meta[n.type]?.route(n) ?? null;
    if (route) navigate(route);
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto animate-fade-in pb-24">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Voltar">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-2xl flex-1">Notificações</h1>
        {items.some((n) => !n.read_at) && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>
            Marcar todas
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-12">A carregar...</p>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center mt-6">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold">Sem notificações</p>
          <p className="text-xs text-muted-foreground mt-1">
            Aqui aparecem as tuas notificações: gostos, comentários, seguidores, mensagens, grupos e ganhos.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, list]) => (
            <div key={day}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-2">{day}</p>
              <div className="space-y-1.5">
                {list.map((n) => {
                  const m = meta[n.type] ?? { icon: Bell, label: () => n.type, route: () => null, tone: "text-foreground" };
                  const Icon = m.icon;
                  const unread = !n.read_at;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left glass rounded-xl p-3 flex items-center gap-3 transition-colors ${
                        unread ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-secondary/40"
                      }`}
                    >
                      {n.actor ? (
                        <UserAvatar
                          userId={n.actor.id}
                          fallbackUrl={n.actor.avatar_url}
                          fallbackName={n.actor.display_name}
                          size={40}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary grid place-items-center shrink-0">
                          <Icon className={`w-5 h-5 ${m.tone}`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-tight">
                          <span className="font-semibold">
                            {n.actor?.display_name ?? "Chrónos"}
                          </span>{" "}
                          <span className="text-muted-foreground">{m.label(n)}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Icon className={`w-3 h-3 ${m.tone}`} /> {relativeTime(n.created_at)}
                        </p>
                      </div>
                      {unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
