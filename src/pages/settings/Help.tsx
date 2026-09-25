import { SettingsPage, Section, Row } from "./SettingsLayout";
import { useNavigate } from "react-router-dom";

const faqs = [
  { q: "Como ganho dinheiro?", a: "Recebes uma fração por cada visualização válida dos teus vídeos e por cada resposta a DMs premium." },
  { q: "Como faço um levantamento?", a: "Vai à carteira e cria um pedido de levantamento. Pagamentos são processados manualmente." },
  { q: "Por que recebi 20 Kz?", a: "É o bónus de boas-vindas para começares a explorar." },
  { q: "Como elimino a minha conta?", a: "Em Configurações → Conta → Eliminar conta. O processo demora até 30 dias." },
];

export default function HelpSettings() {
  const navigate = useNavigate();
  return (
    <SettingsPage title="Ajuda & Suporte">
      <Section title="FAQ">
        {faqs.map((f) => (
          <div key={f.q} className="p-4">
            <p className="font-semibold text-sm mb-1">{f.q}</p>
            <p className="text-xs text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </Section>

      <Section title="Contacto">
        <Row
          label="Falar com o suporte"
          desc="suporte@chronos.app"
          onClick={() => (window.location.href = "mailto:suporte@chronos.app")}
        />
        <Row
          label="Reportar problema"
          desc="Conta-nos o que correu mal"
          onClick={() => (window.location.href = "mailto:suporte@chronos.app?subject=Problema%20na%20app")}
        />
      </Section>

      <Section title="Documentos">
        <Row label="Termos e Políticas" onClick={() => navigate("/legal")} />
      </Section>
    </SettingsPage>
  );
}
