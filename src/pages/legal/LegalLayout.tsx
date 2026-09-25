import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate("/legal")}
          className="w-9 h-9 rounded-full glass grid place-items-center"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-xl">{title}</h1>
      </div>
      {updated && (
        <p className="text-xs text-muted-foreground mb-4">Última atualização: {updated}</p>
      )}
      <article className="glass rounded-2xl p-5 space-y-4 text-sm leading-relaxed">{children}</article>
      <p className="text-center text-xs text-muted-foreground mt-6">
        <Link to="/legal" className="underline">Voltar ao índice</Link>
      </p>
    </div>
  );
}

export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="font-display font-bold text-base mt-2">{children}</h2>
);
export const P = ({ children }: { children: ReactNode }) => (
  <p className="text-muted-foreground">{children}</p>
);
export const UL = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc list-inside space-y-1 text-muted-foreground">{children}</ul>
);
