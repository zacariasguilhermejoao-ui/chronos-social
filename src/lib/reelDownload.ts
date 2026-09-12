// Chrónos — download de Reels.
// O ficheiro entregue ao utilizador é SEMPRE a versão processada no servidor
// (vídeo original + vinheta Chrónos concatenada no final, via worker FFmpeg).
// Nunca se processa vídeo no navegador e nunca se entrega o original.
import { supabase } from "@/integrations/supabase/client";

export type DownloadStatus = "pending" | "processing" | "ready" | "failed" | "unavailable";

type EdgeResponse = { status?: DownloadStatus; url?: string | null; error?: string | null };

async function callEdge(body: Record<string, unknown>): Promise<EdgeResponse> {
  const { data, error } = await supabase.functions.invoke("reel-download", { body });
  if (error) {
    // 503 = worker ainda não configurado; 4xx/5xx → estado de falha legível
    return { status: "failed", error: error.message };
  }
  return (data ?? {}) as EdgeResponse;
}

/** Estado atual da versão de download (sem despachar processamento). */
export async function getDownloadStatus(videoId: string): Promise<EdgeResponse> {
  return callEdge({ video_id: videoId, action: "status" });
}

/**
 * Pede a preparação da versão com vinheta. Idempotente: se já estiver pronta ou
 * a processar, não recomeça o trabalho.
 */
export async function requestReelProcessing(videoId: string): Promise<EdgeResponse> {
  return callEdge({ video_id: videoId, action: "request" });
}

/** Guarda o ficheiro no dispositivo (com fallback nativo para iOS/Safari). */
async function saveFile(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "video/mp4" });
  const nav: any = navigator;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  if (isIOS && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return;
    } catch {
      /* utilizador cancelou ou não suportado — segue para o anchor */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}

export type DownloadResult =
  | { result: "saved" }
  | { result: "processing" }
  | { result: "failed"; error?: string | null }
  | { result: "unavailable" };

/**
 * Entrega o MP4 processado (com vinheta). Se ainda não existir, despacha o
 * processamento e devolve "processing" — nunca entrega o vídeo original.
 */
export async function downloadReel(videoId: string, filename: string): Promise<DownloadResult> {
  const res = await callEdge({ video_id: videoId, action: "request", filename });

  if (res.status === "ready" && res.url) {
    try {
      const r = await fetch(res.url);
      if (!r.ok) return { result: "failed", error: `http_${r.status}` };
      await saveFile(await r.blob(), filename);
      return { result: "saved" };
    } catch (e) {
      return { result: "failed", error: String(e) };
    }
  }

  if (res.status === "processing" || res.status === "pending") return { result: "processing" };
  if (res.status === "unavailable" || res.error === "worker_not_configured") return { result: "unavailable" };
  return { result: "failed", error: res.error ?? null };
}
