import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useCart } from '../context/CartContext.jsx'

export default function CheckoutSuccess() {
  const { clear } = useCart()

  useEffect(() => {
    // Limpar carrinho após pagamento bem-sucedido
    clear()
  }, [clear])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-primary-950 mb-4">
          Pagamento Aprovado!
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Seu pedido foi processado com sucesso. Você receberá um e-mail de confirmação 
          em breve com os detalhes do seu pedido.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Pagamento confirmado</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Seu pedido será processado e enviado em até 2 dias úteis.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link 
            to="/"
            className="w-full bg-gradient-to-r from-gold-500 to-bronze-500 text-dark-950 py-3 px-6 rounded-lg font-semibold hover:from-gold-400 hover:to-bronze-400 transition-all"
          >
            Voltar ao início
          </Link>
          
          <Link 
            to="/catalog"
            className="w-full border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 py-3 px-6 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 transition-all"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
