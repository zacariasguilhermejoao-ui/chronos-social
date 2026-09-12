/**
 * Camada de comportamento "app nativa" da Chrónos.
 * Bloqueia comportamentos típicos de browser (menu de contexto, arrastar,
 * seleção por toque longo, zoom por duplo toque/pinça) mantendo campos de
 * texto totalmente funcionais (copiar/colar/selecionar).
 */

const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], .allow-select, .selectable';

export function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== "function") return false;
  return !!el.closest(EDITABLE_SELECTOR);
}

/** Vibração curta em ações importantes (ignorada quando não suportada). */
export function haptic(pattern: number | number[] = 12) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* noop */
  }
}

export function installNativeBehaviour() {
  if (typeof window === "undefined") return () => {};

  const onContextMenu = (e: Event) => {
    if (!isEditableTarget(e.target)) e.preventDefault();
  };

  const onDragStart = (e: Event) => {
    if (!isEditableTarget(e.target)) e.preventDefault();
  };

  const onSelectStart = (e: Event) => {
    if (!isEditableTarget(e.target)) e.preventDefault();
  };

  // Pinch-zoom (Safari) e zoom por duplo toque
  const onGesture = (e: Event) => e.preventDefault();

  let lastTouchEnd = 0;
  const onTouchEnd = (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd < 300 && !isEditableTarget(e.target)) {
      e.preventDefault();
    }
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
