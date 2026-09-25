import { SettingsPage, Section, Row } from "./SettingsLayout";
import { useNavigate } from "react-router-dom";

export default function MonetizationSettings() {
  const navigate = useNavigate();

  return (
    <SettingsPage title="Monetização" backTo="/me">
      <Section title="Carteira">
        <Row label="Ver saldo e ganhos" desc="Acede à tua carteira" onClick={() => navigate("/wallet")} />
        <Row label="Histórico financeiro" desc="Movimentos e levantamentos" onClick={() => navigate("/wallet")} />
      </Section>

      <Section title="Política">
        <Row label="Política de monetização" onClick={() => navigate("/legal/monetization")} />
      </Section>
    </SettingsPage>
  );
}
