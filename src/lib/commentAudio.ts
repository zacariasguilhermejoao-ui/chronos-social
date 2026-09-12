import { supabase } from "@/integrations/supabase/client";

const BUCKET = "comment-audio";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // ~5 anos
export const MAX_AUDIO_SEC = 60;
export const MAX_AUDIO_BYTES = 4 * 1024 * 1024; // 4 MB (comprimido opus fica <1MB p/ 60s)

export function pickAudioMime(): { mime: string; ext: string } {
  if (typeof MediaRecorder === "undefined") return { mime: "", ext: "webm" };
  const candidates: Array<{ mime: string; ext: string }> = [
    { mime: "audio/webm;codecs=opus", ext: "webm" },
    { mime: "audio/webm", ext: "webm" },
    { mime: "audio/mp4", ext: "m4a" },
    { mime: "audio/ogg;codecs=opus", ext: "ogg" },
  ];
  for (const c of candidates) if (MediaRecorder.isTypeSupported(c.mime)) return c;
  return { mime: "", ext: "webm" };
}

export async function uploadCommentAudio(params: {
  userId: string;
  blob: Blob;
  ext: string;
}): Promise<{ url: string; path: string }> {
  const { userId, blob, ext } = params;
  if (blob.size > MAX_AUDIO_BYTES) {
    throw new Error("Áudio demasiado grande");
  }
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: blob.type || "audio/webm",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("sign_failed");
  return { url: data.signedUrl, path };
}
