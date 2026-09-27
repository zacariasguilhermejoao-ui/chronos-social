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
        <li>Qualquer manipulação (visualizações falsas, contas múltiplas, bots) leva a perda de ganhos e suspensão</li>
        <li>Taxas e percentagens podem ser ajustadas com aviso prévio</li>
      </UL>

      <H2>3. Conteúdo</H2>
      <P>
        Manténs os direitos sobre o conteúdo que publicas, mas concedes à Chrónos uma licença para
        o apresentar e distribuir na plataforma.
      </P>

      <H2>4. Contas</H2>
      <UL>
        <li>És responsável pela segurança da tua conta</li>
        <li>Podes pedir eliminação a qualquer momento</li>
        <li>Contas inativas podem ser removidas após período prolongado</li>
      </UL>

      <H2>5. Limitação de responsabilidade</H2>
      <P>
        A Chrónos é fornecida "tal como está". Não garantimos disponibilidade contínua nem ganhos
        mínimos.
      </P>

      <H2>6. Contacto</H2>
      <P>suporte@chronos.app</P>
    </LegalPage>
  );
}
