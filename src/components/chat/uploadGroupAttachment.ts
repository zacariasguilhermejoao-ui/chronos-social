// Upload de anexos para o bucket privado `group-attachments`
import { supabase } from "@/integrations/supabase/client";
import { detectType, MAX_FILE_BYTES, type MsgType } from "./uploadAttachment";

export { detectType, MAX_FILE_BYTES };
export type { MsgType };

function safeName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 80);
}

export async function uploadGroupAttachment(params: {
  groupId: string;
  userId: string;
  file: File;
}): Promise<{ url: string; path: string }> {
  const { groupId, userId, file } = params;
  const path = `${groupId}/${userId}/${Date.now()}-${safeName(file.name)}`;
  const { error: upErr } = await supabase.storage
    .from("group-attachments")
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) throw upErr;

  const { data, error } = await supabase.storage
    .from("group-attachments")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (error || !data?.signedUrl) throw error ?? new Error("URL falhou");
  return { url: data.signedUrl, path };
}
