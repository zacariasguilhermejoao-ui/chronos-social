export type SponsoredAd = {
  id: string;
  target_type?: string;
  target_id?: string;
  headline?: string | null;
  description?: string | null;
  media_url?: string | null;
  cta_type?: string | null;
  cta_url?: string | null;
  promoter_id?: string;
};

export function SponsoredCard({ ad }: { ad: SponsoredAd }) {
  return (
    <article className="glass rounded-2xl border border-border overflow-hidden">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-2">Patrocinado</p>
      {ad.media_url && <img src={ad.media_url} alt="" className="w-full aspect-video object-cover" />}
      <div className="p-3">
        {ad.headline && <p className="font-semibold text-sm">{ad.headline}</p>}
        {ad.description && <p className="text-xs text-muted-foreground mt-1">{ad.description}</p>}
        {ad.cta_url && (
          <a href={ad.cta_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 rounded-full gradient-money text-primary-foreground text-xs font-bold px-4 py-1.5">
            Saber mais
          </a>
        )}
      </div>
    </article>
  );
}
