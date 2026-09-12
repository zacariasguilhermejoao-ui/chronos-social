import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: "square" | "video" | "auto";
  rounded?: boolean;
  onClick?: () => void;
  fallback?: React.ReactNode;
  eager?: boolean;
};

export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  aspect = "auto",
  rounded = false,
  onClick,
  fallback,
  eager = false,
}: Props) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setStatus("loading");
    setAttempt(0);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [src]);

  const handleError = () => {
    if (attempt < 3) {
      const backoff = 400 * (attempt + 1);
      timerRef.current = window.setTimeout(() => setAttempt((a) => a + 1), backoff);
    } else {
      setStatus("error");
    }
  };

  const aspectCls = aspect === "square" ? "aspect-square" : aspect === "video" ? "aspect-video" : "";

  if (!src || status === "error") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "bg-secondary/60 grid place-items-center text-xs text-muted-foreground",
          aspectCls,
          rounded && "rounded-xl",
          className
        )}
      >
        {fallback ?? <span>Sem imagem</span>}
      </div>
    );
  }

  const effectiveSrc = attempt > 0 ? `${src}${src.includes("?") ? "&" : "?"}_r=${attempt}` : src;

  return (
    <div
      onClick={onClick}
      className={cn("relative overflow-hidden bg-secondary/60", aspectCls, rounded && "rounded-xl", className)}
    >
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-secondary/60 to-secondary" />
      )}
      <img
        src={effectiveSrc}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          status === "loaded" ? "opacity-100" : "opacity-0",
          imgClassName
        )}
      />
    </div>
  );
}
