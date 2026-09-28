import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, RotateRight, FlipHorizontal, FlipVertical, Filter, Sliders, Sun, Contrast, Droplet } from "@/lib/icons";
import {
  DEFAULT_ADJUSTMENTS,
  FILTERS,
  INITIAL_STATE,
  type Adjustments,
  type EditorState,
} from "@/lib/photoEditor/types";
import { exportImage, loadSource, renderToCanvas, validateImageFile, type Source } from "@/lib/photoEditor/render";

type ToolId = "adjust" | "filters" | "rotate" | "brightness" | "contrast" | "saturation";

export function PhotoEditor({
  file,
  onClose,
  onExport,
}: {
  file: File;
  onClose: () => void;
  onExport: (file: File) => void;
}) {
  const [source, setSource] = useState<Source | null>(null);
  const [state, setState] = useState<EditorState>({ ...INITIAL_STATE, adjustments: { ...DEFAULT_ADJUSTMENTS } });
  const [tool, setTool] = useState<ToolId>("adjust");
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); onClose(); return; }
    loadSource(file).then(setSource).catch(() => toast.error("Falha ao carregar imagem"));
  }, [file, onClose]);

  useEffect(() => {
    if (!source || !canvasRef.current) return;
    const out = renderToCanvas(source, state, { maxDim: 1080, fast: true });
    const ctx = canvasRef.current.getContext("2d")!;
    canvasRef.current.width = out.width;
    canvasRef.current.height = out.height;
    ctx.drawImage(out, 0, 0);
    out.width = out.height = 0;
  }, [source, state]);

  const setAdj = (key: keyof Adjustments, value: number) => {
    setState((s) => ({ ...s, adjustments: { ...s.adjustments, [key]: value } }));
  };

  const save = useCallback(async () => {
    if (!source) return;
    setBusy(true);
    try {
      const { file: out } = await exportImage(source, state, file.name);
      onExport(out);
    } catch {
      toast.error("Falha ao exportar");
    } finally {
      setBusy(false);
    }
  }, [source, state, file.name, onExport]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      <header className="flex items-center justify-between p-3 safe-top">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 grid place-items-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm">Editor</span>
        <button onClick={save} disabled={busy || !source} className="rounded-full gradient-money text-primary-foreground px-4 py-2 text-sm font-bold disabled:opacity-40">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
        </button>
      </header>

      <div className="flex-1 grid place-items-center overflow-hidden px-2">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
      </div>

      <div className="p-3 space-y-3 safe-bottom bg-black/80">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {([
            ["adjust", Sliders, "Ajustar"],
            ["filters", Filter, "Filtros"],
            ["brightness", Sun, "Brilho"],
            ["contrast", Contrast, "Contraste"],
            ["saturation", Droplet, "Saturação"],
            ["rotate", RotateRight, "Girar"],
          ] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs ${tool === id ? "bg-primary text-primary-foreground" : "bg-white/10"}`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {tool === "filters" && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setState((s) => ({ ...s, filterId: f.id }))}
                className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold ${state.filterId === f.id ? "bg-primary text-primary-foreground" : "bg-white/10"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {(tool === "brightness" || tool === "contrast" || tool === "saturation" || tool === "adjust") && (
          <div className="space-y-2">
            {(["brightness", "contrast", "saturation"] as const)
              .filter((k) => tool === "adjust" || tool === k)
              .map((k) => (
                <label key={k} className="flex items-center gap-3 text-xs">
                  <span className="w-20 capitalize">{k === "brightness" ? "Brilho" : k === "contrast" ? "Contraste" : "Saturação"}</span>
                  <input
                    type="range" min={-100} max={100}
                    value={state.adjustments[k]}
                    onChange={(e) => setAdj(k, Number(e.target.value))}
                    className="flex-1"
                  />
                </label>
              ))}
          </div>
        )}

        {tool === "rotate" && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setState((s) => ({ ...s, rotation: ((s.rotation + 90) % 360) as 0 | 90 | 180 | 270 }))}
              className="px-4 py-2 rounded-xl bg-white/10 text-sm font-semibold flex items-center gap-2"
            >
              <RotateRight className="w-4 h-4" /> 90°
            </button>
            <button onClick={() => setState((s) => ({ ...s, flipH: !s.flipH }))} className="px-4 py-2 rounded-xl bg-white/10 text-sm font-semibold flex items-center gap-2">
              <FlipHorizontal className="w-4 h-4" /> Horizontal
            </button>
            <button onClick={() => setState((s) => ({ ...s, flipV: !s.flipV }))} className="px-4 py-2 rounded-xl bg-white/10 text-sm font-semibold flex items-center gap-2">
              <FlipVertical className="w-4 h-4" /> Vertical
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhotoEditor;
