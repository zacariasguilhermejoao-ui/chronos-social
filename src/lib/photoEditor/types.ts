export type TextLayer = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  font: "sans" | "serif" | "bold" | "modern" | "classic";
  align: "left" | "center" | "right";
};

export type Stroke = {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
};

export type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  vignette: number;
  fade: number;
};

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  vignette: 0,
  fade: 0,
};

export type EditorState = {
  filterId: string;
  crop: { x: number; y: number; w: number; h: number } | null;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  texts: TextLayer[];
  strokes: Stroke[];
  frame: "none" | "white" | "black" | "polaroid";
  adjustments: Adjustments;
};

export const FONT_STACKS: Record<TextLayer["font"], string> = {
  sans: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  bold: '"Plus Jakarta Sans", system-ui, sans-serif',
  modern: '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif',
  classic: '"Iowan Old Style", Palatino, Georgia, serif',
};

export function isPristine(s: EditorState): boolean {
  const a = s.adjustments;
  return (
    s.filterId === "original" &&
    s.crop === null &&
    s.rotation === 0 &&
    !s.flipH &&
    !s.flipV &&
    s.texts.length === 0 &&
    s.strokes.length === 0 &&
    s.frame === "none" &&
    (Object.keys(a) as (keyof Adjustments)[]).every((k) => a[k] === DEFAULT_ADJUSTMENTS[k])
  );
}
