import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Pages() {
  const { user } = useAuth();
  const [pages, setPages] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase.from("pages").select("*").eq("owner_id", user.id).then(({ data }) => setPages(data ?? []));
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
      <h1 className="font-display font-bold text-xl">As tuas páginas</h1>
      {pages.map((p) => (
        <Link key={p.id} to={`/p/${p.handle}`} className="block glass rounded-xl border border-border p-3 press">
          <p className="font-semibold">{p.name}</p>
          <p className="text-xs text-muted-foreground">@{p.handle}</p>
        </Link>
      ))}
      {pages.length === 0 && <p className="text-sm text-muted-foreground">Ainda não tens páginas</p>}
    </div>
  );
}
