import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function GroupCatalog() {
  const { id } = useParams();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from("group_products").select("*").eq("group_id", id).order("created_at", { ascending: false }).then(({ data }) => setProducts(data ?? []));
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <h1 className="font-display font-bold text-xl mb-4">Catálogo</h1>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p.id} className="glass rounded-xl border border-border p-3">
            <p className="font-semibold text-sm truncate">{p.name}</p>
            <p className="text-xs text-primary font-bold">{p.price_coins ?? 0} pts</p>
          </div>
        ))}
      </div>
      {products.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sem produtos</p>}
    </div>
  );
}
