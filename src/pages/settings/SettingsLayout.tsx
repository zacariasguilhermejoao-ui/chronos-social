import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "@/lib/icons";

export function SettingsPage({ title, backTo, children }: { title: string; backTo?: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => (backTo ? navigate(backTo) : navigate(-1))} className="w-9 h-9 rounded-full bg-secondary grid place-items-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-xl">{title}</h1>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">{title}</h2>
      <div className="glass rounded-2xl border border-border overflow-hidden divide-y divide-border">{children}</div>
    </section>
  );
}

export function Row({ label, desc, onClick }: { label: string; desc?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 text-left press hover:bg-secondary/30">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}
