import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, X } from "@/lib/icons";

export type ViewerItem = { url: string; alt?: string };

export function MediaViewer({
  items,
  index,
  onClose,
  onIndexChange,
  onMenu,
}: {
  items: ViewerItem[];
  index: number;
  onClose: () => void;
  onIndexChange?: (i: number) => void;
  onMenu?: () => void;
  children?: ReactNode;
}) {
  const [i, setI] = useState(index);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [closing, setClosing] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ x: number; y: number; dist: number; scale: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const reset = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  const go = useCallback(
    (dir: number) => {
      setI((cur) => {
        const next = Math.min(items.length - 1, Math.max(0, cur + dir));
        if (next !== cur) {
          reset();
          onIndexChange?.(next);
        }
        return next;
      });
    },
    [items.length, onIndexChange]
  );

  const close = () => {
    setClosing(true);
    window.setTimeout(onClose, 180);
  };

  const dist = () => {
    const p = Array.from(pointers.current.values());
    if (p.length < 2) return 0;
    return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    start.current = {
      x: e.clientX,
      y: e.clientY,
      dist: dist(),
      scale,
      tx,
      ty,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2) {
      const d = dist();
      if (start.current.dist > 0) {
        setScale(Math.min(5, Math.max(1, (start.current.scale * d) / start.current.dist)));
      }
      return;
    }
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (scale > 1) {
      setTx(start.current.tx + dx);
      setTy(start.current.ty + dy);
    } else if (Math.abs(dy) > Math.abs(dx)) {
      setTy(dy);
    } else {
      setTx(dx);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    if (scale > 1) return;
    if (ty > 110) return close();
    if (Math.abs(tx) > 70) go(tx < 0 ? 1 : -1);
    setTx(0);
    setTy(0);
  };

  const opacity = scale > 1 ? 1 : Math.max(0.35, 1 - Math.abs(ty) / 400);

  return createPortal(
    <div
      className="fixed inset-0 z-[140] bg-black touch-none select-none"
      style={{ opacity: closing ? 0 : 1, transition: "opacity 180ms ease" }}
    >
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-3 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={close} className="p-2 text-white press" aria-label="Fechar">
          <X className="w-6 h-6" />
        </button>
        {items.length > 1 && (
          <span className="text-white text-[15px] font-semibold tabular">
            {i + 1}/{items.length}
          </span>
        )}
        <button
          onClick={onMenu}
          className="p-2 text-white press"
          aria-label="Mais opções"
          style={{ visibility: onMenu ? "visible" : "hidden" }}
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      <div
        className="absolute inset-0 grid place-items-center allow-zoom"
        style={{ background: `rgba(0,0,0,${opacity})` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={items[i]?.url}
          alt={items[i]?.alt ?? "Imagem"}
          draggable={false}
          className="max-w-full max-h-full object-contain viewer-in"
          style={{
            transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
            transition: pointers.current.size ? "none" : "transform 200ms cubic-bezier(0.2,0,0,1)",
          }}
        />
      </div>
    </div>,
    document.body
  );
}
