import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api.js'

export default function CheckoutCard() {
  const location = useLocation()
  const navigate = useNavigate()
  const { checkoutData } = location.state || {}
  
  const [mp, setMp] = useState(null)
  const [cardForm, setCardForm] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  
  // Dados do cartão
  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [installments, setInstallments] = useState(1)
  const [installmentsOptions, setInstallmentsOptions] = useState([])
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [issuerId, setIssuerId] = useState('')

  // Calcular total
  const total = checkoutData?.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0

  useEffect(() => {
    if (!checkoutData) {
      navigate('/cart')
      return
    }

    // Inicializar Mercado Pago SDK
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-66577b04-d2f6-4a81-b71f-a1e23d7d757e'
    const mercadopago = new window.MercadoPago(publicKey)
    setMp(mercadopago)

    // Criar instância do CardForm
    const cardFormInstance = mercadopago.cardForm({
      amount: String(total),
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "Número do cartão",
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/AA",
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "CVV",
        },
        cardholderName: {
          id: "form-checkout__cardholderName",
          placeholder: "Nome no cartão",
        },
        issuer: {
          id: "form-checkout__issuer",
          placeholder: "Banco emissor",
        },
        installments: {
          id: "form-checkout__installments",
          placeholder: "Parcelas",
        },
        identificationType: {
          id: "form-checkout__identificationType",
        },
        identificationNumber: {
          id: "form-checkout__identificationNumber",
          placeholder: "CPF",
        },
        cardholderEmail: {
          id: "form-checkout__cardholderEmail",
          placeholder: "E-mail",
        },
      },
      callbacks: {
        onFormMounted: error => {
          if (error) {
            console.error('Form mount error:', error)
            setError('Erro ao carregar formulário de pagamento')
          }
        },
        onSubmit: event => {
          event.preventDefault()
          handleSubmit()
        },
        onFetching: (resource) => {
          console.log("Fetching resource: ", resource)
        }
      },
    })

    setCardForm(cardFormInstance)
  }, [checkoutData, navigate, total])

  const handleSubmit = async () => {
    if (isProcessing || !cardForm) return
    
    setIsProcessing(true)
    setError('')

    try {
      // Obter token do cartão
      const cardData = await cardForm.createCardToken()
      
      if (!cardData || !cardData.id) {
        throw new Error('Erro ao processar dados do cartão')
      }

      // Preparar dados do pagamento
      const paymentData = {
        ...checkoutData,
        token: cardData.id,
        payment_method_id: cardData.payment_method_id,
        installments: parseInt(document.getElementById('form-checkout__installments').value) || 1,
        issuer_id: document.getElementById('form-checkout__issuer').value,
      }

      // Enviar para backend
      const response = await api.post('/api/payments/create-card-payment/', paymentData)

      if (response.data.success) {
        // Redirecionar baseado no status
        if (response.data.status === 'approved') {
          navigate('/checkout/success', { 
            state: { 
              orderId: response.data.order_id,
              paymentId: response.data.payment_id 
            } 
          })
        } else if (response.data.status === 'pending') {
          navigate('/checkout/pending', { 
            state: { 
              orderId: response.data.order_id,
              paymentId: response.data.payment_id 
            } 
          })
        } else {
          navigate('/checkout/failure', { 
            state: { 
              orderId: response.data.order_id,
              error: response.data.status_detail 
            } 
          })
        }
      } else {
        throw new Error(response.data.error || 'Erro ao processar pagamento')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err.response?.data?.error || err.message || 'Erro ao processar pagamento. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!checkoutData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Pagamento com Cartão</h1>
          <p className="text-lg text-neutral-600">Preencha os dados do seu cartão de crédito</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Cartão */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form id="form-checkout">
                {/* Número do Cartão */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Número do Cartão
                  </label>
                  <div id="form-checkout__cardNumber" className="border-2 border-neutral-300 rounded-xl p-3"></div>
                </div>

                {/* Nome no Cartão */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Nome no Cartão
                  </label>
                  <input
                    type="text"
                    id="form-checkout__cardholderName"
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                    placeholder="Nome como está no cartão"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Data de Validade */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Validade
                    </label>
                    <div id="form-checkout__expirationDate" className="border-2 border-neutral-300 rounded-xl p-3"></div>
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      CVV
                    </label>
                    <div id="form-checkout__securityCode" className="border-2 border-neutral-300 rounded-xl p-3"></div>
                  </div>
                </div>

                {/* CPF */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    CPF do Titular
                  </label>
                  <select id="form-checkout__identificationType" className="hidden"></select>
                  <input
                    type="text"
                    id="form-checkout__identificationNumber"
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                    placeholder="000.000.000-00"
                    defaultValue={checkoutData.cpf || ''}
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="form-checkout__cardholderEmail"
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                    placeholder="seu@email.com"
                    defaultValue={checkoutData.email || ''}
                  />
                </div>

                {/* Banco Emissor */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Banco Emissor
                  </label>
                  <select
                    id="form-checkout__issuer"
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  ></select>
                </div>

                {/* Parcelas */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Parcelas
                  </label>
                  <select
                    id="form-checkout__installments"
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  ></select>
                </div>

                {/* Erro */}
                {error && (
                  <div className="mb-6 p-4 bg-error-50 border-2 border-error-200 rounded-xl">
                    <p className="text-error-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Botão de Pagamento */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                    isProcessing
                      ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 hover:scale-[1.02] shadow-xl hover:shadow-2xl'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando pagamento...
                    </div>
                  ) : (
                    `Pagar R$ ${total.toFixed(2)}`
                  )}
                </button>

                <Link
                  to="/cart"
                  className="block w-full mt-4 text-center py-3 px-6 border-2 border-neutral-300 rounded-xl font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all"
                >
                  Voltar ao carrinho
                </Link>
              </form>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-3 mb-6">
                {checkoutData.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      {item.qty}x {item.name}
                    </span>
                    <span className="font-semibold text-neutral-900">
                      R$ {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-neutral-200 pt-4 space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold text-neutral-900">R$ {total.toFixed(2)}</span>
                </div>
                
                {checkoutData.shipping_price > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-neutral-600">Frete</span>
                    <span className="font-semibold text-neutral-900">
                      R$ {Number(checkoutData.shipping_price).toFixed(2)}
                    </span>
                  </div>
                )}

                {checkoutData.discount_amount > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-neutral-600">Desconto</span>
                    <span className="font-semibold text-success-700">
                      - R$ {Number(checkoutData.discount_amount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t-2 border-neutral-200 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-neutral-900">Total</span>
                    <span className="text-primary-700">
                      R$ {(total + Number(checkoutData.shipping_price || 0) - Number(checkoutData.discount_amount || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selos de Segurança */}
              <div className="mt-6 pt-6 border-t-2 border-neutral-200">
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
                  <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">Pagamento 100% seguro</span>
                </div>
                <p className="text-xs text-neutral-500 text-center mt-2">
                  Seus dados são protegidos pelo Mercado Pago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
