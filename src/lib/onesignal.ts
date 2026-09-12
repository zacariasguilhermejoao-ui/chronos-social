// Chrónos — integração OneSignal (Web Push).
// External ID = id do utilizador no backend, para que a push chegue à pessoa certa.
import OneSignal from "react-onesignal";

export const ONESIGNAL_APP_ID = "3dbfa19d-ced7-45b5-a5db-1ee51947c649";

let initPromise: Promise<boolean> | null = null;

function isSupportedEnv() {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return false;
  // Não iniciar em dev, dentro de iframes (preview) ou fora de HTTPS
  if (import.meta.env.DEV) return false;
  if (window.top !== window.self) return false;
  if (location.protocol !== "https:" && location.hostname !== "localhost") return false;
  return true;
}

export function initOneSignal(): Promise<boolean> {
  if (!isSupportedEnv()) return Promise.resolve(false);
  if (initPromise) return initPromise;

  initPromise = OneSignal.init({
    appId: ONESIGNAL_APP_ID,
    serviceWorkerPath: "/OneSignalSDKWorker.js",
    serviceWorkerParam: { scope: "/onesignal/" },
    allowLocalhostAsSecureOrigin: true,
    notifyButton: { enable: false } as any,
    autoResubscribe: true,
  })
    .then(() => true)
    .catch((e) => {
      console.warn("[push] OneSignal init falhou", e);
      initPromise = null;
      return false;
    });

  return initPromise;
}

/** Associa a subscrição atual ao utilizador (External ID). */
export async function linkPushUser(userId: string) {
  const ok = await initOneSignal();
  if (!ok) return;
  try {
    await OneSignal.login(userId);
  } catch (e) {
    console.warn("[push] login falhou", e);
  }
}

/** Desassocia (logout da app). */
export async function unlinkPushUser() {
  if (!initPromise) return;
  try {
    await OneSignal.logout();
  } catch {
    /* noop */
  }
}

/** Pede permissão de notificações e subscreve. */
export async function requestPushPermission(): Promise<boolean> {
  const ok = await initOneSignal();
  if (!ok) return false;
  try {
    await OneSignal.Notifications.requestPermission();
    return OneSignal.Notifications.permission === true;
  } catch (e) {
    console.warn("[push] permissão falhou", e);
    return false;
  }
}

export function isPushEnabled(): boolean {
  try {
    return OneSignal.Notifications?.permission === true;
  } catch {
    return false;
  }
}

export { OneSignal };
