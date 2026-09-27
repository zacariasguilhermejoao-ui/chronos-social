import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Eye, Heart, MoreHorizontal, Copy, Send, Report, Stats } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { PostStatsSheet } from "@/components/stats/PostStatsSheet";
import { ActionSheet, type SheetAction } from "@/components/ActionSheet";
import { VideoThumb } from "@/components/VideoThumb";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";

export type InlineReelData = {
  id: string;
  user_id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  views_count: number;
  likes_count: number;
  profile?: { username: string; display_name: string; avatar_url: string | null } | null;
};

function InlineReelImpl({ reel }: { reel: InlineReelData }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const { user } = useAuth();
  const isOwner = user?.id === reel.user_id;

  const open = () => navigate(`/reels?start=${reel.id}`);
  const url = `${window.location.origin}/v/${reel.id}`;
  const menuActions: SheetAction[] = [
    ...(isOwner
      ? [{
          key: "stats",
          label: "Ver estatísticas",
          icon: <Stats className="w-5 h-5" />,
          onSelect: () => setStatsOpen(true),
        } as SheetAction]
      : []),
    {
      key: "share",
      label: "Partilhar",
      icon: <Send className="w-5 h-5" />,
      onSelect: async () => {
        try {
          if (navigator.share) await navigator.share({ url, title: reel.title });
          else await navigator.clipboard.writeText(url);
        } catch {}
      },
    },
    {
      key: "copy",
      label: "Copiar link",
      icon: <Copy className="w-5 h-5" />,
      onSelect: async () => {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado");
      },
    },
    {
      key: "report",
      label: "Denunciar",
      icon: <Report className="w-5 h-5" />,
      onSelect: () => { toast.success("Denúncia enviada para revisão"); },
    },
  ];

  return (
    <article className="glass feed-item sm:rounded-2xl border-y sm:border border-border overflow-hidden">
      <header className="flex items-center justify-between px-3.5 py-2.5">
        <button
          onClick={() => reel.profile && navigate(`/u/${reel.profile.username}`)}
          className="flex items-center gap-3 min-w-0"
        >
          <UserAvatar
            userId={reel.user_id}
            fallbackUrl={reel.profile?.avatar_url}
            fallbackName={reel.profile?.display_name}
            size={36}
          />
          <div className="min-w-0 text-left">
            <p className="font-semibold text-sm truncate">{reel.profile?.display_name ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate">@{reel.profile?.username ?? "anon"}</p>
          </div>
        </button>
        <button onClick={() => setMenuOpen(true)} className="p-2 -mr-1 text-muted-foreground press" aria-label="Mais opções">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      <button
        onClick={open}
        aria-label={`Abrir Reel: ${reel.title}`}
        className="relative w-full bg-black overflow-hidden block"
        style={{ aspectRatio: "4 / 5", maxHeight: "72vh" }}
      >
        <VideoThumb
          src={reel.video_url}
          poster={reel.thumbnail_url}
          alt={reel.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-[12px] font-bold text-white">
          <Play className="w-3.5 h-3.5" /> Reel
        </span>
        <span className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="w-16 h-16 rounded-full bg-black/50 backdrop-blur grid place-items-center text-white">
            <Play className="w-8 h-8" />
          </span>
        </span>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <p className="text-[16px] font-bold line-clamp-2 flex-1 text-left pr-3 drop-shadow">
            {reel.title}
          </p>
          <div className="flex flex-col items-end gap-1 text-[12px] font-mono tabular shrink-0">
            <span className="flex items-center gap-1 bg-black/45 rounded-full px-2 py-0.5">
              <Eye className="w-3.5 h-3.5" /> {reel.views_count ?? 0}
            </span>
            <span className="flex items-center gap-1 bg-black/45 rounded-full px-2 py-0.5">
              <Heart className="w-3.5 h-3.5" /> {reel.likes_count ?? 0}
            </span>
          </div>
        </div>
      </button>

      <ActionSheet open={menuOpen} onOpenChange={setMenuOpen} actions={menuActions} />
      <PostStatsSheet
        open={statsOpen}
        onOpenChange={setStatsOpen}
        kind="video"
        id={reel.id}
        fallback={{ views: reel.views_count, likes: reel.likes_count }}
      />
    </article>
  );
}

export const InlineReel = memo(InlineReelImpl, (a, b) => a.reel.id === b.reel.id);
