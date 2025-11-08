export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Política de Cookies
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          {/* Introdução */}
          <section className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600 p-6 rounded-r-lg">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Esta Política de Cookies explica o que são cookies, como os usamos e como você pode 
              controlá-los. Ao usar nosso site, você concorda com o uso de cookies conforme descrito 
              nesta política.
            </p>
          </section>

          {/* O que são Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              1. O que são Cookies?
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, 
              tablet ou celular) quando você visita um site. Eles são amplamente utilizados para fazer 
              os sites funcionarem de forma mais eficiente e fornecer informações aos proprietários do site.
            </p>
          </section>

          {/* Tipos de Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              2. Tipos de Cookies que Utilizamos
            </h2>

            <div className="space-y-4">
              <div className="bg-success-50 dark:bg-success-900/20 border-l-4 border-success-600 p-5 rounded-r-lg">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  2.1. Cookies Essenciais (Necessários)
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                  Estes cookies são estritamente necessários para o funcionamento do site e não podem 
                  ser desativados em nossos sistemas.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-neutral-700 dark:text-neutral-300">
                  <li><strong>Autenticação:</strong> Mantém você conectado durante a sessão</li>
                  <li><strong>Segurança:</strong> Proteção CSRF e validação de sessão</li>
                  <li><strong>Carrinho de compras:</strong> Armazena itens no seu carrinho</li>
                  <li><strong>Preferências:</strong> Lembra suas escolhas (ex: tema escuro/claro)</li>
                </ul>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                  <strong>Duração:</strong> Sessão ou até 7 dias<br />
                  <strong>Base Legal:</strong> Legítimo interesse (necessários para o serviço)
                </p>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600 p-5 rounded-r-lg">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  2.2. Cookies de Funcionalidade
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                  Permitem que o site lembre suas escolhas e forneça recursos aprimorados e mais personalizados.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-neutral-700 dark:text-neutral-300">
                  <li>Preferências de idioma</li>
                  <li>Configurações de exibição</li>
                  <li>Produtos visualizados recentemente</li>
                </ul>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                  <strong>Duração:</strong> Até 12 meses<br />
                  <strong>Base Legal:</strong> Consentimento
                </p>
              </div>

              <div className="bg-warning-50 dark:bg-warning-900/20 border-l-4 border-warning-600 p-5 rounded-r-lg">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  2.3. Cookies de Desempenho e Análise
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                  Coletam informações sobre como os visitantes usam nosso site, permitindo-nos melhorar 
                  a experiência do usuário.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-neutral-700 dark:text-neutral-300">
                  <li>Páginas mais visitadas</li>
                  <li>Tempo de permanência</li>
                  <li>Erros encontrados</li>
                  <li>Origem do tráfego</li>
                </ul>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                  <strong>Duração:</strong> Até 24 meses<br />
                  <strong>Base Legal:</strong> Consentimento
                </p>
              </div>
            </div>
          </section>

          {/* Cookies Específicos */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              3. Cookies Específicos Utilizados
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <thead className="bg-neutral-100 dark:bg-neutral-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Finalidade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Duração</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">access_token</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">Autenticação JWT</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">24 horas</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">Essencial</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">cart_session</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">Carrinho de compras</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">7 dias</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">Essencial</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">theme_preference</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">Tema escuro/claro</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">12 meses</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">Funcionalidade</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">cookie_consent</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">Registro de consentimento</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">12 meses</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">Essencial</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* LocalStorage */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              4. LocalStorage e SessionStorage
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Além de cookies, utilizamos tecnologias de armazenamento local do navegador:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li><strong>LocalStorage:</strong> Armazena preferências e dados de sessão que persistem após fechar o navegador</li>
              <li><strong>SessionStorage:</strong> Armazena dados temporários apenas durante a sessão de navegação</li>
            </ul>
          </section>

          {/* Gerenciar Cookies */}
          <section className="bg-warning-50 dark:bg-warning-900/20 border-2 border-warning-400 dark:border-warning-600 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              5. Como Gerenciar e Desativar Cookies
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Você pode controlar e/ou excluir cookies conforme desejar. Você pode excluir todos os 
              cookies que já estão no seu computador e configurar a maioria dos navegadores para 
              impedir que sejam colocados.
            </p>

            <div className="space-y-3 mb-4">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Google Chrome
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Configurações → Privacidade e segurança → Cookies e outros dados do site
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Mozilla Firefox
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Opções → Privacidade e Segurança → Cookies e dados de sites
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Safari
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Preferências → Privacidade → Gerenciar dados de sites
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Microsoft Edge
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Configurações → Cookies e permissões de site → Gerenciar e excluir cookies
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
              ⚠️ <strong>Atenção:</strong> Desativar cookies pode afetar a funcionalidade do site e 
              sua experiência de navegação. Alguns recursos podem não funcionar corretamente.
            </p>
          </section>

          {/* Cookies de Terceiros */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              6. Cookies de Terceiros
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li><strong>Mercado Pago:</strong> Para processar pagamentos de forma segura</li>
              <li><strong>Melhor Envio:</strong> Para cálculo e rastreamento de frete</li>
            </ul>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-4">
              Esses terceiros têm suas próprias políticas de privacidade e cookies. Não temos controle 
              sobre esses cookies.
            </p>
          </section>

          {/* Atualizações */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              7. Atualizações desta Política
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em 
              nossas práticas ou por outros motivos operacionais, legais ou regulatórios. Recomendamos 
              que você revise esta página regularmente.
            </p>
          </section>

          {/* Contato */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              8. Contato
            </h2>
            <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg">
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato:
              </p>
              <p className="text-neutral-700 dark:text-neutral-300">
                <strong>E-mail:</strong> privacidade@basecorporativa.com<br />
                <strong>E-mail alternativo:</strong> contato@basecorporativa.com
              </p>
            </div>
          </section>

          {/* Rodapé */}
          <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-8 mt-12">
            <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center">
              Versão 1.0 - Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
