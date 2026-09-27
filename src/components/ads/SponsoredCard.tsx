import { Link } from "react-router-dom";
import { SmartImage } from "@/components/SmartImage";

export type SponsoredAd = {
  id: string;
  target_type: string;
  target_id: string | null;
  headline: string | null;
  description: string | null;
  media_url: string | null;
  cta_type: string | null;
  cta_url: string | null;
  promoter_id: string | null;
};

export function SponsoredCard({ ad }: { ad: SponsoredAd }) {
  const href = ad.cta_url || (ad.target_id ? `/v/${ad.target_id}` : "#");
  const external = !!ad.cta_url && ad.cta_url.startsWith("http");

  const content = (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <div className="px-3 pt-2 pb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Patrocinado
        </span>
      </div>
      {ad.media_url && (
        <SmartImage src={ad.media_url} alt={ad.headline ?? "Anúncio"} aspect="video" className="w-full" />
      )}
      <div className="p-3 space-y-1">
        {ad.headline && <p className="font-semibold text-sm">{ad.headline}</p>}
        {ad.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>
        )}
        {ad.cta_type && (
          <span className="inline-block mt-2 text-xs font-bold text-primary">
            {ad.cta_type === "learn_more" ? "Saber mais" : ad.cta_type}
          </span>
        )}
      </div>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return <Link to={href}>{content}</Link>;
}
