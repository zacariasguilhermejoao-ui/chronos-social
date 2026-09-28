import { Capacitor } from "@capacitor/core";

/** Inicializa push nativo via Capacitor (Android/iOS). No-op no browser. */
export async function initFirebasePush(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return;
    await PushNotifications.register();
    PushNotifications.addListener("registration", async (token) => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        await (supabase as any).from("push_tokens").upsert({
          user_id: userId,
          token: token.value,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("[push] guardar token falhou", e);
      }
    });
  } catch (e) {
    console.warn("[push] firebase init falhou", e);
  }
}
