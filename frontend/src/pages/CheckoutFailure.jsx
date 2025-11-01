import { Link } from 'react-router-dom'

export default function CheckoutFailure() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-primary-950 mb-4">
          Pagamento Não Aprovado
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Houve um problema com o processamento do seu pagamento. 
          Não se preocupe, seus itens ainda estão no carrinho.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">Pagamento rejeitado</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Verifique os dados do cartão ou tente outro método de pagamento.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link 
            to="/cart"
            className="w-full bg-gradient-to-r from-gold-500 to-bronze-500 text-dark-950 py-3 px-6 rounded-lg font-semibold hover:from-gold-400 hover:to-bronze-400 transition-all"
          >
            Tentar novamente
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
