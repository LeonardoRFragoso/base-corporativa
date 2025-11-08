import { Link } from 'react-router-dom'

export default function PrivacyExpanded() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Política de Privacidade
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')} | Versão 1.0 - LGPD Compliant
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          {/* Introdução */}
          <section className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600 p-6 rounded-r-lg">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              A <strong>BASE CORPORATIVA</strong> está comprometida em proteger sua privacidade e 
              seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, 
              armazenamos e protegemos suas informações, em conformidade com a <strong>Lei Geral de 
              Proteção de Dados (LGPD - Lei 13.709/2018)</strong> e demais legislações aplicáveis.
            </p>
          </section>

          {/* Seção 1 - Informações do Controlador */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              1. Informações do Controlador de Dados
            </h2>
            <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg">
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <strong>Razão Social:</strong> [RAZÃO SOCIAL DA EMPRESA]<br />
                <strong>CNPJ:</strong> [XX.XXX.XXX/XXXX-XX]<br />
                <strong>Endereço:</strong> [Rua/Av], [Número], [Bairro], [Cidade] - [Estado], CEP: [XXXXX-XXX]<br />
                <strong>E-mail:</strong> contato@basecorporativa.com<br />
                <strong>E-mail para questões de privacidade:</strong> privacidade@basecorporativa.com<br />
                <strong>Encarregado de Proteção de Dados (DPO):</strong> [Nome do DPO]
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 italic">
                * Os dados completos da empresa serão atualizados assim que o processo de abertura for concluído.
              </p>
            </div>
          </section>

          {/* Seção 2 - Dados Coletados */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              2. Dados Pessoais Coletados
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-lg">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  2.1. Dados de Cadastro
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li>Nome completo</li>
                  <li>E-mail</li>
                  <li>Nome de usuário</li>
                  <li>Senha (armazenada de forma criptografada)</li>
                  <li>CPF (quando fornecido no checkout)</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-lg">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  2.2. Dados de Entrega e Cobrança
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li>Endereço completo (rua, número, complemento, bairro, cidade, estado, CEP)</li>
                  <li>Telefone de contato</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-lg">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  2.3. Dados de Navegação
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li>Endereço IP</li>
                  <li>Tipo de navegador e dispositivo</li>
                  <li>Páginas visitadas e tempo de permanência</li>
                  <li>Cookies e tecnologias similares (veja nossa <Link to="/cookies" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">Política de Cookies</Link>)</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-lg">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  2.4. Dados de Transações
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li>Histórico de pedidos</li>
                  <li>Produtos adquiridos</li>
                  <li>Valores pagos</li>
                  <li>Método de pagamento utilizado (não armazenamos dados completos de cartão)</li>
                  <li>Status de entrega</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Continua no próximo arquivo devido ao tamanho... */}
          <div className="bg-info-50 dark:bg-info-900/20 border border-info-300 dark:border-info-700 p-6 rounded-lg mt-8">
            <p className="text-neutral-700 dark:text-neutral-300">
              📄 <strong>Documento completo em desenvolvimento.</strong> Esta é a versão expandida da Política de Privacidade 
              em conformidade com a LGPD. Para visualizar o documento completo, consulte o arquivo 
              <code className="bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded mx-1">ANALISE_CONFORMIDADE_LEGAL.md</code> 
              na raiz do projeto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
