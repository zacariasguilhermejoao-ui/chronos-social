import { Play } from "@/lib/icons";

export function VideoThumb({
  src,
  poster,
  onClick,
  className = "",
}: {
  src?: string;
  poster?: string | null;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`relative block overflow-hidden bg-black ${className}`}>
      {poster ? (
        <img src={poster} alt="" className="w-full h-full object-cover" />
      ) : src ? (
        <video src={src} className="w-full h-full object-cover" muted playsInline preload="metadata" />
      ) : (
        <div className="w-full h-full bg-secondary" />
      )}
      <span className="absolute inset-0 grid place-items-center">
        <Play className="w-10 h-10 text-white/80" />
      </span>
    </button>
  );
}
