import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function MarketplaceNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("marketplace_items")
        .insert({
          title: title.trim(),
          price_coins: parseInt(price, 10) || 0,
          seller_id: user.id,
          status: "active",
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Anúncio publicado");
      navigate(`/marketplace/${data.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Falha");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="font-display font-bold text-xl mb-4">Novo anúncio</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" required />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Preço (pts)" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" required />
        <button type="submit" disabled={busy} className="w-full rounded-2xl gradient-money text-primary-foreground font-bold py-3 disabled:opacity-50">Publicar</button>
      </form>
    </div>
  );
}
