import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

export default function Cart() {
  const { items, update, remove, clear } = useCart()
  const { isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0)
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  // Shipping state
  const [zip, setZip] = useState('')
  const [quotes, setQuotes] = useState([])
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [quoteError, setQuoteError] = useState('')

  // Address state (only for authenticated users)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [newAddressOpen, setNewAddressOpen] = useState(false)
  const [newAddress, setNewAddress] = useState({
    first_name: '', last_name: '', phone: '',
    street: '', number: '', complement: '', neighborhood: '',
    city: '', state: '', zip_code: ''
  })

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  const shipping = selectedQuote ? Number(selectedQuote.price) : 0
  const discount = coupon ? Math.min(
    Number(coupon.amount_off || 0) || (subtotal * (Number(coupon.percent_off || 0) / 100)),
    subtotal
  ) : 0
  const total = Math.max(0, subtotal + shipping - discount)

  // Load persisted shipping info
  useEffect(() => {
    try {
      const savedZip = localStorage.getItem('shipping_zip')
      const savedQuote = localStorage.getItem('shipping_quote')
      if (savedZip) setZip(savedZip)
      if (savedQuote) {
        const parsed = JSON.parse(savedQuote)
        if (parsed && typeof parsed === 'object') setSelectedQuote(parsed)
      }
    } catch {}
  }, [])

  async function createAddress() {
    try {
      setCouponError('')
      const required = ['first_name','street','city','state','zip_code']
      for (const k of required) {
        if (!newAddress[k]) {
          alert('Preencha os campos obrigatórios do endereço.')
          return
        }
      }
      const res = await api.post('/api/user/addresses/', newAddress)
      setAddresses(prev => [res.data, ...prev])
      setSelectedAddressId(res.data.id)
      setNewAddressOpen(false)
    } catch (e) {
      alert('Não foi possível salvar o endereço.')
    }
  }

  async function applyCoupon() {
    setCouponError('')
    setCoupon(null)
    const code = (couponCode || '').trim()
    if (!code) return
    try {
      const res = await api.get(`/api/discounts/validate/`, { params: { code } })
      if (res.data.valid) {
        setCoupon({ code: res.data.code, percent_off: res.data.percent_off, amount_off: res.data.amount_off })
      } else {
        setCouponError('Cupom inválido ou expirado.')
      }
    } catch (e) {
      setCouponError('Não foi possível validar o cupom.')
    }
  }

  // Load user addresses when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    async function loadAddresses() {
      try {
        const res = await api.get('/api/user/addresses/')
        setAddresses(res.data)
        if (res.data.length > 0) {
          const defaultAddr = res.data.find(a => a.is_default) || res.data[0]
          setSelectedAddressId(defaultAddr.id)
        }
      } catch {}
    }
    loadAddresses()
  }, [isAuthenticated])

  // When address changes, sync CEP
  useEffect(() => {
    if (!isAuthenticated || !selectedAddressId) return
    const addr = addresses.find(a => a.id === selectedAddressId)
    if (addr?.zip_code) setZip(addr.zip_code)
  }, [selectedAddressId, isAuthenticated, addresses])

  // Persist on change
  useEffect(() => {
    try { localStorage.setItem('shipping_zip', zip) } catch {}
  }, [zip])
  useEffect(() => {
    try { localStorage.setItem('shipping_quote', JSON.stringify(selectedQuote || null)) } catch {}
  }, [selectedQuote])

  function zipNumbersOnly(v) { return (v || '').replace(/\D/g, '').slice(0, 8) }
  function formatZip(v) {
    const n = zipNumbersOnly(v)
    if (n.length <= 5) return n
    return `${n.slice(0,5)}-${n.slice(5)}`
  }

  async function calculateShipping() {
    setLoadingQuotes(true)
    setQuoteError('')
    setQuotes([])
    setSelectedQuote(null)
    try {
      const zipNormalized = zipNumbersOnly(zip)
      if (zipNormalized.length !== 8) {
        setQuoteError('Informe um CEP válido (8 dígitos).')
        return
      }
      const payload = {
        zip_destination: formatZip(zipNormalized),
        items: items.map(i => ({
          id: i.id,
          variantId: i.variantId,
          qty: i.qty,
          price: Number(i.price),
          // Optional: can send weight/dimensions in the future per variant
        }))
      }
      const res = await api.post('/api/shipping/quote/', payload)
      const qs = res.data?.quotes || []
      setQuotes(qs)
      if (qs.length) setSelectedQuote(qs[0])
    } catch (e) {
      console.error('Erro ao calcular frete:', e)
      setQuoteError('Não foi possível calcular o frete. Tente novamente.')
    } finally {
      setLoadingQuotes(false)
    }
  }

  const handleCheckout = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
      // Preparar dados do carrinho para o Mercado Pago
      const checkoutData = {
        destination_zip: formatZip(zipNumbersOnly(zip)),
        shipping_service_name: selectedQuote?.service_name || '',
        shipping_carrier: selectedQuote?.carrier || '',
        items: [
          ...items.map(item => ({
          name: item.name,
          qty: item.qty,
          price: Number(item.price),
          size: item.size,
          color: item.color
        })),
        ]
      }
      if (isAuthenticated && selectedAddressId) {
        checkoutData.address_id = selectedAddressId
      }
      if (coupon) {
        checkoutData.coupon_code = coupon.code
        checkoutData.discount_amount = Number(discount)
      }
      // Add shipping as an item if selected
      if (selectedQuote && Number(selectedQuote.price) > 0) {
        checkoutData.items.push({ name: 'Frete', qty: 1, price: Number(selectedQuote.price) })
      }
      
      // Criar preferência no Mercado Pago
      const response = await api.post('/api/payments/create-preference/', checkoutData)
      
      if (response.data.init_point) {
        // Redirecionar para o checkout do Mercado Pago (PRODUÇÃO)
        window.location.href = response.data.init_point
      } else {
        throw new Error('Erro ao criar preferência de pagamento')
      }
      
    } catch (error) {
      console.error('Erro no checkout:', error)
      alert('Erro ao processar checkout. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-neutral-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6L5 9z" />
            </svg>
            <h2 className="text-2xl font-bold text-primary-950 mb-4">Seu carrinho está vazio</h2>
            <p className="text-neutral-600 mb-8">Que tal dar uma olhada em nossos produtos?</p>
            <Link 
              to="/catalog" 
              className="inline-flex items-center px-6 py-3 bg-primary-950 text-white font-semibold rounded-lg hover:bg-primary-800 transition-all"
            >
              Continuar comprando
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-2">
            Carrinho de Compras
          </h1>
          <p className="text-neutral-600">
            {items.length} {items.length === 1 ? 'item' : 'itens'} no seu carrinho
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-soft p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Product image placeholder */}
                  {item.image ? (
                    <img
                      src={item.image.startsWith('http') ? item.image : `${baseURL}${item.image}`}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-neutral-100"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary-950 mb-1">{item.name}</h3>
                    <div className="text-sm text-neutral-600 space-y-1">
                      {item.size && <div>Tamanho: {item.size}</div>}
                      {item.color && <div>Cor: {item.color}</div>}
                      <div className="font-medium text-primary-950">R$ {Number(item.price).toFixed(2)} cada</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-neutral-300 rounded-lg">
                      <button
                        onClick={() => update(item, Math.max(1, item.qty - 1))}
                        className="px-3 py-2 hover:bg-neutral-100 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => update(item, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center py-2 border-0 focus:ring-0"
                      />
                      <button
                        onClick={() => update(item, item.qty + 1)}
                        className="px-3 py-2 hover:bg-neutral-100 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => remove(item)}
                      className="p-2 text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                      title="Remover item"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Item total */}
                <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between items-center">
                  <span className="text-neutral-600">Subtotal do item:</span>
                  <span className="font-semibold text-primary-950">R$ {(Number(item.price) * item.qty).toFixed(2)}</span>
                </div>
              </div>
            ))}

            {/* Clear cart button */}
            <div className="flex justify-end">
              <button
                onClick={clear}
                className="text-error-500 hover:text-error-700 text-sm font-medium transition-colors"
              >
                Limpar carrinho
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6 sm:sticky sm:top-24">
              <h2 className="text-lg font-semibold text-primary-950 mb-4">Resumo do pedido</h2>

              {/* Shipping: CEP and quotes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Calcular frete</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Digite seu CEP"
                    value={formatZip(zip)}
                    onChange={(e) => setZip(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent"
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={loadingQuotes || items.length === 0}
                    className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300"
                  >
                    {loadingQuotes ? 'Calculando...' : 'Calcular'}
                  </button>
                </div>
                {quoteError && <div className="text-sm text-error-600 mt-2">{quoteError}</div>}
              </div>

              {quotes.length > 0 && (
                <div className="mb-4 space-y-2">
                  {quotes.map(q => (
                    <label key={q.service_id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${selectedQuote?.service_id === q.service_id ? 'border-primary-950 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                      <div className="flex items-center gap-3">
                        {q.carrier_logo ? (
                          <img src={q.carrier_logo} alt={q.carrier} className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="w-8 h-8 bg-neutral-100 rounded"></div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-primary-950">{q.carrier} • {q.service_name}</div>
                          {q.delivery_time && (
                            <div className="text-xs text-neutral-600">Prazo: {q.delivery_time} dias úteis</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-primary-950">R$ {Number(q.price).toFixed(2)}</div>
                        <input
                          type="radio"
                          name="shipping_option"
                          checked={selectedQuote?.service_id === q.service_id}
                          onChange={() => setSelectedQuote(q)}
                        />
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {isAuthenticated && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Endereço de entrega</label>
                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent"
                    >
                      {addresses.map(a => (
                        <option key={a.id} value={a.id}>{a.street}, {a.number} - {a.city}/{a.state} • CEP {a.zip_code}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-neutral-600">Nenhum endereço cadastrado.</div>
                  )}
                  <button
                    type="button"
                    onClick={() => setNewAddressOpen(!newAddressOpen)}
                    className="mt-2 text-sm text-primary-800 hover:text-primary-950"
                  >
                    {newAddressOpen ? 'Fechar' : 'Adicionar novo endereço'}
                  </button>

                  {newAddressOpen && (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className="px-3 py-2 border rounded" placeholder="Nome" value={newAddress.first_name} onChange={(e) => setNewAddress(v => ({...v, first_name: e.target.value}))} />
                        <input className="px-3 py-2 border rounded" placeholder="Sobrenome" value={newAddress.last_name} onChange={(e) => setNewAddress(v => ({...v, last_name: e.target.value}))} />
                      </div>
                      <input className="px-3 py-2 border rounded" placeholder="Telefone" value={newAddress.phone} onChange={(e) => setNewAddress(v => ({...v, phone: e.target.value}))} />
                      <input className="px-3 py-2 border rounded" placeholder="Rua" value={newAddress.street} onChange={(e) => setNewAddress(v => ({...v, street: e.target.value}))} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className="px-3 py-2 border rounded" placeholder="Número" value={newAddress.number} onChange={(e) => setNewAddress(v => ({...v, number: e.target.value}))} />
                        <input className="px-3 py-2 border rounded" placeholder="Complemento" value={newAddress.complement} onChange={(e) => setNewAddress(v => ({...v, complement: e.target.value}))} />
                      </div>
                      <input className="px-3 py-2 border rounded" placeholder="Bairro" value={newAddress.neighborhood} onChange={(e) => setNewAddress(v => ({...v, neighborhood: e.target.value}))} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className="px-3 py-2 border rounded" placeholder="Cidade" value={newAddress.city} onChange={(e) => setNewAddress(v => ({...v, city: e.target.value}))} />
                        <input className="px-3 py-2 border rounded" placeholder="Estado" value={newAddress.state} onChange={(e) => setNewAddress(v => ({...v, state: e.target.value}))} />
                      </div>
                      <input className="px-3 py-2 border rounded" placeholder="CEP" value={newAddress.zip_code} onChange={(e) => setNewAddress(v => ({...v, zip_code: e.target.value}))} />
                      <button onClick={createAddress} className="mt-1 px-4 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800">Salvar endereço</button>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Cupom de desconto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite seu cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent"
                  />
                  <button onClick={applyCoupon} className="px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800">Aplicar</button>
                </div>
                {couponError && <div className="text-sm text-error-600 mt-2">{couponError}</div>}
                {coupon && (
                  <div className="text-sm text-success-700 mt-2">Cupom aplicado: {coupon.code}</div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-600">Frete</span>
                  <span className="font-medium">{shipping === 0 ? '—' : `R$ ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Desconto</span>
                  <span className="font-medium">{discount > 0 ? `- R$ ${discount.toFixed(2)}` : '—'}</span>
                </div>

                {/* Tip: could add free shipping rule hint here if needed */}

                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary-950">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold transition-all ${
                  isProcessing 
                    ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-gold-500 to-bronze-500 text-dark-950 hover:from-gold-400 hover:to-bronze-400 hover:scale-105 shadow-medium hover:shadow-strong'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Finalizar compra
                  </div>
                )}
              </button>

              <Link 
                to="/catalog" 
                className="block w-full mt-3 text-center py-3 px-6 border border-neutral-300 rounded-lg font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
              >
                Continuar comprando
              </Link>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Compra 100% segura
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
