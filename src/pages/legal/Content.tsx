import { LegalPage, H2, P, UL } from "./LegalLayout";

export default function Content() {
  return (
    <LegalPage title="Política de Conteúdo" updated="22/04/2026">
      <H2>Permitido</H2>
      <UL>
        <li>Vídeos e fotos originais</li>
        <li>Conteúdo criativo, educativo, humorístico</li>
        <li>Opiniões respeitosas e debate construtivo</li>
      </UL>

      <H2>Proibido</H2>
      <UL>
        <li>Fraude, esquemas piramidais ou enganos</li>
        <li>Spam, conteúdo repetitivo ou automatizado</li>
        <li>Conteúdo ilegal, violento ou que incite ao ódio</li>
        <li>Material sexualmente explícito ou pornografia</li>
        <li>Violação de direitos de autor de terceiros</li>
      </UL>

      <H2>Ações</H2>
      <P>Quando o conteúdo viola esta política aplicamos:</P>
      <UL>
        <li>Remoção do conteúdo</li>
        <li>Aviso ao autor</li>
        <li>Limitação ou suspensão da conta em casos graves ou reincidência</li>
      </UL>

      <H2>Apelar</H2>
      <P>
        Se discordares de uma decisão podes apelar via suporte@chronos.app. Cada apelo é revisto por
        um humano.
      </P>
    </LegalPage>
  );
}
