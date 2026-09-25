import { SettingsPage, Section, Row } from "./SettingsLayout";
import { Switch } from "@/components/ui/switch";
import { usePrefs } from "@/hooks/usePrefs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestPushPermission } from "@/lib/onesignal";
import { initFirebasePush } from "@/lib/firebasePush";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationsSettings() {
  const { prefs, update } = usePrefs();
  const { user } = useAuth();
  const n = prefs.notifications;

  const toggle = (key: keyof typeof n) =>
    update((cur) => ({
      ...cur,
      notifications: { ...cur.notifications, [key]: !cur.notifications[key] },
    }));

  const requestPermission = async () => {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
      if (!user?.id) return toast.info("Entre na sua conta primeiro");
      const granted = await initFirebasePush(user.id, true);
      toast[granted ? "success" : "info"](
        granted ? "Notificações push ativas" : "Permissão não concedida"
      );
      return;
    }

    if (!("Notification" in window)) return toast.error("Notificações não suportadas");
    const granted = await requestPushPermission();
    if (granted) {
      toast.success("Notificações push ativas");
      return;
    }
    const r = await Notification.requestPermission();
    toast[r === "granted" ? "success" : "info"](
      r === "granted" ? "Notificações ativas" : "Permissão não concedida"
    );
  };

  return (
    <SettingsPage title="Notificações">
      <Section title="Geral">
        <Row
          label="Ativar tudo"
          desc="Mestre. Desliga para silenciar tudo."
          right={
            <Switch
              checked={n.masterEnabled}
              onCheckedChange={() => toggle("masterEnabled")}
            />
          }
        />
        <div className="p-4">
          <Button variant="outline" className="w-full" onClick={requestPermission}>
            Ativar notificações push
          </Button>
        </div>
      </Section>

      <Section title="Tipos">
        <Row label="Likes" right={<Switch checked={n.likes && n.masterEnabled} disabled={!n.masterEnabled} onCheckedChange={() => toggle("likes")} />} />
        <Row label="Comentários" right={<Switch checked={n.comments && n.masterEnabled} disabled={!n.masterEnabled} onCheckedChange={() => toggle("comments")} />} />
        <Row label="Novos seguidores" right={<Switch checked={n.followers && n.masterEnabled} disabled={!n.masterEnabled} onCheckedChange={() => toggle("followers")} />} />
        <Row label="Mensagens" right={<Switch checked={n.messages && n.masterEnabled} disabled={!n.masterEnabled} onCheckedChange={() => toggle("messages")} />} />
        <Row label="Ganhos" right={<Switch checked={n.earnings && n.masterEnabled} disabled={!n.masterEnabled} onCheckedChange={() => toggle("earnings")} />} />
      </Section>
    </SettingsPage>
  );
}
