import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

/**
 * FAQ - Perguntas Frequentes com Accordion
 */
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'Qual o melhor corte de camisa para mim?',
      answer: 'Depende do seu estilo! As camisas **Básicas** são ideais para looks clássicos e formais. As **Oversized** oferecem mais conforto e estilo moderno. As **Longline** alongam a silhueta e são perfeitas para looks despojados. As **Premium** combinam todos os benefícios com tecidos superiores.'
    },
    {
      question: 'Como funciona o processo de troca?',
      answer: 'Você tem **30 dias** após receber o pedido para solicitar troca ou devolução. Basta acessar "Meus Pedidos", selecionar o item e escolher o motivo. Enviaremos uma etiqueta de devolução gratuita. Após recebermos o produto, processamos a troca em até 5 dias úteis.'
    },
    {
      question: 'As camisas encolhem na lavagem?',
      answer: 'Não! Todos os nossos tecidos passam por processo de **pré-encolhimento** antes da confecção. Recomendamos lavar em água fria e evitar secadora para manter a qualidade premium por mais tempo. Seguindo essas orientações, suas camisas manterão o tamanho original.'
    },
    {
      question: 'Qual o prazo de entrega para minha região?',
      answer: 'O prazo médio é de **5-10 dias úteis** após a confirmação do pagamento. Para regiões Sul e Sudeste: 5-7 dias. Centro-Oeste e Nordeste: 7-10 dias. Norte: 8-12 dias. Você receberá código de rastreamento por e-mail assim que o pedido for despachado.'
    },
    {
      question: 'Vocês fazem vendas para empresas (atacado)?',
      answer: 'Sim! Oferecemos condições especiais para pedidos corporativos acima de 20 unidades. Entre em contato via WhatsApp ou e-mail (contato@basecorporativa.store) informando a quantidade desejada e receberá um orçamento personalizado com descontos progressivos.'
    },
    {
      question: 'Quais formas de pagamento vocês aceitam?',
      answer: 'Aceitamos **Cartão de Crédito** (até 3x sem juros), **PIX** (com 5% de desconto) e **Boleto Bancário**. Todas as transações são processadas de forma 100% segura através do Mercado Pago.'
    },
    {
      question: 'Como sei qual tamanho escolher?',
      answer: 'Cada produto possui uma **tabela de medidas detalhada** com busto, comprimento e ombros. Recomendamos medir uma camisa que você já tenha e goste do caimento, comparando com nossa tabela. Em caso de dúvida, nossa equipe está disponível para ajudar via WhatsApp!'
    },
    {
      question: 'Os produtos têm garantia?',
      answer: 'Sim! Todas as camisas têm **garantia de 30 dias** contra defeitos de fabricação. Se identificar qualquer problema de costura, tecido ou acabamento, faremos a troca imediata sem custo adicional. Sua satisfação é nossa prioridade!'
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-28 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Tire suas dúvidas antes de comprar
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-neutral-500 dark:text-neutral-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {faq.answer.split('**').map((part, i) => 
                    i % 2 === 0 ? (
                      <span key={i}>{part}</span>
                    ) : (
                      <strong key={i} className="text-primary-600 dark:text-primary-400 font-semibold">
                        {part}
                      </strong>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Não encontrou sua dúvida?
          </p>
          <a
            href="https://wa.me/5511999999999?text=Olá! Tenho uma dúvida sobre os produtos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
