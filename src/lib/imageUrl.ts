const PUBLIC_MARK = "/storage/v1/object/public/";

export function isStorageUrl(url: string | null | undefined): boolean {
  return !!url && url.includes(PUBLIC_MARK);
}

function stepWidth(w: number) {
  const steps = [320, 480, 640, 800, 1080, 1440];
  return steps.find((s) => s >= w) ?? steps[steps.length - 1];
}

export function optimizedImage(
  url: string | null | undefined,
  width: number,
  quality = 70,
): string {
  if (!url) return "";
  if (!isStorageUrl(url)) return url;
  const w = stepWidth(Math.round(width));
  const base = url.replace(PUBLIC_MARK, "/storage/v1/render/image/public/");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${w}&quality=${quality}&resize=contain`;
}

export function optimizedSrcSet(url: string | null | undefined, width: number, quality = 70): string | undefined {
  if (!url || !isStorageUrl(url)) return undefined;
  return `${optimizedImage(url, width, quality)} 1x, ${optimizedImage(url, width * 2, quality)} 2x`;
}
