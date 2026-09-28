import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function PageView() {
  const { handle } = useParams();
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    if (!handle) return;
    supabase.from("pages").select("*").eq("handle", handle).maybeSingle().then(({ data }) => setPage(data));
  }, [handle]);

  if (!page) return <div className="p-8 text-center text-muted-foreground">A carregar…</div>;

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="h-32 bg-secondary">{page.cover_url && <img src={page.cover_url} alt="" className="w-full h-full object-cover" />}</div>
      <div className="px-4 -mt-8">
        {page.avatar_url && <img src={page.avatar_url} alt="" className="w-20 h-20 rounded-2xl border-4 border-background object-cover" />}
        <h1 className="mt-2 font-display font-bold text-xl">{page.name}</h1>
        <p className="text-sm text-muted-foreground">@{page.handle}</p>
        {page.description && <p className="mt-2 text-sm">{page.description}</p>}
      </div>
    </div>
  );
}
