export default function Returns() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Trocas e Devoluções
        </h1>

        <div className="space-y-8">
          {/* DIREITO DE ARREPENDIMENTO - DESTAQUE */}
          <section className="bg-warning-50 dark:bg-warning-900/20 border-2 border-warning-400 dark:border-warning-600 p-6 sm:p-8 rounded-2xl shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-warning-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                  ⚖️ Direito de Arrependimento (CDC Art. 49)
                </h2>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                  <strong className="text-warning-700 dark:text-warning-400">
                    Você tem o direito de desistir da compra em até 7 (sete) dias corridos a partir 
                    da data de recebimento do produto, sem necessidade de justificativa.
                  </strong>
                </p>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Este é um direito garantido pelo Código de Defesa do Consumidor para compras 
                  realizadas fora do estabelecimento comercial (internet, telefone, etc.).
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl mt-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Como Exercer o Direito de Arrependimento:
              </h3>
              <ol className="list-decimal pl-6 space-y-3 text-neutral-700 dark:text-neutral-300">
                <li>
                  <strong>Entre em contato:</strong> Envie um e-mail para{' '}
                  <a href="mailto:contato@basecorporativa.com" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                    contato@basecorporativa.com
                  </a>
                  {' '}ou ligue para (11) 99999-9999
                </li>
                <li>
                  <strong>Informe:</strong> Número do pedido e que deseja exercer o direito de arrependimento 
                  (não precisa justificar)
                </li>
                <li>
                  <strong>Devolução:</strong> O produto deve estar em perfeitas condições, sem uso, 
                  com etiquetas e embalagem original
                </li>
                <li>
                  <strong>Envio:</strong> Orientaremos sobre o procedimento de devolução. 
                  O custo do frete de devolução será por nossa conta
                </li>
                <li>
                  <strong>Reembolso:</strong> Você será reembolsado integralmente (produto + frete original) 
                  em até 7 dias úteis após recebermos o produto
                </li>
              </ol>
            </div>
          </section>

          {/* POLÍTICA DE TROCAS */}
          <section className="bg-white dark:bg-neutral-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              🔄 Política de Trocas
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Prazo para Trocas
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Você pode solicitar troca em até <strong>30 dias após o recebimento</strong>, 
                  desde que o produto esteja sem uso, com etiquetas e embalagem original.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Motivos para Troca
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li><strong>Tamanho incorreto:</strong> Troca gratuita por outro tamanho disponível</li>
                  <li><strong>Cor diferente:</strong> Troca gratuita por outra cor disponível</li>
                  <li><strong>Defeito de fabricação:</strong> Troca ou reembolso integral, incluindo frete</li>
                  <li><strong>Produto errado:</strong> Troca ou reembolso integral, incluindo frete</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Como Solicitar Troca
                </h3>
                <ol className="list-decimal pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li>Entre em contato: <a href="mailto:contato@basecorporativa.com" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">contato@basecorporativa.com</a></li>
                  <li>Informe o número do pedido e o motivo da troca</li>
                  <li>Aguarde nossas orientações sobre o envio</li>
                  <li>Envie o produto conforme instruções</li>
                  <li>Receba o novo produto em até 15 dias úteis</li>
                </ol>
              </div>
            </div>
          </section>

          {/* POLÍTICA DE DEVOLUÇÕES */}
          <section className="bg-white dark:bg-neutral-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              💰 Política de Devoluções e Reembolso
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Quando Solicitar Devolução
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li>Exercício do direito de arrependimento (7 dias)</li>
                  <li>Produto com defeito de fabricação</li>
                  <li>Produto errado ou danificado no transporte</li>
                  <li>Desistência da compra (dentro do prazo)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Prazo de Reembolso
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                  O reembolso será processado em até <strong>7 dias úteis</strong> após o recebimento 
                  do produto devolvido em nossas instalações.
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                  * O prazo para o valor aparecer na sua conta pode variar de acordo com a operadora 
                  do cartão ou banco (geralmente 1-2 faturas para cartão de crédito).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Forma de Reembolso
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  O reembolso será feito na mesma forma de pagamento utilizada na compra:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300 mt-3">
                  <li><strong>Cartão de crédito:</strong> Estorno na fatura</li>
                  <li><strong>PIX:</strong> Devolução para a mesma conta</li>
                  <li><strong>Boleto:</strong> Transferência bancária (informe seus dados)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CONDIÇÕES GERAIS */}
          <section className="bg-primary-50 dark:bg-primary-900/20 p-6 sm:p-8 rounded-2xl border border-primary-200 dark:border-primary-700">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              📋 Condições Gerais
            </h2>
            <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
                <span>Produtos devem estar sem uso, com etiquetas e embalagem original</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
                <span>Não aceitamos trocas ou devoluções de produtos com sinais de uso</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
                <span>Produtos em promoção seguem a mesma política</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
                <span>Frete de devolução é gratuito em casos de defeito ou erro nosso</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
                <span>Para trocas por preferência, o frete fica por conta do cliente</span>
              </li>
            </ul>
          </section>

          {/* CONTATO */}
          <section className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-xl text-center">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Precisa de Ajuda?
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 mb-4">
              Nossa equipe está pronta para ajudar com trocas e devoluções
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:contato@basecorporativa.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar E-mail
              </a>
              <a 
                href="tel:+5511999999999"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (11) 99999-9999
              </a>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
              Horário de atendimento: Segunda a Sexta, 9h às 18h
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
