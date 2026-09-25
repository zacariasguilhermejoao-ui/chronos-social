import { SettingsPage, Section, Row } from "./SettingsLayout";
import { Switch } from "@/components/ui/switch";
import { usePrefs } from "@/hooks/usePrefs";

export default function AccessibilitySettings() {
  const { prefs, update } = usePrefs();
  return (
    <SettingsPage title="Acessibilidade">
      <Section title="Visual">
        <Row
          label="Texto maior"
          desc="Aumenta o tamanho base de letra"
          right={<Switch checked={prefs.largeText} onCheckedChange={(v) => update({ largeText: v })} />}
        />
        <Row
          label="Alto contraste"
          desc="Realça contornos e fundos"
          right={<Switch checked={prefs.highContrast} onCheckedChange={(v) => update({ highContrast: v })} />}
        />
      </Section>
      <Section title="Movimento">
        <Row
          label="Reduzir animações"
          desc="Desativa transições e efeitos"
          right={<Switch checked={prefs.reduceMotion} onCheckedChange={(v) => update({ reduceMotion: v })} />}
        />
      </Section>
      <Section title="Háptica">
        <Row
          label="Vibração"
          desc="Vibra em interações importantes (se suportado)"
          right={<Switch checked={prefs.vibration} onCheckedChange={(v) => update({ vibration: v })} />}
        />
      </Section>
    </SettingsPage>
  );
}
