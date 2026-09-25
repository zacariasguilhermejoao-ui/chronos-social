import { ArrowLeft, FileText, Shield, Image, Coins, Users, ChevronRight, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const docs = [
  { to: "/child-safety", icon: ShieldAlert, label: "Segurança Infantil", desc: "Child Safety Standards — CSAE/CSAM", highlight: true },
  { to: "/legal/terms", icon: FileText, label: "Termos de Uso", desc: "Regras gerais de utilização" },
  { to: "/legal/privacy", icon: Shield, label: "Política de Privacidade", desc: "Como tratamos os teus dados" },
  { to: "/legal/content", icon: Image, label: "Política de Conteúdo", desc: "O que é permitido publicar" },
  { to: "/legal/monetization", icon: Coins, label: "Política de Monetização", desc: "Como funcionam os ganhos" },
  { to: "/legal/community", icon: Users, label: "Política de Comunidade", desc: "Princípios da comunidade" },
];

export default function LegalIndex() {
  const navigate = useNavigate();
  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full glass grid place-items-center"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-xl">Termos & Políticas</h1>
      </div>

      <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
        {docs.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.to}
              onClick={() => navigate(d.to)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/40 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
                style={
                  d.highlight
                    ? { background: "#15F59D22", color: "#15F59D" }
                    : undefined
                }
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{d.label}</p>
                <p className="text-xs text-muted-foreground truncate">{d.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
