import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Eye, MessageCircle, Trash2, Check } from "@/lib/icons";
import { UserAvatar } from "@/components/UserAvatar";
import { SmartImage } from "@/components/SmartImage";
import { toast } from "sonner";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price_kz: number;
  category: string;
  location: string | null;
  photos: string[];
  status: string;
  views_count: number;
  created_at: string;
};

const fmtKz = (n: number) =>
  n.toLocaleString("pt-PT", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " Kz";

export default function MarketplaceItem() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!data) {
        toast.error("Anúncio não encontrado");
        navigate("/marketplace");
        return;
      }
      setItem(data as Listing);
      const { data: prof } = await supabase
        .from("profiles")
        .select("id,username,display_name,avatar_url")
        .eq("id", (data as Listing).user_id)
        .maybeSingle();
      setSeller(prof);
      if (user?.id !== (data as Listing).user_id) {
        supabase.rpc("marketplace_increment_view", { p_listing_id: id });
      }
    })();
  }, [id, user?.id, navigate]);

  const isOwner = user?.id && item?.user_id === user.id;

  const contactSeller = async () => {
    if (!user) {
      navigate("/auth", { state: { from: `/marketplace/${id}` } });
      return;
    }
    if (!seller || isOwner) return;
    const a = user.id < seller.id ? user.id : seller.id;
    const b = user.id < seller.id ? seller.id : user.id;
    const { data: existing } = await supabase
      .from("message_threads")
      .select("id")
      .eq("user_a", a)
      .eq("user_b", b)
      .maybeSingle();
    let threadId = existing?.id;
    if (!threadId) {
      const { data: created, error } = await supabase
        .from("message_threads")
        .insert({ user_a: a, user_b: b })
        .select("id")
        .single();
      if (error) {
        toast.error("Falha a abrir conversa");
        return;
      }
      threadId = created.id;
    }
    await supabase.from("messages").insert({
      thread_id: threadId,
      sender_id: user.id,
      receiver_id: seller.id,
      content: `Olá! Tenho interesse no anúncio: ${item?.title} (${fmtKz(item?.price_kz ?? 0)})`,
      type: "text",
    });
    navigate(`/messages/${threadId}`);
  };

  const setStatus = async (status: "sold" | "removed" | "active") => {
    if (!item) return;
    setBusy(true);
    const { error } = await supabase.rpc("marketplace_set_status", {
      p_listing_id: item.id,
      p_status: status,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (status === "removed") {
      toast.success("Anúncio removido");
      navigate("/marketplace");
    } else {
      toast.success(status === "sold" ? "Marcado como vendido" : "Anúncio ativo");
      setItem({ ...item, status });
    }
  };

  if (!item) {
    return <p className="text-center text-sm text-muted-foreground py-12">A carregar...</p>;
  }

  return (
    <div className="max-w-xl mx-auto pb-24 animate-fade-in">
      <div className="sticky top-14 z-10 px-3 py-2 glass border-b border-border flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <p className="font-display font-bold truncate flex-1">{item.title}</p>
      </div>

      <div className="relative">
        <SmartImage
          src={item.photos[activePhoto]}
          alt={item.title}
          aspect="square"
          className="w-full"
          eager
        />
        {item.status !== "active" && (
          <div className="absolute inset-0 bg-background/70 grid place-items-center">
            <span className="px-4 py-1.5 rounded-full bg-destructive text-destructive-foreground font-display font-bold uppercase text-sm">
              {item.status === "sold" ? "Vendido" : "Removido"}
            </span>
          </div>
        )}
      </div>

      {item.photos.length > 1 && (
        <div className="flex gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
          {item.photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setActivePhoto(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                activePhoto === i ? "border-primary" : "border-transparent"
              }`}
            >
              <SmartImage src={p} alt={`${i + 1}`} className="w-full h-full" />
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        <div>
          <p className="font-display font-bold text-3xl text-money tabular">{fmtKz(item.price_kz)}</p>
          <h1 className="font-display font-bold text-xl mt-1">{item.title}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="px-2 py-0.5 rounded-full bg-secondary">{item.category}</span>
            {item.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {item.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {item.views_count}
            </span>
          </div>
        </div>

        {item.description && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.description}</p>
        )}

        {seller && (
          <div className="glass rounded-2xl p-3 flex items-center gap-3">
            <UserAvatar
              userId={seller.id}
              fallbackUrl={seller.avatar_url}
              fallbackName={seller.display_name}
              size={44}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Vendedor</p>
              <button
                onClick={() => navigate(`/u/${seller.username}`)}
                className="font-semibold text-sm text-left truncate"
              >
                {seller.display_name}
              </button>
              <p className="text-[11px] text-muted-foreground">@{seller.username}</p>
            </div>
          </div>
        )}

        {isOwner ? (
          <div className="grid grid-cols-2 gap-2">
            {item.status === "active" ? (
              <Button onClick={() => setStatus("sold")} disabled={busy} className="bg-money text-primary-foreground">
                <Check className="w-4 h-4 mr-1" /> Vendido
              </Button>
            ) : (
              <Button onClick={() => setStatus("active")} disabled={busy} variant="outline">
                Reativar
              </Button>
            )}
            <Button
              onClick={() => setStatus("removed")}
              disabled={busy}
              variant="outline"
              className="text-destructive border-destructive/30"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Apagar
            </Button>
          </div>
        ) : (
          item.status === "active" && (
            <Button
              onClick={contactSeller}
              className="w-full h-12 gradient-money text-primary-foreground font-display font-bold"
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Contactar vendedor
            </Button>
          )
        )}
      </div>
    </div>
  );
}
