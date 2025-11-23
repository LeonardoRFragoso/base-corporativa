import { Shirt, Scissors, TestTube, Package } from 'lucide-react'

/**
 * Nosso Processo de Produção
 */
export default function OurProcess() {
  const steps = [
    {
      number: '01',
      icon: Shirt,
      title: 'Seleção de Tecidos',
      description: 'Importamos tecidos premium de fornecedores certificados. Cada material passa por rigorosa inspeção de qualidade antes da aprovação.',
      color: 'from-primary-600 to-primary-700',
      bgColor: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20'
    },
    {
      number: '02',
      icon: Scissors,
      title: 'Confecção Premium',
      description: 'Costura reforçada em pontos estratégicos e acabamento impecável. Cada camisa é inspecionada individualmente durante a produção.',
      color: 'from-bronze-600 to-bronze-700',
      bgColor: 'from-bronze-50 to-bronze-100 dark:from-bronze-900/20 dark:to-bronze-800/20'
    },
    {
      number: '03',
      icon: TestTube,
      title: 'Testes Rigorosos',
      description: 'Submetemos cada modelo a mais de 50 lavagens para garantir que não encolhe, não desbota e mantém a forma original.',
      color: 'from-purple-600 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
    },
    {
      number: '04',
      icon: Package,
      title: 'Embalagem & Envio',
      description: 'Embalamos cada camisa individualmente em packaging premium e enviamos com rastreamento completo até sua casa.',
      color: 'from-green-600 to-green-700',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
    }
  ]

  return (
    <section className="py-28 bg-white dark:bg-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Nosso Processo de Produção
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Da seleção dos tecidos até a entrega: cada etapa é pensada para garantir a qualidade premium que você merece
          </p>
        </div>

        {/* Timeline Desktop */}
        <div className="hidden lg:block relative">
          {/* Connection Line */}
          <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-purple-200 to-green-200 dark:from-primary-800 dark:via-purple-800 dark:to-green-800"></div>

          <div className="grid grid-cols-4 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Step Number Circle */}
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-16 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center border-4 border-neutral-200 dark:border-neutral-700 z-10">
                    <span className={`text-xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      {step.number}
                    </span>
                  </div>

                  {/* Card */}
                  <div className="mt-32 group">
                    <div className={`bg-gradient-to-br ${step.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-neutral-200 dark:border-neutral-700`}>
                      {/* Icon */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline Mobile */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Vertical Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 bottom-0 w-1 bg-gradient-to-b from-primary-200 to-bronze-200 dark:from-primary-800 dark:to-bronze-800"></div>
                )}

                <div className="flex gap-4">
                  {/* Left: Number Circle */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center border-4 border-neutral-200 dark:border-neutral-700 relative z-10">
                      <span className={`text-xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Right: Card */}
                  <div className="flex-1">
                    <div className={`bg-gradient-to-br ${step.bgColor} rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700`}>
                      {/* Icon */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 bg-gradient-to-r from-primary-50 via-bronze-50 to-purple-50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">100%</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Tecidos Premium</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-bronze-600 dark:text-bronze-400 mb-2">50+</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Lavagens Testadas</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">Zero</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Encolhimento</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">5-10</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Dias de Entrega</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
