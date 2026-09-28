const SUPABASE_HOST = "tdehdxwdechsadpfencc.supabase.co";

export function optimizedImageUrl(
  url: string | null | undefined,
  width = 640,
  quality = 75,
): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("supabase")) return url;
    const m = u.pathname.match(/\/storage\/v1\/object\/public\/(.+)/);
    if (!m) return url;
    const path = m[1];
    return `https://${SUPABASE_HOST}/storage/v1/render/image/public/${path}?width=${width}&quality=${quality}&resize=contain`;
  } catch {
    return url;
  }
}

export function originalImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.pathname.includes("/render/image/public/")) {
      u.pathname = u.pathname.replace("/render/image/public/", "/object/public/");
      u.search = "";
      return u.toString();
    }
  } catch {}
  return url;
}
