import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MapPin, Eye } from "@/lib/icons";
import { SmartImage } from "@/components/SmartImage";

export const MARKET_CATEGORIES = [
  "Eletrónica",
  "Telemóveis",
  "Computadores",
  "Roupa",
  "Calçado",
  "Casa",
  "Beleza",
  "Veículos",
  "Imóveis",
  "Serviços",
  "Comida",
  "Música",
  "Outros",
];

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

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<Listing[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(120);
      setItems((data as Listing[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (cat !== "Todas" && it.category !== cat) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        if (
          !it.title.toLowerCase().includes(s) &&
          !(it.description ?? "").toLowerCase().includes(s) &&
          !(it.location ?? "").toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [items, q, cat]);

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto animate-fade-in pb-8">
      <div className="flex items-center gap-2 mb-3">
        <h1 className="font-display font-bold text-2xl flex-1">Marketplace</h1>
        <Button
          onClick={() => {
            if (!user) {
              navigate("/auth", { state: { from: "/marketplace/new" } });
              return;
            }
            navigate("/marketplace/new");
          }}
          size="sm"
          className="gradient-money text-primary-foreground gap-1"
        >
          <Plus className="w-4 h-4" /> Vender
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar produtos..."
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 no-scrollbar">
        {["Todas", ...MARKET_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              cat === c
                ? "gradient-money text-primary-foreground shadow-money"
                : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-12">A carregar...</p>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-semibold mb-1">Sem anúncios para já</p>
          <p className="text-xs text-muted-foreground mb-4">
            Sê o primeiro a publicar nesta categoria.
          </p>
          {user && (
            <Button
              onClick={() => navigate("/marketplace/new")}
              className="gradient-money text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" /> Publicar produto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((it) => (
            <Link
              to={`/marketplace/${it.id}`}
              key={it.id}
              className="glass rounded-2xl overflow-hidden group"
            >
              <SmartImage
                src={it.photos?.[0]}
                alt={it.title}
                aspect="square"
                className="w-full"
                imgClassName="group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-2.5 space-y-1">
                <p className="font-display font-bold text-money text-sm tabular truncate">
                  {fmtKz(it.price_kz)}
                </p>
                <p className="text-xs font-medium line-clamp-1">{it.title}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {it.location && (
                    <>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{it.location}</span>
                    </>
                  )}
                  <span className="ml-auto flex items-center gap-0.5">
                    <Eye className="w-3 h-3" /> {it.views_count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
