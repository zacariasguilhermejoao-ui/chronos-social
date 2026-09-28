import { supabase } from "@/integrations/supabase/client";

export type DownloadStatus = "pending" | "processing" | "ready" | "failed" | "unavailable";

type EdgeResponse = { status?: DownloadStatus; url?: string | null; error?: string | null };

async function callEdge(body: Record<string, unknown>): Promise<EdgeResponse> {
  const { data, error } = await supabase.functions.invoke("reel-download", { body });
  if (error) return { status: "failed", error: error.message };
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
    } catch {}
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

export async function downloadReel(videoId: string, filename = "chronos-reel.mp4"): Promise<DownloadResult> {
  let status = await getDownloadStatus(videoId);
  if (status.status === "unavailable") return { result: "unavailable" };
  if (status.status !== "ready") {
    status = await requestReelProcessing(videoId);
    if (status.status === "processing" || status.status === "pending") return { result: "processing" };
    if (status.status !== "ready" || !status.url) return { result: "failed", error: status.error };
  }
  if (!status.url) return { result: "failed", error: "Sem URL" };
  try {
    const res = await fetch(status.url);
    const blob = await res.blob();
    await saveFile(blob, filename);
    return { result: "saved" };
  } catch (e: any) {
    return { result: "failed", error: e?.message };
  }
}
