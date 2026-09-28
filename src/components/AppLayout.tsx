import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  Film,
  Plus,
  Store,
  User as UserIcon,
  Search,
  Users,
  Bell,
  MessageCircle,
  Image as ImageIcon,
} from "@/lib/icons";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { usePendingFriendRequests } from "@/hooks/usePendingFriendRequests";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import chronosLogo from "@/assets/chronos-c.png.asset.json";
import { UserAvatar } from "./UserAvatar";
import { EarningsOnboarding } from "./EarningsOnboarding";
import ChronosComposer from "./composer/ChronosComposer";

const tabs = [
  { to: "/", label: "Início", icon: HomeIcon, end: true, requiresAuth: false },
  { to: "/reels", label: "Reels", icon: Film, requiresAuth: false },
  { to: "/upload", label: "Criar", icon: Plus, primary: true, requiresAuth: true },
  { to: "/marketplace", label: "Marketplace", icon: Store, requiresAuth: false },
  { to: "/me", label: "Perfil", icon: UserIcon, requiresAuth: true },
];

function Badge({ count, tone }: { count: number; tone: "primary" | "alert" }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold grid place-items-center leading-none border-2 border-background",
        tone === "primary"
          ? "bg-primary text-primary-foreground"
          : "bg-destructive text-destructive-foreground"
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function AppLayout() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const unread = useUnreadMessages();
  const unreadNotif = useUnreadNotifications();
  const pendingFriends = usePendingFriendRequests();
  const location = useLocation();
  const navigate = useNavigate();
  const isReels = location.pathname === "/reels";
  const isFeed = location.pathname === "/";
  const isChat =
    /^\/messages\/[^/]+$/.test(location.pathname) ||
    /^\/groups\/[^/]+$/.test(location.pathname);
  const [openCreate, setOpenCreate] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"text" | "photo" | "video">("text");
  const [headerHidden, setHeaderHidden] = useState(false);
  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try { Notification.requestPermission(); } catch {}
      }
    }
  }, [user]);

  useEffect(() => {
    if (!isFeed) {
      setHeaderHidden(false);
      setNavHidden(false);
      return;
    }
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last;
        if (y < 140) { setHeaderHidden(false); setNavHidden(false); }
        else if (delta > 18) { setHeaderHidden(true); setNavHidden(true); }
        else if (delta < -18) { setHeaderHidden(false); setNavHidden(false); }
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isFeed]);

  const requireAuth = (path: string) => {
    if (!user) {
      navigate("/auth", { state: { from: path } });
      return false;
    }
    return true;
  };

  const topItems = [
    { key: "search", label: "Explorar", icon: Search, onClick: () => requireAuth("/search") && navigate("/search"), badge: 0, tone: "primary" as const },
    { key: "friends", label: "Amigos", icon: Users, onClick: () => requireAuth("/friends") && navigate("/friends"), badge: pendingFriends, tone: "primary" as const },
    { key: "notif", label: "Notificações", icon: Bell, onClick: () => requireAuth("/notifications") && navigate("/notifications"), badge: unreadNotif, tone: "primary" as const },
    { key: "msg", label: "Mensagens", icon: MessageCircle, onClick: () => requireAuth("/messages") && navigate("/messages"), badge: unread, tone: "alert" as const },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!isChat && <header
        className={cn(
          "fixed top-0 inset-x-0 z-30 safe-top px-4 pb-3 transition-transform duration-300 ease-out will-change-transform",
          headerHidden && "-translate-y-full",
          isReels
            ? "bg-gradient-to-b from-background via-background/70 to-transparent"
            : "bg-background/95 backdrop-blur-xl border-b border-border"
        )}
      >
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <button
            onClick={() => navigate("/")}
            className="shrink-0 press mb-1"
            aria-label="Chrónos — Início"
          >
            <img src={chronosLogo.url} alt="Chrónos" className="w-14 h-14 object-contain" />
          </button>

          <nav className="flex-1 flex items-end justify-center gap-1 sm:gap-3 min-w-0">
            {topItems.map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.key}
                  onClick={it.onClick}
                  className="relative flex flex-col items-center gap-1 px-1.5 sm:px-2.5 py-1 press text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={it.label}
                >
                  <span className="relative">
                    <Icon size={26} strokeWidth={2.2} />
                    <Badge count={it.badge} tone={it.tone} />
                  </span>
                  <span className="text-[11px] font-medium tracking-tight hidden xs:block sm:block">
                    {it.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {profile ? (
            <button
              onClick={() => navigate("/me")}
              aria-label="Meu perfil"
              className="shrink-0 rounded-full p-[2px] bg-primary/70 press mb-1"
            >
              <span className="block rounded-full border-2 border-background overflow-hidden">
                <UserAvatar
                  userId={profile.id}
                  fallbackUrl={profile.avatar_url}
                  fallbackName={profile.display_name}
                  size={38}
                />
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="shrink-0 mb-1 rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold press"
            >
              Entrar
            </button>
          )}
        </div>
      </header>}

      <main className={cn("flex-1", isChat ? "pt-0 pb-0" : "pt-[calc(env(safe-area-inset-top,0px)+5.25rem)] pb-28")}>
        <Outlet />
      </main>

      {user && <EarningsOnboarding />}

      {!isChat && <nav className={cn("fixed bottom-0 inset-x-0 z-30 safe-bottom bg-background/95 backdrop-blur-xl border-t border-border transition-transform duration-300 ease-out will-change-transform", navHidden && "translate-y-full")}>
        <div className="flex items-center justify-around max-w-2xl mx-auto h-[68px] px-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            if (t.primary) {
              return (
                <button
                  key={t.to}
                  onClick={() => requireAuth("/upload") && setOpenCreate(true)}
                  className="flex flex-col items-center justify-center gap-1 flex-1 h-full press"
                  aria-label="Criar"
                >
                  <div className="w-14 h-11 rounded-2xl bg-primary grid place-items-center">
                    <Icon size={26} strokeWidth={2.6} className="text-primary-foreground" />
                  </div>
                  <span className="text-[11px] font-semibold text-primary">Criar</span>
                </button>
              );
            }
            if (t.requiresAuth && !user) {
              return (
                <button
                  key={t.to}
                  onClick={() => requireAuth(t.to)}
                  className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-[11px] font-medium text-muted-foreground press"
                >
                  <Icon size={26} strokeWidth={2.2} />
                  <span>{t.label}</span>
                </button>
              );
            }
            return (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                onClick={(e) => {
                  if (t.to === "/" && location.pathname === "/") {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("home:refresh"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-1 flex-1 h-full text-[11px] font-medium transition-all duration-300 ease-out press",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={26}
                      strokeWidth={isActive ? 2.6 : 2.2}
                      active={isActive}
                      className={cn("transition-transform duration-300 ease-out", isActive && "scale-110")}
                    />
                    <span className={cn("transition-colors duration-300", isActive && "font-semibold text-primary")}>
                      {t.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>}

      <ChronosComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        initialMode={composerMode}
        onPublished={() => {
          if (location.pathname === "/") window.dispatchEvent(new CustomEvent("home:refresh"));
          else navigate("/");
        }}
      />

      {openCreate && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm grid place-items-end animate-fade-in"
          onClick={() => setOpenCreate(false)}
        >
          <div
            className="w-full max-w-xl mx-auto bg-card rounded-t-[28px] p-5 pb-10 space-y-2.5 border-t border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-secondary mx-auto mb-4" />
            <p className="text-sm font-bold text-muted-foreground mb-2 px-1">Criar</p>

            {[
              { mode: "text" as const, icon: Plus, title: "Publicação", sub: "Texto com fundo à tua escolha", accent: false },
              { mode: "video" as const, icon: Film, title: "Reel", sub: "Vídeo curto para o teu público", accent: true },
              { mode: "photo" as const, icon: ImageIcon, title: "Foto", sub: "Partilha uma imagem com legenda", accent: false },
            ].map((o) => {
              const Icon = o.icon;
              return (
                <button
                  key={o.mode}
                  onClick={() => {
                    setOpenCreate(false);
                    setComposerMode(o.mode);
                    setComposerOpen(true);
                  }}
                  className="w-full surface-raised p-4 flex items-center gap-4 text-left press"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl grid place-items-center shrink-0",
                      o.accent ? "bg-primary" : "bg-secondary"
                    )}
                  >
                    <Icon
                      size={24}
                      className={o.accent ? "text-primary-foreground" : "text-foreground"}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[15px]">{o.title}</p>
                    <p className="text-[13px] text-muted-foreground">{o.sub}</p>
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => {
                setOpenCreate(false);
                if (!requireAuth("/marketplace/new")) return;
                navigate("/marketplace/new");
              }}
              className="w-full surface-raised p-4 flex items-center gap-4 text-left press"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary grid place-items-center shrink-0">
                <Store size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-[15px]">Anúncio no Marketplace</p>
                <p className="text-[13px] text-muted-foreground">Vende produtos ou serviços</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
