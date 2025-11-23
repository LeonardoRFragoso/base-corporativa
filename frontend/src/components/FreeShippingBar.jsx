import { Truck, Package } from 'lucide-react'

/**
 * Barra de progresso para frete grátis
 * Mostra quanto falta para atingir o valor mínimo
 */
export default function FreeShippingBar({ subtotal, freeShippingThreshold = 200 }) {
  const remaining = Math.max(0, freeShippingThreshold - subtotal)
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100)
  const hasReached = subtotal >= freeShippingThreshold

  if (hasReached) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 mb-6 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-green-800 dark:text-green-300 font-bold text-lg">
              🎉 Parabéns! Você ganhou frete grátis!
            </div>
            <div className="text-green-700 dark:text-green-400 text-sm">
              Sua compra se qualifica para entrega gratuita
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-blue-900 dark:text-blue-200">
            Frete Grátis
          </span>
        </div>
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          Faltam R$ {remaining.toFixed(2)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          {progress > 10 && (
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
          )}
        </div>
        
        {/* Truck Icon moving along progress */}
        {progress > 0 && (
          <div
            className="absolute -top-1 -translate-x-1/2 transition-all duration-500"
            style={{ left: `${progress}%` }}
          >
            <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        )}
      </div>

      {/* Message */}
      <div className="mt-3 text-xs text-blue-700 dark:text-blue-300 text-center">
        Adicione mais <strong>R$ {remaining.toFixed(2)}</strong> e ganhe{' '}
        <strong>entrega gratuita</strong>! 🚚
      </div>
    </div>
  )
}
