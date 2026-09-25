import { LegalPage, H2, P, UL } from "./LegalLayout";

export default function Terms() {
  return (
    <LegalPage title="Termos de Uso" updated="22/04/2026">
      <P>
        A Chrónos é uma rede social onde os utilizadores podem publicar conteúdo, interagir e ganhar
        recompensas em moeda virtual ("Kz"). Ao usar a aplicação aceitas estes termos.
      </P>

      <H2>1. Conduta do utilizador</H2>
      <UL>
        <li>Não cometer fraude nem manipular o sistema de ganhos</li>
        <li>Não enganar, assediar ou ameaçar outros utilizadores</li>
        <li>Não publicar conteúdo ilegal, violento ou que viole direitos de terceiros</li>
        <li>Não usar bots, scripts ou automatizações sem autorização</li>
      </UL>

      <H2>2. Monetização</H2>
      <UL>
        <li>Os ganhos dependem de atividade real e válida (visualizações, respostas DM)</li>
        <li>Qualquer manipulação (visualizações falsas, contas duplicadas) é proibida</li>
        <li>Os valores são creditados em moeda interna; levantamentos são processados manualmente</li>
      </UL>

      <H2>3. Penalizações</H2>
      <P>Em caso de violação aplicamos, por ordem de gravidade:</P>
      <UL>
        <li>Aviso por escrito</li>
        <li>Limitação temporária de funcionalidades</li>
        <li>Suspensão da conta</li>
        <li>Eliminação definitiva e bloqueio de futuros registos</li>
      </UL>

      <H2>4. Conteúdo do utilizador</H2>
      <P>
        Manténs a propriedade do conteúdo que publicas. Concedes à Chrónos uma licença não exclusiva
        para o exibir, distribuir e otimizar dentro do serviço.
      </P>

      <H2>5. Alterações</H2>
      <P>
        Podemos atualizar estes termos. Avisaremos com antecedência razoável dentro da app antes de
        mudanças significativas entrarem em vigor.
      </P>
    </LegalPage>
  );
}
