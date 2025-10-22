export default function FAQ() {
  const faqs = [
    { q: 'Como acompanho meu pedido?', a: 'Você recebe um link de rastreio por e-mail após a postagem.' },
    { q: 'Quais formas de pagamento são aceitas?', a: 'Cartão de crédito e boleto/PIX via Mercado Pago.' },
    { q: 'Como solicitar troca?', a: 'Envie um e-mail para contato@basecorporativa.com com o número do pedido.' },
  ]
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-6">FAQ</h1>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-lg shadow-soft p-5">
              <div className="font-semibold text-primary-950 mb-2">{f.q}</div>
              <div className="text-neutral-700">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
