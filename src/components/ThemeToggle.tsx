import { Sun, Moon } from "@/lib/icons";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Botão sol/lua — alterna entre tema claro e escuro. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className={cn(
        "w-10 h-10 rounded-full border border-border bg-card grid place-items-center press focus-chronos",
        className,
      )}
    >
      {isDark ? <Sun className="w-[20px] h-[20px]" /> : <Moon className="w-[20px] h-[20px]" />}
    </button>
  );
}

export default ThemeToggle;
