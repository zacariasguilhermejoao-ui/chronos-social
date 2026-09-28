import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "@/lib/icons";

export default function Marketplace() {
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("marketplace_items")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-extrabold text-xl">Marketplace</h1>
        <button onClick={() => navigate("/marketplace/new")} className="rounded-full gradient-money text-primary-foreground px-3 py-2 text-sm font-bold flex items-center gap-1">
          <Plus className="w-4 h-4" /> Vender
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <Link key={it.id} to={`/marketplace/${it.id}`} className="glass rounded-xl border border-border overflow-hidden press">
            {it.image_url && <img src={it.image_url} alt="" className="aspect-square object-cover w-full" />}
            <div className="p-2">
              <p className="text-sm font-semibold truncate">{it.title}</p>
              <p className="text-xs text-primary font-bold">{it.price_coins ?? it.price} pts</p>
            </div>
          </Link>
        ))}
      </div>
      {items.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">Sem anúncios</p>}
    </div>
  );
}
