import { LegalPage, H2, P, UL } from "./LegalLayout";

export default function Privacy() {
  return (
    <LegalPage title="Política de Privacidade" updated="22/04/2026">
      <H2>Dados que recolhemos</H2>
      <UL>
        <li>Nome e username</li>
        <li>Email e/ou telefone</li>
        <li>Data de nascimento e género (se fornecidos)</li>
        <li>Conteúdo que publicas (vídeos, fotos, mensagens)</li>
        <li>Dados de uso (visualizações, interações, dispositivo)</li>
      </UL>

      <H2>Como usamos os dados</H2>
      <UL>
        <li>Operar a aplicação e personalizar a experiência</li>
        <li>Calcular ganhos e prevenir fraude</li>
        <li>Comunicar contigo sobre a tua conta</li>
        <li>Melhorar funcionalidades e segurança</li>
      </UL>

      <H2>Partilha</H2>
      <P>
        Não vendemos dados pessoais. Partilhamos apenas com fornecedores essenciais (alojamento,
        autenticação) sob acordos de confidencialidade.
      </P>

      <H2>Os teus direitos</H2>
      <UL>
        <li>Aceder e editar os teus dados em Configurações → Conta</li>
        <li>Pedir eliminação da conta a qualquer momento</li>
        <li>Exportar o teu conteúdo mediante pedido</li>
      </UL>

      <H2>Cookies e armazenamento local</H2>
      <P>
        Usamos armazenamento local para preferências (tema, acessibilidade) e tokens de sessão.
      </P>

      <H2>Contacto</H2>
      <P>Questões de privacidade: privacidade@chronos.app</P>
    </LegalPage>
  );
}
