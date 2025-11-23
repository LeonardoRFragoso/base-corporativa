import { useState } from 'react'
import { Mail, Send, Check } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Newsletter CTA para página de Catálogo
 */
export default function NewsletterCatalog() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Digite um e-mail válido')
      return
    }

    setIsSubscribing(true)

    // Simular API call
    setTimeout(() => {
      setIsSubscribing(false)
      setIsSubscribed(true)
      toast.success('Inscrição realizada com sucesso!')
      setEmail('')
      
      // Reset após 3 segundos
      setTimeout(() => {
        setIsSubscribed(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="mt-16 bg-gradient-to-br from-primary-50 via-bronze-50/50 to-primary-50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 rounded-2xl p-8 md:p-12 border border-neutral-200 dark:border-neutral-700 shadow-xl">
      <div className="max-w-3xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6">
          <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Title */}
        <h3 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Fique Por Dentro das Novidades
        </h3>

        {/* Description */}
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          Receba em primeira mão <strong className="text-primary-600 dark:text-primary-400">lançamentos exclusivos</strong>, 
          promoções especiais e <strong className="text-bronze-600 dark:text-bronze-400">10% OFF</strong> na primeira compra!
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              disabled={isSubscribing || isSubscribed}
              className="flex-1 px-6 py-4 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubscribing || isSubscribed}
              className={`px-8 py-4 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubscribed
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {isSubscribing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </div>
              ) : isSubscribed ? (
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Inscrito!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Inscrever</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Trust info */}
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-4">
          🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="flex flex-col items-center">
            <div className="text-3xl mb-2">🎁</div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">10% OFF</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Primeira Compra</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Lançamentos</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Acesso Antecipado</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl mb-2">💝</div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Promoções</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Ofertas Exclusivas</div>
          </div>
        </div>
      </div>
    </div>
  )
}
