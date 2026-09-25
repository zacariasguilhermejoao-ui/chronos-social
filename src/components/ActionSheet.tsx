import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/native";

export type SheetAction = {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  hidden?: boolean;
  onSelect: () => void | Promise<void>;
};

export function ActionSheet({
  open,
  onOpenChange,
  title,
  actions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  actions: SheetAction[];
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120]">
      <div
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute inset-x-0 bottom-0 sheet-up rounded-t-[28px] bg-card border-t border-border pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="mx-auto mt-3 h-1.5 w-11 rounded-full bg-foreground/20" />
        {title && (
          <p className="px-5 pt-4 text-[13px] uppercase tracking-wider text-muted-foreground font-semibold">
            {title}
          </p>
        )}
        <div className="py-2">
          {actions
            .filter((a) => !a.hidden)
            .map((a) => (
              <button
                key={a.key}
                onClick={async () => {
                  haptic(10);
                  onOpenChange(false);
                  await a.onSelect();
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 text-[16px] font-semibold text-left active:bg-foreground/5 transition-colors",
                  a.danger && "text-destructive"
                )}
              >
                <span className="w-6 h-6 grid place-items-center shrink-0">{a.icon}</span>
                {a.label}
              </button>
            ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
