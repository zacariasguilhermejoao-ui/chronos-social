import { ReactNode } from "react";
import { ArrowLeft } from "@/lib/icons";
import { useNavigate } from "react-router-dom";

export function SettingsPage({ title, children, backTo }: { title: string; children: ReactNode; backTo?: string }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => backTo ? navigate(backTo) : navigate("/settings")}
          className="w-9 h-9 rounded-full glass grid place-items-center"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-xl">{title}</h1>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Section({ title, children, desc }: { title?: string; desc?: string; children: ReactNode }) {
  return (
    <section>
      {title && <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">{title}</h2>}
      {desc && <p className="text-xs text-muted-foreground px-1 mb-2">{desc}</p>}
      <div className="glass rounded-2xl divide-y divide-border overflow-hidden">{children}</div>
    </section>
  );
}

export function Row({
  label,
  desc,
  right,
  onClick,
  destructive,
}: {
  label: string;
  desc?: string;
  right?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  const Cmp = onClick ? "button" : "div";
  return (
    <Cmp
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 text-left ${onClick ? "hover:bg-secondary/40 transition-colors" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${destructive ? "text-destructive" : ""}`}>{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </Cmp>
  );
}
