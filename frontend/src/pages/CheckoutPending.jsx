import { Link } from 'react-router-dom'

export default function CheckoutPending() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-primary-950 mb-4">
          Pagamento Pendente
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Seu pagamento está sendo processado. Você receberá uma confirmação 
          por e-mail assim que o pagamento for aprovado.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Aguardando confirmação</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Para boleto bancário, o prazo de confirmação é de até 2 dias úteis.
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
