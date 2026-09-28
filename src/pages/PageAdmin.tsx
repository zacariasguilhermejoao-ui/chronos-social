import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function PageAdmin() {
  const { handle } = useParams();
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    if (!handle) return;
    supabase.from("pages").select("*").eq("handle", handle).maybeSingle().then(({ data }) => setPage(data));
  }, [handle]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display font-bold text-xl">Admin · {page?.name ?? handle}</h1>
      <p className="text-sm text-muted-foreground mt-2">Gere publicações, anúncios e estatísticas desta página.</p>
    </div>
  );
}
