import { useEffect, useState } from "react";
import { WifiSlash, ArrowClockwise, CheckCircle } from "@phosphor-icons/react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const { online, checking, retry } = useOnlineStatus();
  const [showBack, setShowBack] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setShowBack(false);
    } else if (wasOffline) {
      setShowBack(true);
      const t = setTimeout(() => {
        setShowBack(false);
        setWasOffline(false);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [online, wasOffline]);

  if (online && !showBack) return null;

  if (online && showBack) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-[64px] inset-x-0 z-40 px-3 pointer-events-none animate-fade-in"
      >
        <div className="max-w-xl mx-auto glass border border-primary/40 rounded-xl px-3 py-2 flex items-center gap-2 shadow-soft bg-primary/10">
          <CheckCircle size={18} weight="fill" className="text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground">
            Ligação restabelecida.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-[64px] inset-x-0 z-40 px-3 animate-fade-in"
    >
      <div className="max-w-xl mx-auto glass border border-destructive/50 rounded-xl px-3 py-2.5 flex items-center gap-2.5 shadow-soft bg-destructive/10 backdrop-blur-md">
        <div className="w-8 h-8 rounded-full bg-destructive/20 grid place-items-center shrink-0">
          <WifiSlash size={18} weight="bold" className="text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">
            Sem ligação à internet
          </p>
          <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">
            Verifique seus dados móveis ou Wi-Fi.
          </p>
        </div>
        <button
          onClick={retry}
          disabled={checking}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
            "bg-foreground text-background hover:opacity-90 transition disabled:opacity-60"
          )}
        >
          <ArrowClockwise
            size={14}
            weight="bold"
            className={checking ? "animate-spin" : ""}
          />
          {checking ? "..." : "Tentar"}
        </button>
      </div>
    </div>
  );
}
