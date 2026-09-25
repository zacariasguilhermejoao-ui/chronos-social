import { SettingsPage, Section } from "./SettingsLayout";
import { Sun, Moon, Monitor, Check } from "@/lib/icons";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeChoice; label: string; desc: string; icon: any }[] = [
  { value: "light", label: "Claro", desc: "Fundo claro, texto escuro", icon: Sun },
  { value: "dark", label: "Escuro", desc: "Fundo escuro, texto suave", icon: Moon },
  { value: "system", label: "Automático", desc: "Segue as definições do dispositivo", icon: Monitor },
];

function Preview({ mode }: { mode: "light" | "dark" }) {
  const light = mode === "light";
  return (
    <div
      className="w-full rounded-2xl border p-3 space-y-2"
      style={{
        background: light ? "#FAFAFA" : "#090909",
        borderColor: light ? "#E3E3E3" : "#262626",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full" style={{ background: light ? "#0F9B6C" : "#15F59D" }} />
        <div className="flex-1 space-y-1">
          <div className="h-2 rounded-full w-1/2" style={{ background: light ? "#1A1A1A" : "#FFFFFF" }} />
          <div className="h-2 rounded-full w-1/3" style={{ background: light ? "#B9B9B9" : "#4A4A4A" }} />
        </div>
      </div>
      <div
        className="h-12 rounded-xl border"
        style={{
          background: light ? "#FFFFFF" : "#151515",
          borderColor: light ? "#E8E8E8" : "#242424",
        }}
      />
    </div>
  );
}

export default function AppearanceSettings() {
  const { theme, resolved, setTheme } = useTheme();

  return (
    <SettingsPage title="Aparência">
      <Section title="Tema" desc="A escolha é guardada no dispositivo e na tua conta Chrónos.">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const selected = theme === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setTheme(o.value)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
              aria-pressed={selected}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl grid place-items-center shrink-0 border",
                  selected ? "bg-primary/10 border-primary/40" : "bg-secondary border-transparent",
                )}
              >
                <Icon className={cn("w-5 h-5", selected && "text-primary")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px]">{o.label}</p>
                <p className="text-[13px] text-muted-foreground">{o.desc}</p>
              </div>
              {selected && <Check className="w-5 h-5 text-primary shrink-0" />}
            </button>
          );
        })}
      </Section>

      <Section title="Pré-visualização">
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Preview mode="light" />
            <p className={cn("text-[13px] text-center", resolved === "light" ? "text-primary font-semibold" : "text-muted-foreground")}>
              Claro
            </p>
          </div>
          <div className="space-y-2">
            <Preview mode="dark" />
            <p className={cn("text-[13px] text-center", resolved === "dark" ? "text-primary font-semibold" : "text-muted-foreground")}>
              Escuro
            </p>
          </div>
        </div>
      </Section>
    </SettingsPage>
  );
}
