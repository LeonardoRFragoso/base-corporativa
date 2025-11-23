import { ShoppingCart, CreditCard, CheckCircle } from 'lucide-react'

/**
 * Indicador de progresso do checkout
 * Mostra as 3 etapas: Carrinho → Pagamento → Confirmação
 */
export default function CartProgressIndicator({ currentStep = 1 }) {
  const steps = [
    { number: 1, label: 'Carrinho', icon: ShoppingCart },
    { number: 2, label: 'Pagamento', icon: CreditCard },
    { number: 3, label: 'Confirmação', icon: CheckCircle },
  ]

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg dark:shadow-neutral-900/50 p-6 sm:p-8 mb-8 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 top-8 h-1 bg-neutral-200 dark:bg-neutral-700 -z-10">
          <div 
            className="h-full bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = currentStep > step.number
          const isActive = currentStep === step.number
          const isPending = currentStep < step.number

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
              {/* Circle */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg'
                    : isActive
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-xl scale-110'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <Icon
                    className={`w-8 h-8 ${
                      isActive ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <div
                  className={`text-sm font-bold ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {step.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
