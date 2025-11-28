import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function CheckoutPix() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clear } = useCart()
  const [pixData, setPixData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('pending')

  useEffect(() => {
    // Receber dados do PIX passados pelo Cart.jsx
    if (location.state?.pixData) {
      setPixData(location.state.pixData)
    } else {
      // Se não houver dados, redirecionar para o carrinho
      navigate('/cart')
    }
  }, [location, navigate])

  const copyToClipboard = async () => {
    if (pixData?.qr_code) {
      try {
        await navigator.clipboard.writeText(pixData.qr_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      } catch (err) {
        console.error('Erro ao copiar:', err)
      }
    }
  }

  const checkPaymentStatus = async () => {
    if (!pixData?.payment_id) return
    
    setChecking(true)
    try {
      // Aqui você pode fazer uma chamada para verificar o status do pagamento
      // Por enquanto, vamos simular
      setTimeout(() => {
        setChecking(false)
        // Em produção, você faria: const res = await api.get(`/api/payments/status/${pixData.payment_id}`)
        // e verificaria res.data.status
      }, 2000)
    } catch (err) {
      console.error('Erro ao verificar status:', err)
      setChecking(false)
    }
  }

  const handlePaymentConfirmed = () => {
    clear() // Limpar carrinho
    navigate('/checkout/success')
  }

  if (!pixData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-bronze-100 dark:from-primary-900/30 dark:to-bronze-900/30 rounded-full mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Pagamento via PIX
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Escaneie o QR Code ou copie o código abaixo
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-8">
          {/* QR Code */}
          {pixData.qr_code_base64 && (
            <div className="flex flex-col items-center">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border-4 border-neutral-200 dark:border-neutral-700 shadow-lg">
                <img 
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 text-center max-w-md">
                Abra o app do seu banco e escaneie o QR Code para pagar
              </p>
            </div>
          )}

          {/* Valor */}
          <div className="text-center py-6 bg-gradient-to-r from-primary-50 to-bronze-50 dark:from-primary-900/20 dark:to-bronze-900/20 rounded-xl">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Valor a pagar</p>
            <p className="text-4xl font-bold text-primary-700">
              R$ {Number(pixData.amount).toFixed(2)}
            </p>
          </div>

          {/* Código Copia e Cola */}
          {pixData.qr_code && (
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                Ou copie o código PIX:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={pixData.qr_code}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 font-mono text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    copied 
                      ? 'bg-success-600 text-white' 
                      : 'bg-neutral-900 dark:bg-neutral-700 text-white hover:bg-neutral-800 dark:hover:bg-neutral-600'
                  }`}
                >
                  {copied ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado!
                    </div>
                  ) : (
                    'Copiar'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Informações do Pedido */}
          <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Informações do pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Número do pedido:</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{pixData.external_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">ID do pagamento:</span>
                <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">{pixData.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-800">
                  Aguardando pagamento
                </span>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-primary-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Como pagar
            </h3>
            <ol className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">1</span>
                <span>Abra o app do seu banco ou carteira digital</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">2</span>
                <span>Escolha a opção "Pagar com PIX"</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">3</span>
                <span>Escaneie o QR Code ou cole o código PIX</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">4</span>
                <span>Confirme o pagamento</span>
              </li>
            </ol>
          </div>

          {/* Aviso de Expiração */}
          <div className="bg-warning-50 border-l-4 border-warning-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-warning-800 mb-1">Atenção!</p>
                <p className="text-warning-700">
                  Este código PIX expira em 30 minutos. Após o pagamento, você receberá a confirmação automaticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={checkPaymentStatus}
              disabled={checking}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-bronze-700 to-bronze-800 text-white font-bold rounded-xl hover:from-bronze-600 hover:to-bronze-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </div>
              ) : (
                'Já paguei - Verificar status'
              )}
            </button>
            <Link
              to="/catalog"
              className="flex-1 py-4 px-6 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 hover:border-neutral-400 transition-all text-center"
            >
              Voltar para a loja
            </Link>
          </div>
        </div>

        {/* Suporte */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Problemas com o pagamento?{' '}
            <Link to="/contact" className="text-primary-600 hover:text-primary-700 dark:hover:text-primary-400 font-semibold">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
