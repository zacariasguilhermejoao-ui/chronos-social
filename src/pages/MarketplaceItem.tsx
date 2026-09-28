import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function MarketplaceItem() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("marketplace_items").select("*").eq("id", id).maybeSingle().then(({ data }) => setItem(data));
  }, [id]);

  if (!item) return <div className="p-8 text-center text-muted-foreground">A carregar…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
      {item.image_url && <img src={item.image_url} alt="" className="w-full rounded-2xl aspect-square object-cover" />}
      <h1 className="font-display font-bold text-xl">{item.title}</h1>
      <p className="text-primary font-bold text-lg">{item.price_coins ?? item.price} pts</p>
      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
    </div>
  );
}
