import { UserAvatar } from "@/components/UserAvatar";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, Clock, UserPlus } from "@/lib/icons";
import { toast } from "sonner";

type Row = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  profile?: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
};

type Suggestion = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio?: string | null;
  score: number;
  reasons: string[];
};

const DISMISS_KEY = "chronos.friends.dismissed.v1";

function loadDismissed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
function saveDismissed(s: Set<string>) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(Array.from(s).slice(-400)));
  } catch {}
}

export default function Friends() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"friends" | "incoming" | "outgoing" | "suggestions">("friends");
  const [rows, setRows] = useState<Row[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSug, setLoadingSug] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const dismissed = useRef<Set<string>>(loadDismissed());

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    const safe = (data ?? []) as Row[];
    const otherIds = Array.from(
      new Set(safe.map((r) => (r.requester_id === user.id ? r.addressee_id : r.requester_id)))
    );
    let map = new Map<string, any>();
    if (otherIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", otherIds);
      map = new Map((profs ?? []).map((p) => [p.id, p]));
    }
    setRows(
      safe.map((r) => ({
        ...r,
        profile: map.get(r.requester_id === user.id ? r.addressee_id : r.requester_id) ?? null,
      }))
    );
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const loadSuggestions = useCallback(async () => {
    if (!user) return;
    setLoadingSug(true);
    try {
      const [{ data: myFs }, { data: me }, { data: followers }] = await Promise.all([
        supabase
          .from("friendships")
          .select("requester_id,addressee_id,status")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
        supabase.from("profiles").select("id,interests,country").eq("id", user.id).maybeSingle(),
        supabase.from("follows").select("follower_id").eq("following_id", user.id).limit(500),
      ]);

      const related = new Set<string>([user.id]);
      const friendIds: string[] = [];
      (myFs ?? []).forEach((f: any) => {
        const other = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        related.add(other);
        if (f.status === "accepted") friendIds.push(other);
      });

      const mutual = new Map<string, number>();
      if (friendIds.length) {
        const list = friendIds.slice(0, 100);
        const { data: fof } = await supabase
          .from("friendships")
          .select("requester_id,addressee_id,status")
          .eq("status", "accepted")
          .or(`requester_id.in.(${list.join(",")}),addressee_id.in.(${list.join(",")})`)
          .limit(1000);
        (fof ?? []).forEach((f: any) => {
          [f.requester_id, f.addressee_id].forEach((id: string) => {
            if (related.has(id)) return;
            mutual.set(id, (mutual.get(id) ?? 0) + 1);
          });
        });
      }

      const myInterests: string[] = ((me as any)?.interests ?? []) as string[];
      const myCountry: string | null = (me as any)?.country ?? null;
      const followerIds = new Set((followers ?? []).map((f: any) => f.follower_id));

      const candidateIds = Array.from(
        new Set([...mutual.keys(), ...Array.from(followerIds)])
      ).filter((id) => !related.has(id) && !dismissed.current.has(id));

      const pool = new Map<string, any>();
      if (candidateIds.length) {
        const { data } = await supabase
          .from("profiles")
          .select("id,username,display_name,avatar_url,bio,interests,country,followers_count")
          .in("id", candidateIds.slice(0, 120));
        (data ?? []).forEach((p: any) => pool.set(p.id, p));
      }
      if (pool.size < 20) {
        let q = supabase
          .from("profiles")
          .select("id,username,display_name,avatar_url,bio,interests,country,followers_count")
          .order("followers_count", { ascending: false })
          .limit(60);
        if (myCountry) q = q.eq("country", myCountry);
        const { data } = await q;
        (data ?? []).forEach((p: any) => {
          if (!related.has(p.id) && !dismissed.current.has(p.id)) pool.set(p.id, p);
        });
      }

      const scored: Suggestion[] = Array.from(pool.values())
        .filter((p) => !related.has(p.id) && !dismissed.current.has(p.id))
        .map((p: any) => {
          const reasons: string[] = [];
          let score = 0;
          const m = mutual.get(p.id) ?? 0;
          if (m > 0) {
            score += m * 5;
            reasons.push(`${m} amigo${m === 1 ? "" : "s"} em comum`);
          }
          const shared = (p.interests ?? []).filter((i: string) => myInterests.includes(i));
          if (shared.length) {
            score += shared.length * 2;
            reasons.push(`Interesses: ${shared.slice(0, 2).join(", ")}`);
          }
          if (followerIds.has(p.id)) {
            score += 3;
            reasons.push("Já te segue");
          }
          if (myCountry && p.country === myCountry) {
            score += 1;
            reasons.push("Perto de ti");
          }
          score += Math.min(2, (p.followers_count ?? 0) / 500);
          return {
            id: p.id,
            username: p.username,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            bio: p.bio,
            score,
            reasons,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 40);

      setSuggestions(scored);
    } finally {
      setLoadingSug(false);
    }
  }, [user]);

  useEffect(() => {
    if (tab === "suggestions" && suggestions.length === 0) loadSuggestions();
  }, [tab, suggestions.length, loadSuggestions]);

  const addFriend = async (id: string) => {
    if (!user) return;
    setSending(id);
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: id, status: "pending" });
    setSending(null);
    if (error) return toast.error(error.message);
    toast.success("Pedido de amizade enviado");
    setSuggestions((s) => s.filter((x) => x.id !== id));
    load();
  };

  const dismissSuggestion = (id: string) => {
    dismissed.current.add(id);
    saveDismissed(dismissed.current);
    setSuggestions((s) => s.filter((x) => x.id !== id));
  };

  const accept = async (id: string) => {
    const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Amizade aceite");
    load();
  };
  const reject = async (id: string) => {
    await supabase.from("friendships").update({ status: "rejected" }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    load();
  };

  const friends = rows.filter((r) => r.status === "accepted");
  const incoming = rows.filter((r) => r.status === "pending" && r.addressee_id === user?.id);
  const outgoing = rows.filter((r) => r.status === "pending" && r.requester_id === user?.id);
  const list = tab === "friends" ? friends : tab === "incoming" ? incoming : outgoing;

  return (
    <div className="px-4 py-4 max-w-xl mx-auto space-y-3 animate-fade-in">
      <h1 className="font-display font-bold text-2xl flex items-center gap-2">
        <Users className="w-6 h-6" /> Amigos
      </h1>

      <div className="grid grid-cols-4 gap-1.5 glass rounded-xl p-1">
        {(["friends", "incoming", "outgoing", "suggestions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[11px] font-semibold py-2 rounded-lg transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "friends"
              ? "Amigos"
              : t === "incoming"
                ? "Recebidos"
                : t === "outgoing"
                  ? "Enviados"
                  : "Sugestões"}
          </button>
        ))}
      </div>

      {tab === "suggestions" ? (
        <div className="space-y-2">
          {loadingSug && (
            <p className="text-sm text-muted-foreground text-center py-8">A carregar sugestões…</p>
          )}
          {!loadingSug && suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Sem sugestões por agora.</p>
          )}
          {suggestions.map((s) => (
            <div key={s.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <button onClick={() => navigate(`/u/${s.username}`)} className="shrink-0">
                <UserAvatar userId={s.id} fallbackUrl={s.avatar_url} fallbackName={s.display_name} size={44} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{s.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{s.username}</p>
                {s.reasons[0] && (
                  <p className="text-[11px] text-primary/80 truncate">{s.reasons[0]}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" disabled={sending === s.id} onClick={() => addFriend(s.id)}>
                  <UserPlus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
                <Button size="sm" variant="outline" onClick={() => dismissSuggestion(s.id)}>
                  <UserX className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Vazio por aqui.</p>
          )}
          {list.map((r) => (
            <div key={r.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <button
                onClick={() => r.profile && navigate(`/u/${r.profile.username}`)}
                className="shrink-0"
              >
                <UserAvatar
                  userId={r.profile?.id}
                  fallbackUrl={r.profile?.avatar_url}
                  fallbackName={r.profile?.display_name}
                  size={44}
                />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{r.profile?.display_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground truncate">@{r.profile?.username ?? "anon"}</p>
              </div>
              {tab === "incoming" && (
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => accept(r.id)}>
                    <UserCheck className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reject(r.id)}>
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {tab === "outgoing" && (
                <Button size="sm" variant="outline" onClick={() => remove(r.id)}>
                  <Clock className="w-4 h-4 mr-1" /> Cancelar
                </Button>
              )}
              {tab === "friends" && (
                <Button size="sm" variant="outline" onClick={() => remove(r.id)}>
                  Remover
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
