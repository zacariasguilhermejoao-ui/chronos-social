/**
 * Registo controlado do Service Worker da Chrónos.
 *
 * Regras:
 * - Nunca regista em dev, iframe ou hosts de pré-visualização Lovable.
 * - Kill switch: abrir com ?sw=off remove o SW da app (sem apagar dados).
 * - Verifica atualizações ao arrancar e ao voltar ao ecrã. Sem loops de reload:
 *   a nova versão é aplicada naturalmente no próximo arranque da app.
 */

const SW_URL = "/service-worker.js";

function inIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function isBlockedHost() {
  const h = window.location.hostname;
  return (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h === "lovableproject.com" ||
    h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" ||
    h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" ||
    h.endsWith(".beta.lovable.dev")
  );
}

async function unregisterAppSW() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => {
        const url =
          r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || "";
        return url.includes("/service-worker.js") || url.includes("/sw.js");
      })
      .map((r) => r.unregister()),
  );
}

export async function registerAppSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const swOff = new URLSearchParams(window.location.search).get("sw") === "off";
  if (!import.meta.env.PROD || inIframe() || isBlockedHost() || swOff) {
    await unregisterAppSW();
    return;
  }

  try {
    const reg = await navigator.serviceWorker.register(SW_URL, { scope: "/" });
    const check = () => reg.update().catch(() => {});
    check();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
    // Quando houver uma versão à espera, ativa-a sem forçar reload (sem loops).
    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          worker.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
  } catch {
    /* ignora — a app funciona na mesma sem SW */
  }
}
