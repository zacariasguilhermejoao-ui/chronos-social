import { useEffect, useRef, useState } from "react";
import { X, Mic, Send } from "@/lib/icons";
import { toast } from "sonner";

function pickMime() {
  const candidates = [
    { mime: "audio/webm;codecs=opus", ext: "webm" },
    { mime: "audio/webm", ext: "webm" },
    { mime: "audio/mp4", ext: "m4a" },
    { mime: "audio/ogg;codecs=opus", ext: "ogg" },
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c.mime)) return c;
  }
  return { mime: "", ext: "webm" };
}

export function AudioRecorder({
  onComplete,
  onCancel,
}: {
  onComplete: (file: File, durationSec: number) => void;
  onCancel: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startRef = useRef(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!alive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const { mime } = pickMime();
        const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        chunksRef.current = [];
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.start(250);
        recRef.current = mr;
        startRef.current = Date.now();
        setReady(true);
      } catch {
        toast.error("Sem acesso ao microfone");
        onCancel();
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - startRef.current) / 1000);
      setSeconds(s);
      if (s >= 120) finalize();
    }, 250);
    return () => clearInterval(id);
  }, [ready]);

  const cleanup = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recRef.current = null;
  };

  const finalize = () => {
    const mr = recRef.current;
    if (!mr) return;
    const { mime, ext } = pickMime();
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
      const dur = Math.floor((Date.now() - startRef.current) / 1000);
      const file = new File([blob], `audio-${Date.now()}.${ext}`, { type: blob.type });
      cleanup();
      onComplete(file, dur);
    };
    if (mr.state !== "inactive") mr.stop();
  };

  const cancel = () => {
    const mr = recRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => {};
      mr.stop();
    }
    cleanup();
    onCancel();
  };

  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="flex-1 flex items-center gap-3 px-2">
      <button onClick={cancel} className="w-9 h-9 rounded-full bg-secondary grid place-items-center" aria-label="Cancelar">
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex-1 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
        <Mic className="w-4 h-4 text-destructive" />
        <span className="font-mono text-sm tabular">{m}:{s}</span>
        <span className="text-xs text-muted-foreground ml-auto">A gravar...</span>
      </div>
      <button
        onClick={finalize}
        disabled={!ready || seconds < 1}
        className="w-9 h-9 rounded-full gradient-money grid place-items-center text-primary-foreground disabled:opacity-50"
        aria-label="Enviar gravação"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
