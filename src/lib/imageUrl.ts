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
const RENDER_MARK = "/storage/v1/render/image/public/";

function isStorageUrl(url: string): boolean {
  return url.includes(PUBLIC_MARK) || url.includes(RENDER_MARK);
}

/** Versão redimensionada (largura em px CSS). Quality 1–100. */
export function optimizedImage(
  url: string | null | undefined,
  width: number,
  quality = 70,
): string | undefined {
  if (!url) return undefined;
  if (!isStorageUrl(url)) return url;
  // Já é render URL → reescreve params; se for object, troca o path.
  let base = url;
  if (url.includes(PUBLIC_MARK)) {
    base = url.replace(PUBLIC_MARK, RENDER_MARK);
  }
  // Remove params antigos de resize
  const qIdx = base.indexOf("?");
  if (qIdx >= 0) base = base.slice(0, qIdx);
  return `${base}?width=${Math.round(width)}&quality=${quality}&resize=contain`;
}

/** srcSet para 1x/2x sem duplicar downloads em ecrãs normais. */
export function optimizedSrcSet(
  url: string | null | undefined,
  width: number,
  quality = 70,
): string | undefined {
  if (!url || !isStorageUrl(url)) return undefined;
  return `${optimizedImage(url, width, quality)} 1x, ${optimizedImage(url, width * 2, quality)} 2x`;
}
