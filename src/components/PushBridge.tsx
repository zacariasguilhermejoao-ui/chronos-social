import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { initOneSignal, linkPushUser, unlinkPushUser, OneSignal } from "@/lib/onesignal";
import { initFirebasePush } from "@/lib/firebasePush";

/**
 * Liga o utilizador autenticado ao OneSignal (External ID) e trata do
 * deep-link quando o utilizador toca numa notificação de mensagem.
 */
export function PushBridge() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user?.id) {
      void linkPushUser(user.id);
      void initFirebasePush(user.id);
    } else {
      void unlinkPushUser();
    }
  }, [user?.id, loading]);

  useEffect(() => {
    let mounted = true;
    const handler = (event: any) => {
      const url: string | undefined =
        event?.notification?.additionalData?.url ?? event?.result?.url;
      if (url && url.startsWith("/")) navigate(url);
    };
    initOneSignal().then((ok) => {
      if (!ok || !mounted) return;
      try {
        OneSignal.Notifications.addEventListener("click", handler);
      } catch {
        /* noop */
      }
    });
    return () => {
      mounted = false;
      try {
        OneSignal.Notifications.removeEventListener("click", handler);
      } catch {
        /* noop */
      }
    };
  }, [navigate]);

  return null;
}

export default PushBridge;
