import { Shield, Lock, CheckCircle, Truck } from 'lucide-react'

/**
 * Badges de Confiança
 */
export default function TrustBadges() {
  const badges = [
    {
      icon: Lock,
      title: 'Pagamento 100% Seguro',
      description: 'Transações criptografadas SSL',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Dados Protegidos',
      description: 'Conforme LGPD',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: CheckCircle,
      title: 'Loja Verificada',
      description: 'Certificado de autenticidade',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Truck,
      title: 'Envios Rastreados',
      description: 'Acompanhe seu pedido',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className="group flex flex-col items-center text-center p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {badge.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {badge.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
