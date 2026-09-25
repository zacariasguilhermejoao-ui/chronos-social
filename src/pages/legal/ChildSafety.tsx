import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const SAFETY_GREEN = "#15F59D";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display font-bold text-base mt-4 first:mt-0">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{children}</ul>;
}

export default function ChildSafety() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="w-9 h-9 rounded-full glass grid place-items-center"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl">Política de Segurança Infantil</h1>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 mb-4 border"
          style={{
            background: `linear-gradient(135deg, ${SAFETY_GREEN}1a, transparent)`,
            borderColor: `${SAFETY_GREEN}55`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
              style={{ background: SAFETY_GREEN, color: "#001a10" }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm" style={{ color: SAFETY_GREEN }}>
                Child Safety Standards
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                A Chrónos aplica tolerância zero a qualquer forma de exploração,
                abuso ou material sexual envolvendo crianças (CSAE/CSAM).
              </p>
            </div>
          </div>
        </div>

        <article className="glass rounded-2xl p-5 space-y-3">
          <H>1. Compromisso da Chrónos</H>
          <P>
            A Chrónos Social está totalmente empenhada em proteger crianças e
            adolescentes na sua plataforma. Proibimos qualquer conteúdo,
            comportamento ou conta que promova, facilite ou represente exploração
            ou abuso de menores.
          </P>

          <H>2. Idade mínima</H>
          <P>
            É necessário ter pelo menos 13 anos de idade para criar conta na
            Chrónos. Em jurisdições em que a idade mínima legal seja superior,
            aplica-se a idade legal local. Contas de menores identificadas serão
            eliminadas.
          </P>

          <H>3. Conteúdo proibido — CSAE / CSAM</H>
          <P>Não é tolerado, sob nenhuma circunstância, material que:</P>
          <UL>
            <li>Represente sexualmente menores de idade (real, ilustrado, gerado por IA, ou estilizado)</li>
            <li>Faça <em>grooming</em>, alicie ou solicite atividade sexual a menores</li>
            <li>Contenha nudez de menores, mesmo em contexto artístico ou familiar</li>
            <li>Promova, glorifique ou banalize abuso, exploração ou tráfico de menores</li>
            <li>Partilhe informações pessoais de menores (moradas, escolas, contactos)</li>
            <li>Facilite exploração comercial de menores (trabalho infantil, prostituição)</li>
            <li>Contenha assédio, ameaças ou bullying dirigidos a menores</li>
          </UL>

          <H>4. Grooming e aliciamento</H>
          <P>
            É estritamente proibido qualquer contacto de natureza sexual ou de
            aliciamento com pessoas menores de idade — em publicações públicas,
            mensagens privadas, grupos, comentários ou <em>stories</em>. Contas
            com este comportamento são banidas permanentemente e reportadas às
            autoridades competentes.
          </P>

          <H>5. Como denunciar</H>
          <P>
            Qualquer utilizador pode denunciar conteúdo, mensagem, comentário ou
            perfil suspeito através do botão <strong>Denunciar</strong> disponível
            em cada peça de conteúdo. Denúncias envolvendo menores têm prioridade
            máxima e são revistas 24/7.
          </P>
          <P>Contactos diretos:</P>
          <UL>
            <li>
              Email dedicado:{" "}
              <a href="mailto:contato@chronossocial.com" className="underline" style={{ color: SAFETY_GREEN }}>
                contato@chronossocial.com
              </a>
            </li>
            <li>Assunto sugerido: “Child Safety Report”</li>
            <li>Resposta prevista: até 24h úteis</li>
          </UL>

          <H>6. Moderação e deteção</H>
          <P>A Chrónos combina múltiplas camadas para detetar e remover material CSAE/CSAM:</P>
          <UL>
            <li>Filtros automáticos de conteúdo em uploads (imagem e vídeo)</li>
            <li>Análise por moderadores humanos treinados</li>
            <li>Sistema de denúncia pelos utilizadores com resposta prioritária</li>
            <li>Correspondência de <em>hashes</em> conhecidos de CSAM (PhotoDNA e equivalentes)</li>
            <li>Verificação reforçada em contas suspeitas</li>
          </UL>

          <H>7. Ação imediata</H>
          <P>Ao detetarmos conteúdo CSAE/CSAM, agimos imediatamente:</P>
          <UL>
            <li>Remoção do conteúdo em minutos</li>
            <li>Suspensão e eliminação permanente da conta responsável</li>
            <li>Preservação de provas para autoridades</li>
            <li>Reporte a organismos competentes, incluindo NCMEC (quando aplicável) e polícia local</li>
            <li>Bloqueio de tentativas de reingresso (email, IP, dispositivo)</li>
          </UL>

          <H>8. Cooperação com autoridades</H>
          <P>
            A Chrónos coopera plenamente com autoridades policiais e judiciais na
            investigação de crimes contra crianças. Quando legalmente requerido,
            fornecemos registos, metadados e provas técnicas que possam auxiliar
            processos criminais, respeitando sempre o devido processo legal.
          </P>

          <H>9. Prevenção de tráfico de menores</H>
          <P>
            Combatemos ativamente o uso da plataforma para tráfico humano ou
            exploração de menores, incluindo aliciamento para deslocação, oferta
            de “trabalho” fraudulento e transporte não autorizado. Suspeitas
            deste tipo devem ser reportadas de imediato para{" "}
            <a href="mailto:contato@chronossocial.com" className="underline mx-1" style={{ color: SAFETY_GREEN }}>
              contato@chronossocial.com
            </a>
            e, sempre que possível, para as autoridades locais.
          </P>

          <H>10. Educação e prevenção</H>
          <P>
            Publicamos regularmente materiais educativos sobre segurança online,
            reconhecimento de sinais de <em>grooming</em>, uso saudável das redes
            sociais e canais de apoio para crianças, adolescentes, pais e
            educadores.
          </P>

          <H>11. Contactos oficiais</H>
          <UL>
            <li>
              Segurança infantil:{" "}
              <a href="mailto:contato@chronossocial.com" className="underline" style={{ color: SAFETY_GREEN }}>
                contato@chronossocial.com
              </a>
            </li>
            <li>Suporte geral: contato@chronossocial.com</li>
          </UL>

          <p className="text-xs text-muted-foreground pt-3 border-t border-border">
            Última atualização: 29/07/2026. Esta política é revista
            periodicamente e complementa os nossos{" "}
            <Link to="/legal/terms" className="underline">Termos de Uso</Link>,{" "}
            <Link to="/legal/privacy" className="underline">Política de Privacidade</Link>{" "}
            e <Link to="/legal/community" className="underline">Política de Comunidade</Link>.
          </p>
        </article>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/legal" className="underline">Todos os documentos legais</Link>
        </p>
      </div>
    </div>
  );
}
