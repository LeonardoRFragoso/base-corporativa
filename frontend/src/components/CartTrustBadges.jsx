import { Shield, RefreshCw, Truck, Lock } from 'lucide-react'

/**
 * Selos de confiança e garantias para o carrinho
 */
export default function CartTrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'Compra Segura',
      description: 'Pagamento 100% protegido',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: RefreshCw,
      title: 'Troca Grátis',
      description: 'Primeira troca sem custo',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: Truck,
      title: 'Entrega Rastreada',
      description: 'Acompanhe seu pedido',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: Lock,
      title: 'Dados Protegidos',
      description: 'Criptografia SSL',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ]

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-800/50 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-center">
        Por que comprar conosco?
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 bg-white dark:bg-neutral-900/50 rounded-xl hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-full ${badge.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <div className={`bg-gradient-to-br ${badge.color} rounded-full p-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {badge.title}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                {badge.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
