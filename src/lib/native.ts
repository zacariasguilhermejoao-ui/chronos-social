/** Desativa zoom, long-press e selecção de texto na app (estilo nativo). */
export function installNativeGuards() {
  if (typeof document === "undefined") return () => {};

  const isEditableTarget = (t: EventTarget | null) => {
    const el = t as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  };

  const onContextMenu = (e: Event) => {
    if (!isEditableTarget(e.target)) e.preventDefault();
  };
  const onDragStart = (e: Event) => {
    if (!isEditableTarget(e.target)) e.preventDefault();
  };
  const onSelectStart = (e: Event) => {
    if (!isEditableTarget(e.target)) e.preventDefault();
  };
  const onGesture = (e: Event) => e.preventDefault();

  let lastTouchEnd = 0;
  const onTouchEnd = (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd < 300 && !isEditableTarget(e.target)) e.preventDefault();
    lastTouchEnd = now;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1 && !(e.target as HTMLElement)?.closest?.(".allow-zoom")) {
      e.preventDefault();
    }
  };

  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("dragstart", onDragStart);
  document.addEventListener("selectstart", onSelectStart);
  document.addEventListener("gesturestart", onGesture as EventListener);
  document.addEventListener("gesturechange", onGesture as EventListener);
  document.addEventListener("touchend", onTouchEnd, { passive: false });
  document.addEventListener("touchmove", onTouchMove, { passive: false });

  return () => {
    document.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("dragstart", onDragStart);
    document.removeEventListener("selectstart", onSelectStart);
    document.removeEventListener("gesturestart", onGesture as EventListener);
    document.removeEventListener("gesturechange", onGesture as EventListener);
    document.removeEventListener("touchend", onTouchEnd);
    document.removeEventListener("touchmove", onTouchMove);
  };
}
