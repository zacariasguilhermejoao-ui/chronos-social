import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic } from "@/lib/icons";
import { cn } from "@/lib/utils";

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

const SPEEDS = [1, 1.5, 2] as const;

export function CommentAudioPlayer({
  src,
  durationHint,
  className,
}: {
  src: string;
  durationHint?: number | null;
  className?: string;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(durationHint && durationHint > 0 ? durationHint : 0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => setCur(el.currentTime);
    const onMeta = () => {
      const d = el.duration;
      if (isFinite(d) && d > 0) setDur(d);
      else {
        const onSeeked = () => {
          if (isFinite(el.duration) && el.duration > 0) setDur(el.duration);
          el.currentTime = 0;
          el.removeEventListener("seeked", onSeeked);
        };
        el.addEventListener("seeked", onSeeked);
        try { el.currentTime = 1e10; } catch {}
      }
    };
    const onEnd = () => { setPlaying(false); setCur(0); };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, [src]);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed;
  }, [speed]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
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
    <div className={cn(
      "flex items-center gap-2 rounded-full bg-secondary/70 border border-border/60 pl-1 pr-2 py-1 min-w-[200px] max-w-[280px]",
      className
    )}>
      <audio ref={ref} src={src} preload="none" />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full gradient-money grid place-items-center text-primary-foreground shrink-0"
        aria-label={playing ? "Pausar" : "Reproduzir"}
        type="button"
      >
        {playing ? <Pause className="w-4 h-4" weight="fill" /> : <Play className="w-4 h-4 ml-0.5" weight="fill" />}
      </button>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-primary transition-[width]" style={{ width: `${pct}%` }} />
          <input
            type="range" min={0} max={100} value={pct} onChange={seek}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Progresso"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tabular text-muted-foreground flex items-center gap-1">
            <Mic className="w-3 h-3" /> {fmt(playing || cur > 0 ? cur : dur)}
          </span>
        </div>
      </div>
      <button
        onClick={cycleSpeed}
        className="text-[10px] font-mono font-bold tabular px-1.5 py-0.5 rounded bg-background/60 hover:bg-background text-muted-foreground shrink-0"
        type="button"
        aria-label="Velocidade"
      >
        {speed}x
      </button>
    </div>
  );
}
