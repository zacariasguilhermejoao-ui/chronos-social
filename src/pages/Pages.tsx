import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Users, ChevronRight } from "@/lib/icons";

type Row = {
  id: string;
  handle: string;
  name: string;
  avatar_url: string | null;
  cover_url: string | null;
  followers_count: number;
  category: string | null;
};

export default function Pages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("pages")
      .select("id, handle, name, avatar_url, cover_url, followers_count, category")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as any) ?? []));
  }, [user?.id]);

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-3 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 grid place-items-center rounded-full hover:bg-secondary/60"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg leading-tight flex-1 truncate">Minhas Páginas</h1>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {rows === null && (
          <p className="text-sm text-muted-foreground text-center py-10">A carregar…</p>
        )}

        {rows && rows.length === 0 && (
          <div className="text-center py-12 glass rounded-2xl border border-border">
            <p className="font-semibold">Ainda não tens páginas</p>
            <p className="text-xs text-muted-foreground mt-1">
              As páginas que administras aparecem aqui.
            </p>
          </div>
        )}

        {rows?.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => navigate(`/p/${p.handle}/admin`)}
            className="w-full text-left glass rounded-2xl border border-border overflow-hidden active:scale-[0.99] transition-transform"
          >
            {p.cover_url && (
              <div className="h-20 w-full bg-secondary/40">
                <img src={p.cover_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-secondary overflow-hidden shrink-0">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center font-display font-bold text-lg">
                    {p.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {p.category || "Sem categoria"}
                </p>
                <p className="text-xs text-muted-foreground truncate inline-flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3" />
                  {p.followers_count} seguidores
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
