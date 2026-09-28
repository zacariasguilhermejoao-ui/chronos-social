/**
 * Registo do Service Worker da Chrónos (PWA).
 * Só em produção; kill switch: ?sw=off
 */

const SW_URL = "/service-worker.js";

function inIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
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
  if (!import.meta.env.PROD || inIframe() || swOff) {
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
    /* app funciona sem SW */
  }
}
