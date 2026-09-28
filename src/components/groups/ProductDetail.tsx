import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, X, Star } from "@/lib/icons";
import { toast } from "sonner";
import type { ProductRow } from "./ProductEditor";

function money(v: number, currency = "Kz") {
  return `${v.toLocaleString("pt-PT", { maximumFractionDigits: 2 })} ${currency}`;
}

export function ProductDetail({
  product,
  groupId,
  onClose,
}: {
  product: ProductRow;
  groupId: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [fav, setFav] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    (async () => {
      if (user) {
        const { data } = await supabase
          .from("group_product_favorites")
          .select("id")
          .eq("product_id", product.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setFav(!!data);
      }
      const { data: rev } = await supabase
        .from("group_product_reviews")
        .select("id,user_id,rating,comment,created_at")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false })
        .limit(30);
      setReviews(rev ?? []);
      const mine = (rev ?? []).find((r: any) => r.user_id === user?.id);
      if (mine) {
        setMyRating(mine.rating);
        setMyComment(mine.comment ?? "");
      }
      await supabase.from("group_products").update({ views_count: (product.views_count ?? 0) + 1 }).eq("id", product.id);
    })();
  }, [product.id, user]);

  const toggleFav = async () => {
    if (!user) return;
    if (fav) {
      await supabase.from("group_product_favorites").delete().eq("product_id", product.id).eq("user_id", user.id);
      setFav(false);
    } else {
      await supabase.from("group_product_favorites").insert({ product_id: product.id, user_id: user.id });
      setFav(true);
    }
  };

  const submitReview = async () => {
    if (!user || myRating < 1) return;
    const { error } = await supabase.from("group_product_reviews").upsert({
      product_id: product.id,
      user_id: user.id,
      rating: myRating,
      comment: myComment.trim() || null,
    });
    if (error) toast.error("Falha ao avaliar");
    else toast.success("Avaliação guardada");
  };

  const imgs = product.image_urls?.length ? product.image_urls : [];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        <header className="flex items-center justify-between p-3 sticky top-0 bg-background/90 backdrop-blur z-10">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-secondary grid place-items-center">
            <X className="w-5 h-5" />
          </button>
          <button onClick={toggleFav} className="w-10 h-10 rounded-full bg-secondary grid place-items-center">
            <Heart className={fav ? "w-5 h-5 fill-destructive text-destructive" : "w-5 h-5"} />
          </button>
        </header>
        {imgs[0] && <img src={imgs[0]} alt="" className="w-full aspect-square object-cover" />}
        <div className="p-4 space-y-3">
          <h1 className="font-display font-bold text-xl">{product.name}</h1>
          <p className="text-primary font-bold text-lg">{money(product.price, product.currency || "Kz")}</p>
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

          <div className="border-t border-border pt-3">
            <h2 className="font-semibold text-sm mb-2">Avaliações</h2>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setMyRating(n)}>
                  <Star className={n <= myRating ? "w-5 h-5 fill-warning text-warning" : "w-5 h-5 text-muted-foreground"} />
                </button>
              ))}
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Comentário (opcional)"
              className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm mb-2"
            />
            <button onClick={submitReview} className="rounded-full gradient-money text-primary-foreground px-4 py-2 text-sm font-bold">
              Enviar
            </button>
            <div className="mt-3 space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="text-sm glass rounded-xl p-2 border border-border">
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                    ))}
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
