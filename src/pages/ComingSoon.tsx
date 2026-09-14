import { ArrowLeft } from "@/lib/icons";
import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  subtitle?: string;
  bullets?: string[];
};

export function ComingSoonPage({ title, subtitle, bullets = [] }: Props) {
  const navigate = useNavigate();
  return (
    <div className="min-h-[100dvh] px-4 pt-3 pb-24 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-full bg-secondary grid place-items-center mb-4"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="rounded-2xl border border-border bg-card p-6">
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wide">
          Em breve
        </span>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}

        {bullets.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary shrink-0">•</span>
                <span className="text-foreground/90">{b}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Esta funcionalidade está a ser preparada. Vais receber uma notificação assim que estiver disponível.
        </p>
      </div>
    </div>
  );
}

export default function ComingSoon() {
  return <ComingSoonPage title="Em breve" subtitle="Esta secção estará disponível em breve." />;
}
