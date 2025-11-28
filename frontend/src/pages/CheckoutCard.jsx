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
  const [transactionAmount, setTransactionAmount] = useState(0)

  // Calcular totais
  const itemsTotal = checkoutData?.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0
  const shipping = Number(checkoutData?.shipping_price || 0)
  const discount = Number(checkoutData?.discount_amount || 0)
  const finalTotal = itemsTotal + shipping - discount
  
  // Valor a ser exibido na UI (pode incluir juros de parcelamento)
  const displayTotal = transactionAmount > 0 ? transactionAmount : finalTotal

  useEffect(() => {
    if (!checkoutData) {
      navigate('/cart')
      return
    }

    // Adicionar estilos CSS para dark mode nos iframes do Mercado Pago
    const styleId = 'mp-dark-mode-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .dark #form-checkout__cardNumber iframe,
        .dark #form-checkout__expirationDate iframe,
        .dark #form-checkout__securityCode iframe {
          background-color: transparent !important;
        }
        .dark #form-checkout__cardNumber iframe input,
        .dark #form-checkout__expirationDate iframe input,
        .dark #form-checkout__securityCode iframe input {
          background-color: rgb(64 64 64) !important;
          color: rgb(245 245 245) !important;
        }
      `
      document.head.appendChild(style)
    }

    // Inicializar Mercado Pago SDK
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-66577b04-d2f6-4a81-b71f-a1e23d7d757e'
    const mercadopago = new window.MercadoPago(publicKey)
    setMp(mercadopago)

    // Criar instância do CardForm
    const cardFormInstance = mercadopago.cardForm({
      amount: String(finalTotal),
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
    
    // Inicializar o valor da transação
    setTransactionAmount(finalTotal)
    
    // Adicionar listener para mudanças nas parcelas
    const installmentsSelect = document.getElementById('form-checkout__installments')
    if (installmentsSelect) {
      const handleInstallmentChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex]
        if (selectedOption) {
          // O Mercado Pago inclui o valor total com juros no texto da option
          // Formato: "2 parcelas de R$ 73,99 (R$ 147,98)"
          const text = selectedOption.text
          const totalMatch = text.match(/\(R\$\s*([\d.,]+)\)/)
          if (totalMatch) {
            const totalWithInterest = parseFloat(totalMatch[1].replace('.', '').replace(',', '.'))
            console.log('Transaction amount with interest:', totalWithInterest)
            setTransactionAmount(totalWithInterest)
          }
        }
      }
      installmentsSelect.addEventListener('change', handleInstallmentChange)
      
      // Cleanup
      return () => {
        installmentsSelect.removeEventListener('change', handleInstallmentChange)
      }
    }
  }, [checkoutData, navigate, finalTotal])

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    console.log('handleSubmit called', { isProcessing, cardForm })
    
    if (isProcessing || !cardForm) {
      console.log('Skipping submit:', { isProcessing, hasCardForm: !!cardForm })
      return
    }
    
    setIsProcessing(true)
    setError('')

    try {
      console.log('Creating card token...')
      // Obter token do cartão
      const cardData = await cardForm.createCardToken()
      console.log('Card token created:', cardData)
      
      // O Mercado Pago pode retornar {token: '...'} ou {id: '...'}
      const tokenId = cardData?.token || cardData?.id
      
      if (!cardData || !tokenId) {
        console.error('Invalid card data:', cardData)
        throw new Error('Erro ao processar dados do cartão')
      }

      // Obter dados consolidados do formulário (garante consistência com o BIN)
      const formData = cardForm.getCardFormData()
      const resolvedPaymentMethodId = cardData?.payment_method_id || formData.paymentMethodId
      
      // Calcular o total correto considerando juros das parcelas
      // Se o usuário selecionou parcelamento com juros, transactionAmount já foi atualizado
      const finalTransactionAmount = transactionAmount > 0 ? transactionAmount : finalTotal
      
      // Preparar dados do pagamento
      const paymentData = {
        ...checkoutData,
        token: tokenId,
        payment_method_id: resolvedPaymentMethodId,
        installments: Number(formData.installments || 1),
        issuer_id: formData.issuerId,
        cpf: formData.identificationNumber,
        // IMPORTANTE: Enviar o valor total com juros das parcelas
        transaction_amount: finalTransactionAmount,
      }

      console.log('Sending payment data:', paymentData)
      console.log('Transaction amount (with interest):', finalTransactionAmount)
      // Enviar para backend
      const response = await api.post('/api/payments/create-card-payment/', paymentData)
      console.log('Payment response:', response.data)

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Pagamento com Cartão</h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">Preencha os dados do seu cartão de crédito com segurança</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Formulário de Cartão */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 sm:p-8">
              <form id="form-checkout">
                {/* Seção: Dados do Cartão */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Dados do Cartão
                  </h3>

                  {/* Número do Cartão */}
                  <div className="mb-4">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Número do Cartão
                    </label>
                    <div id="form-checkout__cardNumber" className="bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg transition-all hover:border-primary-400 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100" style={{height: '42px', padding: '6px 10px', display: 'flex', alignItems: 'center'}}></div>
                  </div>

                  {/* Nome no Cartão */}
                  <div className="mb-4">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      id="form-checkout__cardholderName"
                      className="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-700 placeholder:text-neutral-400 text-sm"
                      placeholder="Nome como está no cartão"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Data de Validade */}
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Validade
                      </label>
                      <div id="form-checkout__expirationDate" className="bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg transition-all hover:border-primary-400 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100" style={{height: '42px', padding: '6px 10px', display: 'flex', alignItems: 'center'}}></div>
                    </div>

                    {/* CVV */}
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        CVV
                      </label>
                      <div id="form-checkout__securityCode" className="bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg transition-all hover:border-primary-400 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100" style={{height: '42px', padding: '6px 10px', display: 'flex', alignItems: 'center'}}></div>
                    </div>
                  </div>
                </div>

                {/* Seção: Dados do Titular */}
                <div className="mb-8 pt-6 border-t-2 border-neutral-100 dark:border-neutral-700">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Dados do Titular
                  </h3>

                  {/* CPF */}
                  <div className="mb-4">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      CPF do Titular
                    </label>
                    <select id="form-checkout__identificationType" className="hidden"></select>
                    <input
                      type="text"
                      id="form-checkout__identificationNumber"
                      className="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-700 placeholder:text-neutral-400 text-sm"
                      placeholder="000.000.000-00"
                      defaultValue={checkoutData.cpf || ''}
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="form-checkout__cardholderEmail"
                      className="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-700 placeholder:text-neutral-400 text-sm"
                      placeholder="seu@email.com"
                      defaultValue={checkoutData.email || ''}
                    />
                  </div>
                </div>

                {/* Seção: Opções de Pagamento */}
                <div className="mb-8 pt-6 border-t-2 border-neutral-100 dark:border-neutral-700">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Opções de Pagamento
                  </h3>

                  {/* Banco Emissor */}
                  <div className="mb-4">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Banco Emissor
                    </label>
                    <select
                      id="form-checkout__issuer"
                      className="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 text-sm"
                    ></select>
                  </div>

                  {/* Parcelas */}
                  <div className="mb-4">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      <svg className="w-4 h-4 text-neutral-500 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Parcelas
                    </label>
                    <select
                      id="form-checkout__installments"
                      className="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-all text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 text-sm"
                    ></select>
                  </div>
                </div>

                {/* Erro */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 font-medium text-sm">{error}</p>
                  </div>
                )}

                {/* Botão de Pagamento */}
                <button
                  type="submit"
                  onClick={(e) => {
                    console.log('Button clicked')
                    handleSubmit(e)
                  }}
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
                    isProcessing
                      ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processando pagamento...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Pagar R$ {displayTotal.toFixed(2)}</span>
                    </div>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="block w-full mt-4 text-center py-3.5 px-6 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 hover:border-neutral-400 transition-all"
                >
                  ← Voltar ao carrinho
                </Link>
              </form>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Resumo do Pedido</h2>
              </div>
              
              <div className="space-y-3 mb-5">
                {checkoutData.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start gap-3 p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 block">
                        {item.name}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-500">
                        Quantidade: {item.qty}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm whitespace-nowrap">
                      R$ {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400 font-medium">Subtotal</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">R$ {itemsTotal.toFixed(2)}</span>
                </div>
                
                {checkoutData.shipping_price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      Frete
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      R$ {Number(checkoutData.shipping_price).toFixed(2)}
                    </span>
                  </div>
                )}

                {checkoutData.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Desconto
                    </span>
                    <span className="font-semibold text-green-600">
                      - R$ {Number(checkoutData.discount_amount).toFixed(2)}
                    </span>
                  </div>
                )}

                {transactionAmount > finalTotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Juros do Parcelamento
                    </span>
                    <span className="font-semibold text-orange-600">
                      + R$ {(transactionAmount - finalTotal).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Total</span>
                    <span className="text-2xl font-bold text-primary-700">
                      R$ {displayTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selos de Segurança */}
              <div className="mt-6 pt-6 border-t-2 border-neutral-200 dark:border-neutral-700">
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-800 dark:text-green-300 mb-2">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-bold">Pagamento 100% seguro</span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 text-center">
                    Seus dados são criptografados e protegidos pelo Mercado Pago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
