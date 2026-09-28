import { useState } from "react";
import { Download, FileText, Music, X } from "@/lib/icons";
import { AudioPlayer } from "./AudioPlayer";
import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = {
  id: string;
  type: "text" | "image" | "audio" | "music" | "file";
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_mime: string | null;
  paid?: boolean;
  sender_id: string;
  created_at: string;
  read_at?: string | null;
  played_at?: string | null;
  status?: "sending" | "sent" | "error";
};

function humanSize(bytes?: number | null) {
  if (!bytes) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

function Ticks({ double, seen }: { double: boolean; seen: boolean }) {
  return (
    <svg
      viewBox="0 0 20 12"
      width="16"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={seen ? "text-sky-400" : "opacity-80"}
      aria-label={seen ? "Visto" : "Enviado"}
    >
      <path d="m2 6.6 3 3L11 3" />
      {double && <path d="m8 9.6 6-6.6" />}
    </svg>
  );
}

export function MessageBubble({ m, own, scope = "dm" }: { m: ChatMessage; own: boolean; scope?: "dm" | "group" }) {
  const [zoom, setZoom] = useState(false);
  const bubbleBase = "max-w-[78%] rounded-2xl overflow-hidden";
  const bubbleColor = own
    ? "gradient-money text-primary-foreground"
    : "glass text-foreground";

  const time = new Date(m.created_at).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const markPlayed = async () => {
    if (own || m.played_at || String(m.id).startsWith("tmp-")) return;
    const table = scope === "group" ? "group_messages" : "messages";
    await supabase.from(table).update({ played_at: new Date().toISOString() }).eq("id", m.id);
  };

  const renderContent = () => {
    switch (m.type) {
      case "image":
        return m.file_url ? (
          <button onClick={() => setZoom(true)} className="block">
            <img
              src={m.file_url}
              alt={m.file_name ?? "imagem"}
              className="max-w-full max-h-72 object-cover"
              loading="lazy"
            />
          </button>
        ) : null;
      case "audio":
      case "music":
        return m.file_url ? (
          <div className="px-2 py-2 min-w-[220px]">
            <AudioPlayer src={m.file_url} dark={own} onFirstPlay={markPlayed} />
          </div>
        ) : null;
      case "file":
        return m.file_url ? (
          <a
            href={m.file_url}
            download={m.file_name ?? undefined}
            className="px-3 py-2.5 flex items-center gap-2.5 min-w-[200px]"
          >
            <div className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${
              own ? "bg-primary-foreground/20" : "bg-secondary"
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate">{m.file_name ?? "Ficheiro"}</p>
              <p className={`text-[10px] ${own ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {humanSize(m.file_size)}
              </p>
            </div>
            <Download className="w-4 h-4 opacity-80 shrink-0" />
          </a>
        ) : null;
      default:
        return (
          <p className="px-3.5 py-2 text-[16px] leading-[1.4] whitespace-pre-wrap break-words">
            {m.content}
          </p>
        );
    }
  };

  return (
    <>
      <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
        <div className={`${bubbleBase} ${bubbleColor}`}>
          {renderContent()}
          <div
            className={`px-3 pb-1.5 pt-0.5 flex items-center gap-1 text-[11px] ${
              own ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
            }`}
          >
            <span className="tabular">{time}</span>
            {m.status === "sending" && <span>· a enviar…</span>}
            {m.status === "error" && <span className="text-destructive">· erro</span>}
            {own && m.status !== "sending" && m.status !== "error" && (() => {
              const seen = scope === "dm" && (m.type === "audio" ? !!m.played_at : !!m.read_at);
              return <Ticks double={seen || m.status !== "sent"} seen={seen} />;
            })()}
          </div>
        </div>
      </div>

      {zoom && m.file_url && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 grid place-items-center animate-fade-in"
          onClick={() => setZoom(false)}
        >
          <button
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 grid place-items-center text-white"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={m.file_url} alt={m.file_name ?? ""} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </>
  );
}
