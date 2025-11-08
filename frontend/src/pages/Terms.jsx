import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Termos de Uso
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          {/* Seção 1 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              1. Aceitação dos Termos
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Ao acessar e usar o site da BASE CORPORATIVA (<strong>www.basecorporativa.store</strong>), 
              você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Se você não 
              concordar com qualquer parte destes termos, não deverá usar nosso site.
            </p>
          </section>

          {/* Seção 2 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              2. Informações da Empresa
            </h2>
            <div className="bg-primary-50 dark:bg-neutral-800 border-l-4 border-primary-600 p-6 rounded-r-lg">
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <strong>Razão Social:</strong> [RAZÃO SOCIAL DA EMPRESA]<br />
                <strong>CNPJ:</strong> [XX.XXX.XXX/XXXX-XX]<br />
                <strong>Endereço:</strong> [Rua/Av], [Número], [Bairro], [Cidade] - [Estado], CEP: [XXXXX-XXX]<br />
                <strong>E-mail:</strong> contato@basecorporativa.com<br />
                <strong>Telefone:</strong> (11) 99999-9999
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 italic">
                * Os dados completos da empresa serão atualizados assim que o processo de abertura for concluído.
              </p>
            </div>
          </section>

          {/* Seção 3 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              3. Cadastro e Conta de Usuário
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Para realizar compras em nosso site, você deve criar uma conta fornecendo informações 
              verdadeiras, precisas e completas. Você é responsável por:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Manter a confidencialidade de sua senha</li>
              <li>Todas as atividades que ocorrem em sua conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              <li>Atualizar suas informações cadastrais quando necessário</li>
            </ul>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-4">
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos ou 
              que apresentem atividades suspeitas ou fraudulentas.
            </p>
          </section>

          {/* Seção 4 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              4. Produtos e Preços
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>4.1. Descrição dos Produtos:</strong> Fazemos todos os esforços para exibir 
              com precisão as cores e imagens de nossos produtos. No entanto, não podemos garantir 
              que a exibição em seu monitor seja precisa.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>4.2. Preços:</strong> Todos os preços estão em Reais (BRL) e podem estar 
              sujeitos a alterações sem aviso prévio. Os preços válidos são aqueles exibidos no 
              momento da finalização da compra.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>4.3. Disponibilidade:</strong> Todos os produtos estão sujeitos à disponibilidade. 
              Reservamo-nos o direito de limitar as quantidades de qualquer produto que oferecemos.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <strong>4.4. Erros:</strong> Em caso de erro na precificação ou descrição de produtos, 
              reservamo-nos o direito de cancelar pedidos, mesmo após a confirmação do pagamento, 
              com reembolso integral ao cliente.
            </p>
          </section>

          {/* Seção 5 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              5. Pedidos e Pagamentos
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>5.1. Confirmação:</strong> Ao fazer um pedido, você receberá um e-mail de 
              confirmação. A confirmação não significa aceitação do pedido, apenas que recebemos sua solicitação.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>5.2. Pagamento:</strong> Aceitamos as formas de pagamento exibidas no checkout. 
              O processamento é realizado através do Mercado Pago, um gateway de pagamento certificado.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>5.3. Recusa:</strong> Reservamo-nos o direito de recusar qualquer pedido por 
              qualquer motivo, incluindo, mas não se limitando a: disponibilidade de produtos, erros 
              na descrição ou preço, ou suspeita de fraude.
            </p>
          </section>

          {/* Seção 6 - DIREITO DE ARREPENDIMENTO */}
          <section className="bg-warning-50 dark:bg-warning-900/20 border-2 border-warning-400 dark:border-warning-600 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              6. Direito de Arrependimento (CDC Art. 49)
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong className="text-warning-700 dark:text-warning-400">
                Você tem o direito de desistir da compra em até 7 (sete) dias corridos a partir 
                da data de recebimento do produto, sem necessidade de justificativa.
              </strong>
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>Como exercer o direito:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300 mb-4">
              <li>Entre em contato através do e-mail: contato@basecorporativa.com</li>
              <li>Informe o número do pedido e o motivo da desistência (opcional)</li>
              <li>O produto deve estar em perfeitas condições, sem uso, com etiquetas e embalagem original</li>
              <li>Você será reembolsado integralmente, incluindo o valor do frete pago</li>
            </ul>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <strong>Prazo de reembolso:</strong> O reembolso será processado em até 7 (sete) dias 
              úteis após o recebimento do produto devolvido em nossas instalações.
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
              Para mais informações, consulte nossa página de{' '}
              <Link to="/returns" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                Trocas e Devoluções
              </Link>.
            </p>
          </section>

          {/* Seção 7 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              7. Entrega
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>7.1. Prazo:</strong> Os prazos de entrega são estimados e começam a contar 
              após a confirmação do pagamento. Não nos responsabilizamos por atrasos causados por 
              transportadoras ou eventos fora de nosso controle.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>7.2. Frete:</strong> O valor do frete é calculado com base no CEP de destino 
              e será informado antes da finalização da compra.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <strong>7.3. Endereço:</strong> É responsabilidade do cliente fornecer um endereço 
              correto e completo. Não nos responsabilizamos por entregas não realizadas devido a 
              informações incorretas.
            </p>
          </section>

          {/* Seção 8 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              8. Propriedade Intelectual
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Todo o conteúdo deste site, incluindo textos, gráficos, logos, ícones, imagens, 
              clipes de áudio e software, é propriedade da BASE CORPORATIVA ou de seus fornecedores 
              de conteúdo e está protegido por leis de direitos autorais.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              É proibido reproduzir, distribuir, modificar ou criar trabalhos derivados sem 
              autorização expressa por escrito.
            </p>
          </section>

          {/* Seção 9 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              9. Privacidade e Proteção de Dados
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Sua privacidade é importante para nós. O uso de suas informações pessoais é regido 
              por nossa{' '}
              <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                Política de Privacidade
              </Link>, que está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Ao usar nosso site, você consente com a coleta e uso de informações conforme descrito 
              em nossa Política de Privacidade.
            </p>
          </section>

          {/* Seção 10 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              10. Limitação de Responsabilidade
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Na máxima extensão permitida por lei, a BASE CORPORATIVA não será responsável por 
              quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, 
              incluindo, sem limitação, perda de lucros, dados, uso ou outras perdas intangíveis.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Nossa responsabilidade total não excederá o valor pago pelo produto em questão.
            </p>
          </section>

          {/* Seção 11 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              11. Uso Proibido
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Você concorda em não usar o site para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
              <li>Violar qualquer lei ou regulamento local, estadual, nacional ou internacional</li>
              <li>Transmitir material que seja abusivo, ameaçador, obsceno, difamatório ou ilegal</li>
              <li>Tentar obter acesso não autorizado ao site ou sistemas relacionados</li>
              <li>Interferir ou interromper o site ou servidores conectados ao site</li>
              <li>Usar o site para fins comerciais não autorizados</li>
              <li>Coletar informações de outros usuários sem consentimento</li>
            </ul>
          </section>

          {/* Seção 12 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              12. Modificações dos Termos
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
              As alterações entrarão em vigor imediatamente após a publicação no site.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              É sua responsabilidade revisar periodicamente estes termos. O uso continuado do 
              site após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          {/* Seção 13 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              13. Rescisão
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Podemos suspender ou encerrar seu acesso ao site imediatamente, sem aviso prévio, 
              por qualquer motivo, incluindo violação destes Termos de Uso. Após a rescisão, 
              seu direito de usar o site cessará imediatamente.
            </p>
          </section>

          {/* Seção 14 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              14. Lei Aplicável e Foro
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil, 
              especialmente pelo Código de Defesa do Consumidor (Lei 8.078/1990), Marco Civil 
              da Internet (Lei 12.965/2014) e LGPD (Lei 13.709/2018).
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Fica eleito o foro da comarca de [CIDADE/ESTADO] para dirimir quaisquer controvérsias 
              decorrentes destes termos, sem prejuízo do foro do domicílio do consumidor.
            </p>
          </section>

          {/* Seção 15 */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              15. Contato
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg">
              <p className="text-neutral-700 dark:text-neutral-300">
                <strong>E-mail:</strong> contato@basecorporativa.com<br />
                <strong>Telefone:</strong> (11) 99999-9999<br />
                <strong>Horário de atendimento:</strong> Segunda a Sexta, 9h às 18h
              </p>
            </div>
          </section>

          {/* Seção 16 */}
          <section className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              16. Disposições Gerais
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>16.1.</strong> Se qualquer disposição destes termos for considerada inválida 
              ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              <strong>16.2.</strong> Nossa falha em exercer ou fazer valer qualquer direito ou 
              disposição destes termos não constituirá renúncia a tal direito ou disposição.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <strong>16.3.</strong> Estes Termos de Uso constituem o acordo integral entre você 
              e a BASE CORPORATIVA em relação ao uso do site.
            </p>
          </section>

          {/* Rodapé */}
          <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-8 mt-12">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
              Ao continuar navegando e usando nosso site, você declara ter lido, compreendido 
              e concordado com estes Termos de Uso.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center mt-4">
              Versão 1.0 - Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
