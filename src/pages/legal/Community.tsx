import { LegalPage, H2, P, UL } from "./LegalLayout";

export default function Community() {
  return (
    <LegalPage title="Política de Comunidade" updated="22/04/2026">
      <H2>Objetivo</H2>
      <P>
        Construir uma comunidade justa, segura e interessante onde criadores e espectadores se
        sentem respeitados.
      </P>

      <H2>Princípios</H2>
      <UL>
        <li><strong>Respeito:</strong> trata os outros como gostarias de ser tratado</li>
        <li><strong>Liberdade com responsabilidade:</strong> expressa-te sem prejudicar outros</li>
        <li><strong>Transparência:</strong> avisamos antes de aplicar penalizações sempre que possível</li>
        <li><strong>Mérito:</strong> ganhos refletem atividade real, não atalhos</li>
      </UL>

      <H2>Denunciar</H2>
      <P>
        Vê algo que viola estas regras? Usa o botão de denúncia no perfil ou conteúdo, ou escreve
        para suporte@chronos.app.
      </P>

      <H2>Decisões</H2>
      <P>
        Quando possível, aplicamos um sistema gradual: aviso → limitação → suspensão. Decisões
        graves podem ser apeladas.
      </P>
    </LegalPage>
  );
}
