import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Olá! Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const quickReplies = [
    'Qual o prazo de entrega?',
    'Como faço para trocar um produto?',
    'Quais formas de pagamento aceitas?',
    'Falar com atendente'
  ]

  const handleSendMessage = (text) => {
    if (!text.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Simulate bot response
    setTimeout(() => {
      let botResponse = ''
      const lowerText = text.toLowerCase()

      if (lowerText.includes('entrega') || lowerText.includes('prazo')) {
        botResponse = 'O prazo de entrega varia de acordo com sua região. Geralmente é de 5 a 10 dias úteis. Oferecemos frete grátis para compras acima de R$ 200!'
      } else if (lowerText.includes('troca') || lowerText.includes('devolução')) {
        botResponse = 'Você tem 30 dias para solicitar a troca de produtos. Basta acessar "Meus Pedidos" e selecionar o item que deseja trocar.'
      } else if (lowerText.includes('pagamento')) {
        botResponse = 'Aceitamos cartão de crédito, PIX e boleto bancário. Todas as transações são 100% seguras!'
      } else if (lowerText.includes('atendente')) {
        botResponse = 'Vou transferir você para um atendente humano. Por favor, aguarde um momento...'
      } else {
        botResponse = 'Obrigado pela sua mensagem! Um de nossos atendentes entrará em contato em breve. Enquanto isso, você pode explorar nosso catálogo ou verificar nossas perguntas frequentes.'
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 1000)
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-primary-600 to-bronze-700 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
          aria-label="Abrir chat de suporte"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl flex flex-col z-50 animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-bronze-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white dark:bg-neutral-800/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Suporte BASE</h3>
                <p className="text-xs text-white/80">Online agora</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white dark:bg-neutral-800/10 rounded-lg transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-neutral-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(reply)}
                  className="text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage(inputValue)
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-full outline-none focus:border-primary-600 transition-colors"
              />
              <button
                type="submit"
                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
                disabled={!inputValue.trim()}
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
