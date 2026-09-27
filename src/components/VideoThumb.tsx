import { useEffect, useRef, useState } from "react";
import { Play } from "@/lib/icons";

const cache = new Map<string, string>();

interface Props {
  src: string;
  poster?: string | null;
  className?: string;
  alt?: string;
}

export function VideoThumb({ src, poster, className = "", alt = "" }: Props) {
  const [thumb, setThumb] = useState<string | null>(poster || cache.get(src) || null);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [near, setNear] = useState<boolean>(!!poster || cache.has(src));
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (near) return;
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    if (!near) return;
    if (poster) {
      setThumb(poster);
      return;
    }
    const cached = cache.get(src);
    if (cached) {
      setThumb(cached);
      return;
    }

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
  }, [src, poster, near]);

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
