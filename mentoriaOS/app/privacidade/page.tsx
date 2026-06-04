import Link from "next/link"
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome"

export const metadata = {
  title: "Política de Privacidade — CKlareza",
  description: "Como coletamos, usamos e protegemos seus dados pessoais na plataforma CKlareza, em conformidade com a LGPD.",
}

const UPDATED = "04 de junho de 2026"

export default function PrivacidadePage() {
  return (
    <div style={{ background: "#0a1420", color: "#fff" }} className="min-h-screen">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-sm mb-10" style={{ color: "#7fa0bd" }}>Última atualização: {UPDATED}</p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "#b8d0e8" }}>

          <Section title="1. Quem somos">
            <p>A <strong className="text-white">CKlareza</strong> (nome fantasia, CNPJ em processo de abertura) é uma plataforma de gestão de mentoria white-label. Neste documento, "CKlareza", "nós" ou "plataforma" se referem ao serviço disponível em <strong className="text-white">cklareza.com</strong>.</p>
            <p className="mt-3">Para dúvidas sobre privacidade ou exercício de direitos, entre em contato com nosso encarregado de dados (DPO) pelo e-mail <strong className="text-white">contactus@cklareza.com</strong>.</p>
          </Section>

          <Section title="2. Dados que coletamos">
            <p>Coletamos os seguintes dados pessoais, conforme o papel do usuário:</p>
            <ul className="mt-3 space-y-2 list-none pl-0">
              <Item label="Mentores"><strong>Nome, e-mail, foto de perfil, nicho e metodologia de trabalho.</strong> Necessários para criação e identificação da conta.</Item>
              <Item label="Mentorados"><strong>Nome, e-mail, telefone, cidade, dados de negócio (faturamento, nicho, metas), check-ins semanais, histórico de tarefas, sessões realizadas e mensagens trocadas com o mentor.</strong></Item>
              <Item label="Dados de uso"><strong>Logs de acesso e interação</strong> para segurança e melhoria contínua do serviço.</Item>
            </ul>
          </Section>

          <Section title="3. Finalidade e base legal (LGPD)">
            <table className="w-full text-xs mt-3 border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid #1e3450" }}>
                  <th className="text-left py-2 pr-4 font-semibold text-white">Finalidade</th>
                  <th className="text-left py-2 font-semibold text-white">Base legal (LGPD art. 7)</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {[
                  ["Prestar o serviço de gestão de mentoria", "Execução de contrato — inciso II"],
                  ["Exibir dados do mentorado ao seu mentor", "Execução de contrato — inciso II"],
                  ["Autenticação e segurança da conta", "Legítimo interesse — inciso IX"],
                  ["Melhorias e desenvolvimento do produto", "Legítimo interesse — inciso IX"],
                  ["Comunicações sobre o serviço", "Consentimento — inciso I"],
                ].map(([fin, base]) => (
                  <tr key={fin} style={{ borderBottom: "1px solid #1a2e45" }}>
                    <td className="py-2 pr-4">{fin}</td>
                    <td className="py-2">{base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="4. Compartilhamento de dados">
            <p>Seus dados <strong className="text-white">não são vendidos nem compartilhados com terceiros</strong> para fins comerciais. Compartilhamos apenas com:</p>
            <ul className="mt-3 space-y-2 list-none">
              <Item label="Seu mentor">O mentor responsável pela sua mentoria tem acesso aos seus dados cadastrais e de progresso.</Item>
              <Item label="Supabase (banco de dados)">Infraestrutura de armazenamento (GDPR-compliant, servidores no Brasil/EUA).</Item>
              <Item label="Vercel (hospedagem)">Infraestrutura de entrega da aplicação (SOC 2 Type 2).</Item>
              <Item label="Autoridades competentes">Quando exigido por lei ou ordem judicial.</Item>
            </ul>
          </Section>

          <Section title="5. Retenção dos dados">
            <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após o encerramento:</p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>Dados de mensagens e check-ins são excluídos em até <strong className="text-white">30 dias</strong>.</li>
              <li>Dados financeiros são mantidos por <strong className="text-white">5 anos</strong> para fins fiscais/contábeis, conforme legislação brasileira.</li>
              <li>Após este prazo, todos os dados são anonimizados ou excluídos permanentemente.</li>
            </ul>
          </Section>

          <Section title="6. Seus direitos (LGPD — art. 18)">
            <p>Você tem os seguintes direitos sobre seus dados pessoais:</p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ["Acesso", "Saber quais dados temos sobre você."],
                ["Portabilidade", "Receber seus dados em formato legível (JSON)."],
                ["Correção", "Corrigir dados incompletos, inexatos ou desatualizados."],
                ["Exclusão", "Solicitar a exclusão de dados desnecessários ou tratados com seu consentimento."],
                ["Revogação de consentimento", "Retirar consentimento a qualquer momento, sem prejuízo dos tratamentos anteriores."],
                ["Informação", "Saber com quais entidades seus dados são compartilhados."],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-xl p-4" style={{ background: "#0f2030", border: "1px solid #1e3450" }}>
                  <p className="font-semibold text-white text-xs">{title}</p>
                  <p className="mt-1 text-xs" style={{ color: "#7fa0bd" }}>{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">Para exercer qualquer direito, envie um e-mail para <strong className="text-white">contactus@cklareza.com</strong> com o assunto <strong className="text-white">"[LGPD] + seu direito"</strong>. Responderemos em até <strong className="text-white">15 dias úteis</strong>. Você também pode exportar ou solicitar a exclusão dos seus dados diretamente pelo portal ou painel do mentor.</p>
          </Section>

          <Section title="7. Segurança">
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>Autenticação via Supabase Auth (Google OAuth + e-mail/senha com bcrypt).</li>
              <li>Todas as comunicações criptografadas com TLS/HTTPS.</li>
              <li>Acesso por papel: cada mentor vê apenas seus próprios mentorados; cada mentorado acessa somente os próprios dados.</li>
              <li>Chaves e variáveis sensíveis armazenadas em ambiente seguro (Vercel Secrets), nunca expostas no código.</li>
            </ul>
          </Section>

          <Section title="8. Cookies e armazenamento local">
            <p>Utilizamos cookies de sessão (Supabase Auth) e armazenamento local (<code className="px-1 rounded text-xs" style={{ background: "#1e3450" }}>localStorage</code>) para:</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Manter a sessão autenticada do mentor.</li>
              <li>Registrar preferências locais (idioma, sidebar, mentor selecionado).</li>
              <li>Armazenar o código de acesso do mentorado no portal.</li>
            </ul>
            <p className="mt-2">Não utilizamos cookies de rastreamento ou publicidade.</p>
          </Section>

          <Section title="9. Alterações nesta política">
            <p>Poderemos atualizar esta política periodicamente. Quando houver mudanças relevantes, notificaremos por e-mail ou mediante aviso na plataforma. A data da última atualização é sempre indicada no topo deste documento.</p>
          </Section>

          <Section title="10. Contato">
            <p>Encarregado de Proteção de Dados (DPO): <strong className="text-white">contactus@cklareza.com</strong><br />WhatsApp: <strong className="text-white">+55 48 97400-1405</strong></p>
          </Section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-sm" style={{ color: "#7fa0bd" }}>← Voltar ao início</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-white mb-3" style={{ borderBottom: "1px solid #1e3450", paddingBottom: "8px" }}>{title}</h2>
      {children}
    </section>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="font-semibold text-white shrink-0">{label}:</span>
      <span>{children}</span>
    </li>
  )
}
