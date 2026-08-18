export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm">T&A</div>
            <h1 className="text-xl font-bold text-gray-900">Termos de Uso</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
        <p className="mt-2 text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="mt-8 space-y-6 rounded-lg border bg-white p-6">
          <section>
            <h2 className="text-xl font-semibold">1. Aceitação</h2>
            <p className="mt-2 text-gray-700">
              Ao acessar e utilizar o sistema T&A Serv Ind, você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não utilize o sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Uso do Sistema</h2>
            <p className="mt-2 text-gray-700">
              O sistema é fornecido para fins de gestão de manutenção industrial. Você se compromete a:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a confidencialidade das credenciais de acesso</li>
              <li>Não utilizar o sistema para fins ilícitos</li>
              <li>Respeitar a legislação aplicável, incluindo a LGPD</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Propriedade Intelectual</h2>
            <p className="mt-2 text-gray-700">
              Todos os direitos de propriedade intelectual do sistema, incluindo código, design e conteúdo, pertencem à T&A Serv Ind. É proibida a reprodução não autorizada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Limitação de Responsabilidade</h2>
            <p className="mt-2 text-gray-700">
              O sistema é fornecido "como está". Não garantimos disponibilidade contínua ou ausência de erros. A responsabilidade está limitada ao máximo permitido pela lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Alterações</h2>
            <p className="mt-2 text-gray-700">
              Estes termos podem ser atualizados a qualquer momento. O uso contínuo do sistema após alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Contato</h2>
            <p className="mt-2 text-gray-700">
              Para questões sobre estes termos, entre em contato: contato@tindserv.com
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
