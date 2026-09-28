// Helpers de upload para o bucket privado `chat-attachments`
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type MsgType = Database["public"]["Enums"]["message_type"];

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export function detectType(mime: string, name: string): MsgType {
  const m = (mime || "").toLowerCase();
  const n = name.toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m === "audio/mpeg" || n.endsWith(".mp3") || n.endsWith(".flac") || n.endsWith(".wav") || n.endsWith(".m4a") || n.endsWith(".aac"))
    return "music";
  if (m.startsWith("audio/")) return "audio";
  return "file";
}

function safeName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 80);
}

export async function uploadChatAttachment(params: {
  threadId: string;
  userId: string;
  file: File;
}): Promise<{ url: string; path: string }> {
  const { threadId, userId, file } = params;
  const path = `${threadId}/${userId}/${Date.now()}-${safeName(file.name)}`;
  const { error: upErr } = await supabase.storage
    .from("chat-attachments")
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) throw upErr;

  const { data, error } = await supabase.storage
    .from("chat-attachments")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (error || !data?.signedUrl) throw error ?? new Error("URL falhou");
  return { url: data.signedUrl, path };
}
