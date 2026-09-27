import { useEffect, useRef, useState } from "react";
import { Play } from "@/lib/icons";

const cache = new Map<string, string>();

export function VideoThumb({
  src,
  poster,
  alt = "",
  className = "",
}: {
  src: string;
  poster?: string | null;
  alt?: string;
  className?: string;
}) {
  const [thumb, setThumb] = useState<string | null>(() => (poster ? poster : cache.get(src) ?? null));
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [near, setNear] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (poster) {
      setThumb(poster);
      return;
    }
    if (cache.has(src)) {
      setThumb(cache.get(src)!);
      return;
    }
    const el = hostRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setNear(true);
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [src, poster]);

  useEffect(() => {
    if (poster || !near || cache.has(src) || canvasFailed) return;
    let cancelled = false;
    const video = document.createElement("video");
    videoRef.current = video;
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = src;

    const capture = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = video.videoWidth || 360;
        const h = video.videoHeight || 640;
        const scale = Math.min(1, 480 / Math.max(w, h));
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return setCanvasFailed(true);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        if (dataUrl && dataUrl.length > 100) {
          cache.set(src, dataUrl);
          if (!cancelled) setThumb(dataUrl);
        } else {
          setCanvasFailed(true);
        }
      } catch {
        if (!cancelled) setCanvasFailed(true);
      }
    };

    const onLoaded = () => {
      try {
        video.currentTime = Math.min(0.1, (video.duration || 1) / 2);
      } catch {
        capture();
      }
    };
    const onSeeked = () => capture();
    const onError = () => {
      if (!cancelled) setCanvasFailed(true);
    };

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.src = "";
    };
  }, [src, poster, near, canvasFailed]);

  if (thumb) {
    return <img src={thumb} alt={alt} loading="lazy" className={className} />;
  }

  if (canvasFailed) {
    return (
      <video
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        className={className}
      />
    );
  }

  return (
    <div ref={hostRef} className={`grid place-items-center bg-gradient-to-br from-secondary to-secondary/40 ${className}`}>
      <Play className="w-6 h-6 text-muted-foreground/60 fill-current" />
    </div>
  );
}
