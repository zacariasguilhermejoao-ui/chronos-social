import { LegalPage, H2, P, UL } from "./LegalLayout";

export default function Monetization() {
  return (
    <LegalPage title="Política de Monetização" updated="22/04/2026">
      <H2>Como ganhas</H2>
      <UL>
        <li>Receitas por visualizações válidas dos teus vídeos (70% para o criador)</li>
        <li>Recompensas por respostas a mensagens premium (70% para quem responde)</li>
        <li>Bónus de boas-vindas no primeiro registo</li>
      </UL>

      <H2>Limites e regras</H2>
      <UL>
        <li>O sistema pode aplicar limites diários para prevenir abuso</li>
        <li>As taxas e percentagens podem ser ajustadas com aviso prévio</li>
        <li>Auto-visualizações e auto-mensagens não geram ganhos</li>
      </UL>

      <H2>Fraude</H2>
      <P>
        Manipular visualizações, criar contas falsas ou usar bots leva a perda de ganhos, suspensão
        e possível bloqueio definitivo.
      </P>

      <H2>Pagamentos</H2>
      <P>
        Os ganhos são acumulados em moeda interna (Kz). Levantamentos são pedidos pela carteira e
        processados manualmente em prazo razoável.
      </P>
    </LegalPage>
  );
}
