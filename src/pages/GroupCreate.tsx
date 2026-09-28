import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function GroupCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert({ name: name.trim(), description: description.trim() || null, owner_id: user.id })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id, role: "owner" });
      toast.success("Grupo criado");
      navigate(`/groups/${data.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Falha ao criar grupo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="font-display font-bold text-xl mb-4">Novo grupo</h1>
      <form onSubmit={create} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do grupo"
          className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          className="w-full rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none min-h-[80px]"
        />
        <button type="submit" disabled={busy} className="w-full rounded-2xl gradient-money text-primary-foreground font-bold py-3 disabled:opacity-50">
          Criar grupo
        </button>
      </form>
    </div>
  );
}
