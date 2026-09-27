import { supabase } from "@/integrations/supabase/client";

type EdgeResponse = {
  status: "ready" | "processing" | "pending" | "failed" | "unavailable";
  url?: string;
  error?: string | null;
};

async function callEdge(body: Record<string, unknown>): Promise<EdgeResponse> {
  const { data, error } = await supabase.functions.invoke("process-reel", { body });
  if (error) {
    return { status: "failed", error: error.message };
  }
  return (data ?? {}) as EdgeResponse;
}

export async function getDownloadStatus(videoId: string): Promise<EdgeResponse> {
  return callEdge({ video_id: videoId, action: "status" });
}

export async function requestReelProcessing(videoId: string): Promise<EdgeResponse> {
  return callEdge({ video_id: videoId, action: "request" });
}

async function saveFile(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "video/mp4" });
  const nav: any = navigator;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  if (isIOS && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return;
    } catch {
      /* cancel */
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
