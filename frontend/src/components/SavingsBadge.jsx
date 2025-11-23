import { TrendingDown, Tag } from 'lucide-react'

/**
 * Badge de economia total
 * Mostra quanto o cliente está economizando
 */
export default function SavingsBadge({ discount, freeShipping }) {
  const totalSavings = discount + (freeShipping ? 15 : 0) // Assumindo frete médio de R$ 15

  if (totalSavings === 0) return null

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-xl p-4 mb-6 shadow-lg">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>

      <div className="relative z-10 flex items-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
          <Tag className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white/90 uppercase tracking-wide">
              Você está economizando
            </span>
          </div>
          <div className="text-3xl font-display font-bold text-white">
            R$ {totalSavings.toFixed(2)}
          </div>
          <div className="text-sm text-white/80 mt-1">
            {discount > 0 && `R$ ${discount.toFixed(2)} em descontos`}
            {discount > 0 && freeShipping && ' + '}
            {freeShipping && 'Frete grátis'}
          </div>
        </div>

        {/* Decorative element */}
        <div className="hidden sm:block">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <div className="text-4xl">🎉</div>
          </div>
        </div>
      </div>
    </div>
  )
}
