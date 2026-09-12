/**
 * Gera URLs de imagem otimizadas para o tamanho real em ecrã.
 *
 * O Storage serve `/storage/v1/object/public/<bucket>/<path>`; a mesma imagem
 * pode ser pedida redimensionada via `/storage/v1/render/image/public/...`.
 * No feed pedimos uma versão pequena (largura ~ ao slot real); ao abrir a foto
 * usamos o original. Se o URL não for do Storage (ex.: externo, data:), fica
 * intacto — nada quebra.
 */
const PUBLIC_MARK = "/storage/v1/object/public/";

export function isStorageUrl(url: string | null | undefined): boolean {
  return !!url && url.includes(PUBLIC_MARK);
}

/** Largura pedida arredondada a degraus (maximiza reutilização de cache HTTP). */
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

/** srcSet para 1x/2x sem duplicar downloads em ecrãs normais. */
export function optimizedSrcSet(url: string | null | undefined, width: number, quality = 70): string | undefined {
  if (!url || !isStorageUrl(url)) return undefined;
  return `${optimizedImage(url, width, quality)} 1x, ${optimizedImage(url, width * 2, quality)} 2x`;
}
