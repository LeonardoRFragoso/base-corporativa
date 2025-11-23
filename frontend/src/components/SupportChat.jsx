import { useState } from 'react'
import { MessageCircle, X, Send, Phone } from 'lucide-react'

// ⚠️ CONFIGURAR NÚMERO DO WHATSAPP DA LOJA
const WHATSAPP_NUMBER = '5511999999999' // Formato: 55 + DDD + número (sem espaços ou caracteres especiais)
const WHATSAPP_MESSAGE = 'Olá! Vim do site da BASE CORPORATIVA e gostaria de mais informações.'

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)

  // Função para abrir WhatsApp
  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  // Opções de contato
  const contactOptions = [
    {
      id: 1,
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Resposta imediata',
      action: openWhatsApp,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 2,
      icon: Phone,
      title: 'Telefone',
      description: '(11) 99999-9999',
      action: () => window.location.href = 'tel:+5511999999999',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 3,
      icon: Send,
      title: 'E-mail',
      description: 'contato@basecorporativa.store',
      action: () => window.location.href = 'mailto:contato@basecorporativa.store',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-primary-600 to-bronze-700 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 animate-pulse"
          aria-label="Abrir opções de contato"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Contact Options Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl flex flex-col z-50 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-bronze-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xl">Fale Conosco</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Fechar opções de contato"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/80">Escolha como prefere falar com a gente</p>
          </div>

          {/* Contact Options */}
          <div className="p-6 space-y-4">
            {contactOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={option.action}
                  className="w-full flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-xl transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-1">
                      {option.title}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {option.description}
                    </p>
                  </div>
                  <svg 
                    className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2">
            <div className="bg-primary-50 dark:bg-neutral-700/50 rounded-xl p-4 text-center border border-primary-100 dark:border-neutral-600">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                ⏰ <strong>Horário de atendimento:</strong>
              </p>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                Seg-Sex: 9h às 18h
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
