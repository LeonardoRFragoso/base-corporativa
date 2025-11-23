import { CreditCard, Smartphone, Barcode, Wallet } from 'lucide-react'

/**
 * Preview visual dos métodos de pagamento aceitos
 */
export default function PaymentMethodsPreview() {
  const methods = [
    {
      icon: Smartphone,
      name: 'PIX',
      description: 'Aprovação instantânea',
      highlight: true,
      badge: 'Popular',
    },
    {
      icon: CreditCard,
      name: 'Cartão',
      description: 'Até 12x sem juros',
      highlight: false,
    },
    {
      icon: Barcode,
      name: 'Boleto',
      description: '3% de desconto',
      highlight: false,
    },
    {
      icon: Wallet,
      name: 'Carteira Digital',
      description: 'Mercado Pago',
      highlight: false,
    },
  ]

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Formas de Pagamento
        </h4>
        <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
          Seguro e Rápido
        </span>
      </div>

      <div className="space-y-2">
        {methods.map((method, index) => {
          const Icon = method.icon
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                method.highlight
                  ? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-800'
                  : 'bg-neutral-50 dark:bg-neutral-900/30 hover:bg-neutral-100 dark:hover:bg-neutral-900/50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  method.highlight
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    method.highlight ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      method.highlight
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {method.name}
                  </span>
                  {method.badge && (
                    <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                      {method.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {method.description}
                </div>
              </div>

              <svg
                className={`w-5 h-5 ${
                  method.highlight
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-400 dark:text-neutral-600'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )
        })}
      </div>

      {/* Payment brands */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="text-xs text-neutral-500 dark:text-neutral-500 text-center mb-2">
          Aceitamos todas as bandeiras
        </div>
        <div className="flex items-center justify-center gap-3 opacity-60">
          <div className="w-10 h-6 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center text-[8px] font-bold">
            VISA
          </div>
          <div className="w-10 h-6 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center text-[8px] font-bold">
            MASTER
          </div>
          <div className="w-10 h-6 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center text-[8px] font-bold">
            ELO
          </div>
          <div className="w-10 h-6 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center text-[8px] font-bold">
            AMEX
          </div>
        </div>
      </div>
    </div>
  )
}
