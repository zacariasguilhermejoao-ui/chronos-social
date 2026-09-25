import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Accessibility,
  Coins,
  Megaphone,
  HelpCircle,
  FileText,
  ChevronRight,
  LogOut,
} from "@/lib/icons";
import { signOut } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

type Item = { to: string; icon: any; label: string; desc: string; auth?: boolean; accent?: boolean };

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Conta",
    items: [
      { to: "/settings/account", icon: User, label: "Conta", desc: "Perfil, email, telefone, password", auth: true },
      { to: "/settings/privacy", icon: Lock, label: "Privacidade", desc: "Conta privada, mensagens, bloqueios", auth: true },
      { to: "/settings/security", icon: Shield, label: "Segurança", desc: "Password e sessões", auth: true },
    ],
  },
  {
    title: "Experiência",
    items: [
      { to: "/settings/notifications", icon: Bell, label: "Notificações", desc: "Likes, comentários, mensagens" },
      { to: "/settings/appearance", icon: Palette, label: "Aparência", desc: "Tema claro, escuro ou automático" },
      { to: "/settings/accessibility", icon: Accessibility, label: "Acessibilidade", desc: "Texto, contraste, movimento" },
    ],
  },
  {
    title: "Criadores",
    items: [
      { to: "/settings/monetization", icon: Coins, label: "Monetização", desc: "Mensagens premium e ganhos", auth: true, accent: true },
      { to: "/ads", icon: Megaphone, label: "Anúncios", desc: "Cria e acompanha as tuas campanhas", auth: true, accent: true },
    ],
  },
  {
    title: "Sobre",
    items: [
      { to: "/settings/help", icon: HelpCircle, label: "Ajuda & Suporte", desc: "FAQ e contacto" },
      { to: "/child-safety", icon: Shield, label: "Segurança Infantil", desc: "Child Safety Standards" },
      { to: "/legal", icon: FileText, label: "Termos e Políticas", desc: "Termos, privacidade, comunidade" },
    ],
  },
];

export default function Settings() {
  const { user } = useAuth();
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
        <h1 className="font-display font-bold text-2xl flex-1">Configurações</h1>
        <ThemeToggle />
      </div>

      <div className="space-y-5">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">{g.title}</h2>
            <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
              {g.items.map((item) => {
                const Icon = item.icon;
                const onClick = () => {
                  if (item.auth && !user) {
                    navigate("/auth", { state: { from: item.to } });
                  } else {
                    navigate(item.to);
                  }
                };
                return (
                  <button
                    key={item.to}
                    onClick={onClick}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/40 transition-colors press"
                  >
                    <div
                      className={
                        "w-10 h-10 rounded-2xl grid place-items-center shrink-0 " +
                        (item.accent ? "bg-primary/15 text-primary" : "bg-secondary/60 text-foreground")
                      }
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px]">{item.label}</p>
                      <p className="text-[13px] text-muted-foreground truncate">{item.desc}</p>
                    </div>
                    <ChevronRight size={18} strokeWidth={2.2} className="text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {user && (
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors font-semibold text-[15px]"
          >
            <LogOut className="w-4 h-4" /> Terminar sessão
          </button>
        )}

        <p className="text-center text-xs text-muted-foreground pt-2">
          Chrónos · v1.0 · <Link to="/legal" className="underline">Termos & Políticas</Link>
        </p>
      </div>
    </div>
  );
}
