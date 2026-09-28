import {
  DEFAULT_ADJUSTMENTS,
  FILTERS,
  FONT_STACKS,
  type EditorState,
  type FilterPreset,
} from "./types";

export const ACCEPTED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
export const MAX_EXPORT_DIM = 2560;

export type Source = { bitmap: ImageBitmap; width: number; height: number };

export function validateImageFile(file: File): string | null {
  const type = (file.type || "").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_MIME.includes(type)) return "Formato não suportado. Usa JPG, PNG ou WEBP.";
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) return "Extensão não suportada.";
  if (file.size > MAX_SOURCE_BYTES) return "Imagem demasiado grande (máx. 25 MB).";
  return null;
}

export async function loadSource(file: File): Promise<Source> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as any);
  return { bitmap, width: bitmap.width, height: bitmap.height };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function presetOf(id: string): FilterPreset {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}

function cssFilter(st: EditorState, minDim: number): string {
  const p = presetOf(st.filterId);
  const t = Math.max(0, Math.min(1, st.filterIntensity));
  const a = st.adjustments;
  const brightness = lerp(1, p.brightness ?? 1, t) * (1 + a.brightness / 100);
  const contrast = lerp(1, p.contrast ?? 1, t) * (1 + a.contrast / 100);
  const saturate = lerp(1, p.saturate ?? 1, t) * (1 + a.saturation / 100);
  const sepia = lerp(0, p.sepia ?? 0, t);
  const grayscale = lerp(0, p.grayscale ?? 0, t);
  const hue = lerp(0, p.hueRotate ?? 0, t);
  const blurPx = (a.blur / 100) * minDim * 0.02;
  const parts = [
    `brightness(${brightness.toFixed(3)})`,
    `contrast(${contrast.toFixed(3)})`,
    `saturate(${Math.max(0, saturate).toFixed(3)})`,
  ];
  if (sepia > 0.001) parts.push(`sepia(${sepia.toFixed(3)})`);
  if (grayscale > 0.001) parts.push(`grayscale(${grayscale.toFixed(3)})`);
  if (Math.abs(hue) > 0.5) parts.push(`hue-rotate(${hue.toFixed(1)}deg)`);
  if (blurPx > 0.2) parts.push(`blur(${blurPx.toFixed(2)}px)`);
  return parts.join(" ");
}

function drawOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, alpha: number, mode: GlobalCompositeOperation) {
  ctx.save();
  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  if (amount <= 0) return;
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${(amount / 100) * 0.75})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, frame: string) {
  if (frame === "none") return;
  const border = Math.round(Math.min(w, h) * 0.03);
  ctx.save();
  if (frame === "white" || frame === "polaroid") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, border);
    ctx.fillRect(0, 0, border, h);
    ctx.fillRect(w - border, 0, border, h);
    ctx.fillRect(0, h - (frame === "polaroid" ? border * 3 : border), w, frame === "polaroid" ? border * 3 : border);
  } else if (frame === "black" || frame === "cinema") {
    ctx.fillStyle = "#000";
    const bh = frame === "cinema" ? Math.round(h * 0.08) : border;
    ctx.fillRect(0, 0, w, bh);
    ctx.fillRect(0, h - bh, w, bh);
    if (frame === "black") {
      ctx.fillRect(0, 0, border, h);
      ctx.fillRect(w - border, 0, border, h);
    }
  }
  ctx.restore();
}

export function renderToCanvas(
  src: Source,
  st: EditorState,
  opts: { maxDim?: number; fast?: boolean; skipLayers?: boolean } = {}
): HTMLCanvasElement {
  const maxDim = opts.maxDim ?? MAX_EXPORT_DIM;
  const crop = st.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const cw = Math.round(src.width * crop.w);
  const ch = Math.round(src.height * crop.h);
  let scale = 1;
  if (Math.max(cw, ch) > maxDim) scale = maxDim / Math.max(cw, ch);
  let w = Math.round(cw * scale);
  let h = Math.round(ch * scale);
  if (st.rotation === 90 || st.rotation === 270) [w, h] = [h, w];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const min = Math.min(w, h);
  ctx.save();
  ctx.filter = cssFilter(st, min);
  ctx.translate(w / 2, h / 2);
  if (st.rotation) ctx.rotate((st.rotation * Math.PI) / 180);
  ctx.scale(st.flipH ? -1 : 1, st.flipV ? -1 : 1);
  const dw = cw * scale;
  const dh = ch * scale;
  ctx.drawImage(
    src.bitmap,
    Math.round(crop.x * src.width),
    Math.round(crop.y * src.height),
    cw, ch, -dw / 2, -dh / 2, dw, dh
  );
  ctx.restore();
  ctx.filter = "none";
  const p = presetOf(st.filterId);
  if (p.overlay) drawOverlay(ctx, w, h, p.overlay.color, p.overlay.alpha * st.filterIntensity, p.overlay.mode);
  const temp = st.adjustments.temperature;
  if (Math.abs(temp) > 0.5) {
    drawOverlay(ctx, w, h, temp > 0 ? "#ff8a2b" : "#2b8aff", (Math.abs(temp) / 100) * 0.32, "soft-light");
  }
  drawVignette(ctx, w, h, st.adjustments.vignette);
  drawFrame(ctx, w, h, st.frame);
  return canvas;
}

function supportsWebP(): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

export async function exportImage(
  src: Source,
  st: EditorState,
  fileName: string
): Promise<{ file: File; width: number; height: number }> {
  const canvas = renderToCanvas(src, st, { maxDim: MAX_EXPORT_DIM });
  const width = canvas.width;
  const height = canvas.height;
  const webp = supportsWebP();
  const type = webp ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, webp ? 0.92 : 0.93));
  canvas.width = canvas.height = 0;
  if (!blob) throw new Error("export-failed");
  const base = fileName.replace(/\.[^.]+$/, "") || "chronos";
  const file = new File([blob], `${base}-chronos.${webp ? "webp" : "jpg"}`, { type });
  return { file, width, height };
}
