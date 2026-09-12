import { Capacitor } from "@capacitor/core";
import {
  PushNotifications,
  type ActionPerformed,
  type Token,
} from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";

let initialized = false;
let currentToken: string | null = null;

function isNativeAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

async function saveToken(token: Token, userId: string) {
  currentToken = token.value;

  // The push_devices table is created by migration/08_firebase_push.sql.
  const { error } = await (supabase as any).from("push_devices").upsert(
    {
      user_id: userId,
      token: token.value,
      platform: "android",
      provider: "fcm",
      app_id: "com.chronossocial.app",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "token" },
  );

  if (error) console.warn("[push] token save failed", error);
}

export async function initFirebasePush(userId: string, requestPermission = false): Promise<boolean> {
  if (!isNativeAndroid() || !userId) return false;

  if (!initialized) {
    initialized = true;

    await PushNotifications.addListener("registration", (token) => {
      void saveToken(token, userId);
    });

    await PushNotifications.addListener("registrationError", (error) => {
      console.warn("[push] FCM registration failed", error);
    });

    await PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.info("[push] notification received", notification);
    });

    await PushNotifications.addListener("pushNotificationActionPerformed", (event: ActionPerformed) => {
      const data = event.notification.data as Record<string, unknown> | undefined;
      const url = typeof data?.url === "string" ? data.url : undefined;
      if (url?.startsWith("/")) window.location.assign(url);
    });
  }

  const permission = await PushNotifications.checkPermissions();
  let receive = permission.receive;

  if (receive !== "granted" && requestPermission) {
    const requested = await PushNotifications.requestPermissions();
    receive = requested.receive;
  }

  if (receive !== "granted") return false;

  await PushNotifications.register();
  return true;
}

export async function removeFirebasePushToken(userId: string) {
  if (!isNativeAndroid() || !currentToken) return;

  const token = currentToken;
  currentToken = null;

  const { error } = await (supabase as any)
    .from("push_devices")
    .delete()
    .eq("user_id", userId)
    .eq("token", token);

  if (error) console.warn("[push] token removal failed", error);
}
