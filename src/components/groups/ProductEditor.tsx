import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X } from "@/lib/icons";

export type ProductRow = {
  id: string;
  group_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_urls: string[] | null;
  stock: number | null;
  views_count: number;
  category?: string | null;
  shipping?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  location?: string | null;
};

export function ProductEditor({
  groupId,
  product,
  onClose,
  onSaved,
}: {
  groupId: string;
  product?: ProductRow | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!user || !name.trim()) return;
    setBusy(true);
    try {
      const row = {
        group_id: groupId,
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price) || 0,
        currency: "Kz",
      };
      if (product?.id) {
        const { error } = await supabase.from("group_products").update(row).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("group_products").insert(row);
        if (error) throw error;
      }
      toast.success("Produto guardado");
      onSaved?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Falha ao guardar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-card rounded-t-[28px] border-t border-border p-5 max-h-[85dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">{product ? "Editar produto" : "Novo produto"}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm min-h-[80px]" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Preço (Kz)" className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm" />
          <button onClick={save} disabled={busy} className="w-full rounded-2xl gradient-money text-primary-foreground font-bold py-3 disabled:opacity-50">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
