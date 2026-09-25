import { useNavigate } from "react-router-dom";
import { SettingsPage, Section, Row } from "./SettingsLayout";
import { Switch } from "@/components/ui/switch";
import { usePrefs } from "@/hooks/usePrefs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PrivacySettings() {
  const navigate = useNavigate();
  const { prefs, update } = usePrefs();
  const p = prefs.privacy;

  return (
    <SettingsPage title="Privacidade">
      <Section title="Visibilidade">
        <Row
          label="Conta privada"
          desc="Apenas seguidores aprovados vêem o teu conteúdo"
          right={
            <Switch
              checked={p.privateAccount}
              onCheckedChange={(v) =>
                update((cur) => ({ ...cur, privacy: { ...cur.privacy, privateAccount: v } }))
              }
            />
          }
        />
      </Section>

      <Section title="Mensagens" desc="Quem pode iniciar conversa contigo">
        <div className="p-4">
          <Select
            value={p.whoCanDM}
            onValueChange={(v) =>
              update((cur) => ({ ...cur, privacy: { ...cur.privacy, whoCanDM: v as any } }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Toda a gente</SelectItem>
              <SelectItem value="followers">Só seguidores</SelectItem>
              <SelectItem value="friends">Só amigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Bloqueios">
        <Row
          label="Lista de bloqueados"
          desc="Gere os utilizadores bloqueados"
          onClick={() => navigate("/settings/blocked")}
        />
      </Section>
    </SettingsPage>
  );
}
