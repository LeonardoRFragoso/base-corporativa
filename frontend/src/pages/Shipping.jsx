export default function Shipping() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-6">Entrega e Frete</h1>
        <div className="space-y-6 text-neutral-700 dark:text-neutral-300">
          <p>Calculamos o frete no carrinho a partir do seu CEP. Os prazos e valores são exibidos durante a compra.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Envios em até 2 dias úteis após a confirmação do pagamento.</li>
            <li>Rastreamento disponibilizado por e-mail.</li>
            <li>Frete grátis para pedidos acima de R$ 200 (quando aplicável).</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
