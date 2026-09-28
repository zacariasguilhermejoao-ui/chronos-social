// Chrónos — Editor de fotos: modelo de estado (100% local, sem APIs externas)

export type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  sharpness: number;
  blur: number;
  vignette: number;
  shadows: number;
  highlights: number;
};

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0, contrast: 0, saturation: 0, temperature: 0,
  sharpness: 0, blur: 0, vignette: 0, shadows: 0, highlights: 0,
};

export type FilterPreset = {
  id: string;
  label: string;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  sepia?: number;
  grayscale?: number;
  hueRotate?: number;
  overlay?: { color: string; alpha: number; mode: GlobalCompositeOperation };
};

export const FILTERS: FilterPreset[] = [
  { id: "original", label: "Original" },
  { id: "pb", label: "P&B", grayscale: 1, contrast: 1.1 },
  { id: "vintage", label: "Vintage", sepia: 0.45, contrast: 0.92, saturate: 0.85, overlay: { color: "#c08a3e", alpha: 0.18, mode: "soft-light" } },
  { id: "quente", label: "Quente", saturate: 1.15, overlay: { color: "#ff8a3d", alpha: 0.22, mode: "soft-light" } },
  { id: "frio", label: "Frio", saturate: 1.05, overlay: { color: "#2f7dff", alpha: 0.22, mode: "soft-light" } },
  { id: "cinema", label: "Cinema", contrast: 1.2, saturate: 0.9, overlay: { color: "#0f2e3d", alpha: 0.28, mode: "soft-light" } },
  { id: "retro", label: "Retrô", sepia: 0.3, saturate: 1.2, contrast: 0.95 },
  { id: "fade", label: "Fade", contrast: 0.82, saturate: 0.82, brightness: 1.06 },
  { id: "dramatico", label: "Dramático", contrast: 1.4, saturate: 0.75, brightness: 0.95 },
  { id: "contraste", label: "Contraste", contrast: 1.32 },
  { id: "suave", label: "Suave", contrast: 0.9, brightness: 1.05, saturate: 0.95 },
  { id: "noite", label: "Noite", brightness: 0.85, contrast: 1.15 },
  { id: "luz", label: "Luz", brightness: 1.14, contrast: 0.96 },
  { id: "natural", label: "Natural", saturate: 1.12, contrast: 1.05 },
  { id: "urbano", label: "Urbano", saturate: 0.8, contrast: 1.25 },
];

export type FrameId = "none" | "white" | "black" | "rounded" | "cinema" | "polaroid";

export const FRAMES: { id: FrameId; label: string }[] = [
  { id: "none", label: "Sem moldura" },
  { id: "white", label: "Branca" },
  { id: "black", label: "Preta" },
  { id: "rounded", label: "Arredondada" },
  { id: "cinema", label: "Cinema" },
  { id: "polaroid", label: "Polaroid" },
];

export type TextLayer = {
  id: string; text: string; x: number; y: number; size: number; rotation: number;
  color: string; font: "sans" | "serif" | "bold" | "modern" | "classic";
  bold: boolean; italic: boolean; align: CanvasTextAlign; opacity: number; bg: boolean; bgOpacity: number;
};

export type Stroke = { color: string; width: number; opacity: number; points: { x: number; y: number }[] };
export type CropRect = { x: number; y: number; w: number; h: number };

export type EditorState = {
  adjustments: Adjustments;
  filterId: string;
  filterIntensity: number;
  crop: CropRect | null;
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  texts: TextLayer[];
  strokes: Stroke[];
  frame: FrameId;
};

export const INITIAL_STATE: EditorState = {
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  filterId: "original",
  filterIntensity: 1,
  crop: null,
  rotation: 0,
  flipH: false,
  flipV: false,
  texts: [],
  strokes: [],
  frame: "none",
};

export const FONT_STACKS: Record<TextLayer["font"], string> = {
  sans: '"Plus Jakarta Sans", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  bold: '"Plus Jakarta Sans", system-ui, sans-serif',
  modern: '"Space Grotesk", system-ui, sans-serif',
  classic: 'Palatino, Georgia, serif',
};

export function isPristine(s: EditorState): boolean {
  const a = s.adjustments;
  return (
    s.filterId === "original" && s.crop === null && s.rotation === 0 && !s.flipH && !s.flipV &&
    s.texts.length === 0 && s.strokes.length === 0 && s.frame === "none" &&
    (Object.keys(a) as (keyof Adjustments)[]).every((k) => a[k] === DEFAULT_ADJUSTMENTS[k])
  );
}
