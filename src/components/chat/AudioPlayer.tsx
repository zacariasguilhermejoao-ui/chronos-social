import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "@/lib/icons";

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, dark = false, onFirstPlay }: { src: string; dark?: boolean; onFirstPlay?: () => void }) {
  const firedRef = useRef(false);
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => setCur(el.currentTime);
    const onDuration = () => {
      const d = el.duration;
      if (isFinite(d) && d > 0) setDur(d);
    };
    const onLoaded = () => {
      const d = el.duration;
      if (isFinite(d) && d > 0) {
        setDur(d);
      } else {
        const onSeeked = () => {
          if (isFinite(el.duration) && el.duration > 0) setDur(el.duration);
          el.currentTime = 0;
          el.removeEventListener("seeked", onSeeked);
        };
        el.addEventListener("seeked", onSeeked);
        try {
          el.currentTime = 1e10;
        } catch {}
      }
    };
    const onEnd = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("durationchange", onDuration);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("durationchange", onDuration);
      el.removeEventListener("ended", onEnd);
    };
  }, [src]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play();
      setPlaying(true);
      if (!firedRef.current) {
        firedRef.current = true;
        try { onFirstPlay?.(); } catch {}
      }
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = ref.current;
    if (!el || !dur) return;
    const v = parseFloat(e.target.value);
    el.currentTime = (v / 100) * dur;
    setCur(el.currentTime);
  };

  const pct = dur > 0 ? (cur / dur) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 min-w-[180px] ${dark ? "text-white" : ""}`}>
      <audio ref={ref} src={src} preload="metadata" />
      <button
        onClick={toggle}
        className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${dark ? "bg-white/20" : "bg-primary text-primary-foreground"}`}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <div className="flex-1 min-w-0">
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={pct}
          onChange={seek}
          className="w-full h-1 accent-primary"
        />
        <div className={`flex justify-between text-[10px] tabular mt-0.5 ${dark ? "text-white/70" : "text-muted-foreground"}`}>
          <span>{fmtTime(cur)}</span>
          <span>{fmtTime(dur)}</span>
        </div>
      </div>
    </div>
  );
}
