export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm">T&A</div>
            <h1 className="text-xl font-bold text-gray-900">Política de Privacidade</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
        <p className="mt-2 text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="mt-8 space-y-6 rounded-lg border bg-white p-6">
          <section>
            <h2 className="text-xl font-semibold">1. Introdução</h2>
            <p className="mt-2 text-gray-700">
              Esta Política de Privacidade descreve como o sistema T&A Serv Ind coleta, usa, armazena e protege suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Dados Coletados</h2>
            <p className="mt-2 text-gray-700">
              Coletamos apenas os dados necessários para o funcionamento do sistema:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              <li>Dados de identificação: nome, email, cargo</li>
              <li>Dados de autenticação: credenciais de acesso</li>
              <li>Dados operacionais: ordens de serviço, equipamentos, manutenções, estoque</li>
              <li>Dados de navegação: cookies e informações de dispositivo para funcionamento do PWA</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Finalidade do Tratamento</h2>
            <p className="mt-2 text-gray-700">
              Os dados são tratados para as seguintes finalidades:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              <li>Prestação dos serviços de gestão de manutenção industrial</li>
              <li>Autenticação e controle de acesso</li>
              <li>Geração de relatórios e indicadores</li>
              <li>Comunicação sobre o sistema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Compartilhamento</h2>
            <p className="mt-2 text-gray-700">
              Seus dados não são compartilhados com terceiros, exceto quando necessário para a operação do sistema (hospedagem Supabase) ou mediante obrigação legal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Armazenamento e Segurança</h2>
            <p className="mt-2 text-gray-700">
              Os dados são armazenados de forma segura utilizando criptografia e controles de acesso. O período de retenção segue as obrigações legais e fiscais aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Seus Direitos (LGPD)</h2>
            <p className="mt-2 text-gray-700">
              Você tem direito a:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              <li>Confirmação da existência de tratamento de dados</li>
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados</li>
              <li>Eliminação dos dados tratados com consentimento</li>
              <li>Informação sobre compartilhamento de dados</li>
              <li>Revogação do consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Contato</h2>
            <p className="mt-2 text-gray-700">
              Para exercer seus direitos ou esclarecer dúvidas, entre em contato com o encarregado de dados (DPO) através do email: dpo@tindserv.com
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
