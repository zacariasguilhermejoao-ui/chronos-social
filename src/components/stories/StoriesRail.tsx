import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "@/lib/icons";
import { StoryViewer } from "./StoryViewer";
import { StoryCreate } from "./StoryCreate";

type Entry = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  has_unseen: boolean;
  count: number;
  latest_at?: string;
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `há ${Math.max(1, Math.floor(diff / 60_000))} min`;
  if (h < 24) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} d`;
}

export function StoriesRail() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any).rpc("stories_rail").maybeSingle?.() ?? { data: null };
    if (Array.isArray(data)) {
      setEntries(data as Entry[]);
      return;
    }
    const { data: stories } = await supabase
      .from("stories")
      .select("user_id, created_at, media_url")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(50);
    if (!stories?.length) { setEntries([]); return; }
    const byUser = new Map<string, Entry>();
    for (const s of stories as any[]) {
      if (!byUser.has(s.user_id)) {
        byUser.set(s.user_id, {
          user_id: s.user_id,
          username: null,
          display_name: null,
          avatar_url: null,
          has_unseen: true,
          count: 1,
          latest_at: s.created_at,
        });
      } else {
        byUser.get(s.user_id)!.count += 1;
      }
    }
    const ids = [...byUser.keys()];
    const { data: profs } = await supabase.from("profiles").select("id,username,display_name,avatar_url").in("id", ids);
    for (const p of (profs ?? []) as any[]) {
      const e = byUser.get(p.id);
      if (e) {
        e.username = p.username;
        e.display_name = p.display_name;
        e.avatar_url = p.avatar_url;
      }
    }
    setEntries([...byUser.values()]);
  };

  useEffect(() => { load(); }, [user?.id]);

  return (
    <>
      <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 snap-x snap-mandatory">
          {user && (
            <button
              onClick={() => setCreating(true)}
              className="relative shrink-0 snap-start w-[31%] min-w-[112px] aspect-[3/4.4] rounded-[22px] overflow-hidden border border-border bg-card press text-left"
            >
              <div className="absolute inset-0 bg-secondary" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <span className="w-11 h-11 rounded-full bg-primary grid place-items-center mb-2">
                  <Plus size={22} className="text-primary-foreground" strokeWidth={3} />
                </span>
                <p className="text-[14px] font-bold leading-tight">A tua história</p>
              </div>
            </button>
          )}
          {entries.map((e) => (
            <button
              key={e.user_id}
              onClick={() => setOpenUser(e.user_id)}
              className="relative shrink-0 snap-start w-[31%] min-w-[112px] aspect-[3/4.4] rounded-[22px] overflow-hidden border border-border bg-card press text-left"
            >
              {e.avatar_url ? (
                <img src={e.avatar_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-secondary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 flex items-center gap-2">
                <span className={`p-[2px] rounded-full ${e.has_unseen ? "bg-primary" : "bg-border"}`}>
                  <span className="block w-7 h-7 rounded-full overflow-hidden border-2 border-background bg-secondary">
                    {e.avatar_url ? <img src={e.avatar_url} alt="" className="w-full h-full object-cover" /> : null}
                  </span>
                </span>
                <span className="min-w-0">
                  <p className="text-[13px] font-bold leading-tight truncate">{e.display_name ?? e.username ?? ""}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{timeAgo(e.latest_at)}</p>
                </span>
              </div>
            </button>
          ))}
          {entries.length === 0 && !user && (
            <p className="text-[15px] text-muted-foreground py-6 px-1">Sem histórias por agora</p>
          )}
        </div>
      </div>
      {openUser && (
        <StoryViewer
          userId={openUser}
          users={entries.map((e) => e.user_id)}
          onChangeUser={(id) => setOpenUser(id)}
          onClose={() => { setOpenUser(null); load(); }}
        />
      )}
      {creating && <StoryCreate onClose={() => { setCreating(false); load(); }} />}
    </>
  );
}
