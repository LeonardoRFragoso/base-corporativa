import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

export default function Cart() {
  const { items, update, remove, clear } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
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

  // Guest buyer basic info (for non-authenticated checkout)
  const [guestInfo, setGuestInfo] = useState({ first_name: '', last_name: '', email: '' })
  const [guestError, setGuestError] = useState('')
  // Guest shipping address (for non-authenticated checkout)
  const [guestAddr, setGuestAddr] = useState({
    shipping_first_name: '',
    shipping_last_name: '',
    shipping_phone: '',
    shipping_street: '',
    shipping_number: '',
    shipping_complement: '',
    shipping_neighborhood: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: ''
  })
  const [guestAddrError, setGuestAddrError] = useState('')

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
  function onlyNumbers(v) { return (v || '').replace(/\D/g, '') }
  function formatPhoneBR(v) {
    const n = onlyNumbers(v).slice(0, 11)
    if (n.length <= 2) return n
    if (n.length <= 6) return `(${n.slice(0,2)}) ${n.slice(2)}`
    if (n.length <= 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`
    // 11 digits (mobile)
    return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  }
  function normalizeUF(v) {
    return (v || '').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2)
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

  const validateCheckoutData = () => {
    setGuestError('')
    setGuestAddrError('')
    if (!isAuthenticated) {
      const { first_name, last_name, email } = guestInfo
      if (!first_name || !last_name || !email) {
        setGuestError('Preencha nome, sobrenome e e-mail para concluir a compra.')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setGuestError('Informe um e-mail válido.')
        return false
      }
      const requiredAddr = ['shipping_street','shipping_number','shipping_city','shipping_state']
      for (const k of requiredAddr) {
        if (!guestAddr[k]) {
          setGuestAddrError('Preencha rua, número, cidade e estado para entrega.')
          return false
        }
      }
      const zipNorm = zipNumbersOnly(guestAddr.shipping_zip || zip)
      if (zipNorm.length !== 8) {
        setGuestAddrError('Informe um CEP válido (8 dígitos) no endereço ou no cálculo de frete.')
        return false
      }
      if (!/^[A-Z]{2}$/.test(normalizeUF(guestAddr.shipping_state))) {
        setGuestAddrError('Informe a UF com 2 letras (ex: RJ, SP).')
        return false
      }
      const phoneDigits = onlyNumbers(guestAddr.shipping_phone)
      if (phoneDigits && !(phoneDigits.length === 10 || phoneDigits.length === 11)) {
        setGuestAddrError('Telefone inválido. Use DDD + número (10 ou 11 dígitos).')
        return false
      }
    }
    return true
  }

  const buildCheckoutData = () => {
    const checkoutData = {
      destination_zip: formatZip(zipNumbersOnly(zip)),
      shipping_service_name: selectedQuote?.service_name || '',
      shipping_carrier: selectedQuote?.carrier || '',
      items: items.map(item => ({
        name: item.name,
        qty: item.qty,
        price: Number(item.price),
        size: item.size,
        color: item.color
      }))
    }
    if (isAuthenticated && selectedAddressId) {
      checkoutData.address_id = selectedAddressId
    }
    if (!isAuthenticated) {
      checkoutData.first_name = guestInfo.first_name
      checkoutData.last_name = guestInfo.last_name
      checkoutData.email = guestInfo.email
      const zipNorm = zipNumbersOnly(guestAddr.shipping_zip || zip)
      checkoutData.shipping_first_name = guestAddr.shipping_first_name || guestInfo.first_name
      checkoutData.shipping_last_name = guestAddr.shipping_last_name || guestInfo.last_name
      checkoutData.shipping_phone = guestAddr.shipping_phone || ''
      checkoutData.shipping_street = guestAddr.shipping_street
      checkoutData.shipping_number = guestAddr.shipping_number
      checkoutData.shipping_complement = guestAddr.shipping_complement
      checkoutData.shipping_neighborhood = guestAddr.shipping_neighborhood
      checkoutData.shipping_city = guestAddr.shipping_city
      checkoutData.shipping_state = normalizeUF(guestAddr.shipping_state)
      checkoutData.shipping_zip = formatZip(zipNorm)
    }
    if (coupon) {
      checkoutData.coupon_code = coupon.code
      checkoutData.discount_amount = Number(discount)
    }
    if (selectedQuote && Number(selectedQuote.price) > 0) {
      checkoutData.items.push({ name: 'Frete', qty: 1, price: Number(selectedQuote.price) })
    }
    return checkoutData
  }

  const handleCheckoutPix = async () => {
    if (isProcessing) return
    if (!validateCheckoutData()) {
      return
    }
    
    setIsProcessing(true)
    
    try {
      const checkoutData = buildCheckoutData()
      const response = await api.post('/api/payments/create-pix/', checkoutData)
      
      if (response.data.qr_code) {
        navigate('/checkout/pix', { state: { pixData: response.data } })
      } else {
        throw new Error('Erro ao criar pagamento PIX')
      }
    } catch (error) {
      console.error('Erro no checkout PIX:', error)
      alert('Erro ao processar pagamento PIX. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckout = async () => {
    if (isProcessing) return
    if (!validateCheckoutData()) {
      return
    }
    
    setIsProcessing(true)
    
    try {
      const checkoutData = buildCheckoutData()
      const response = await api.post('/api/payments/create-preference/', checkoutData)
      
      if (response.data.init_point) {
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
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-bronze-100 rounded-full mb-8">
              <svg className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6L5 9z" />
              </svg>
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-6">Seu carrinho está vazio</h2>
            <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">Que tal dar uma olhada em nossos produtos?</p>
            <Link 
              to="/catalog" 
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-bronze-700 to-bronze-800 text-white font-bold text-lg rounded-xl hover:from-bronze-600 hover:to-bronze-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Continuar comprando
              <svg className="ml-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-3">
            Carrinho de Compras
          </h1>
          <p className="text-lg text-neutral-600">
            {items.length} {items.length === 1 ? 'item' : 'itens'} no seu <span className="text-primary-700 font-medium">carrinho</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
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
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{item.name}</h3>
                    <div className="text-base text-neutral-600 space-y-1">
                      {item.size && <div><span className="font-medium">Tamanho:</span> {item.size}</div>}
                      {item.color && <div><span className="font-medium">Cor:</span> {item.color}</div>}
                      <div className="font-semibold text-primary-700 text-lg mt-2">R$ {Number(item.price).toFixed(2)} <span className="text-sm font-normal text-neutral-500">cada</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    {/* Quantity controls */}
                    <div className="flex items-center border-2 border-neutral-300 rounded-xl overflow-hidden">
                      <button
                        onClick={() => update(item, Math.max(1, item.qty - 1))}
                        className="px-4 py-3 hover:bg-neutral-100 transition-colors font-semibold text-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => update(item, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center py-3 border-0 focus:ring-0 font-semibold"
                      />
                      <button
                        onClick={() => update(item, item.qty + 1)}
                        className="px-4 py-3 hover:bg-neutral-100 transition-colors font-semibold text-lg"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => remove(item)}
                      className="p-3 text-error-500 hover:bg-error-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Remover item"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Item total */}
                <div className="mt-6 pt-6 border-t-2 border-neutral-200 flex justify-between items-center">
                  <span className="text-neutral-600 font-medium">Subtotal do item:</span>
                  <span className="text-2xl font-bold text-primary-700">R$ {(Number(item.price) * item.qty).toFixed(2)}</span>
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
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:sticky sm:top-28">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Resumo do pedido</h2>

              {/* Shipping: CEP and quotes */}
              <div className="mb-6">
                <label className="block text-base font-semibold text-neutral-700 mb-2">Calcular frete</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="20730-480"
                    value={formatZip(zip)}
                    onChange={(e) => setZip(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={loadingQuotes || items.length === 0}
                    className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 disabled:bg-neutral-300 transition-all"
                  >
                    {loadingQuotes ? 'Calculando...' : 'Calcular'}
                  </button>
                </div>
                {quoteError && <div className="text-sm text-error-600 mt-2 font-medium">{quoteError}</div>}
              </div>

              {quotes.length > 0 && (
                <div className="mb-6 space-y-3">
                  {quotes.map(q => (
                    <label key={q.service_id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedQuote?.service_id === q.service_id ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'}`}>
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

              {!isAuthenticated && (
                <div className="mb-6">
                  <label className="block text-base font-semibold text-neutral-700 mb-2">Dados do comprador</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nome"
                      value={guestInfo.first_name}
                      onChange={(e) => setGuestInfo(v => ({...v, first_name: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Sobrenome"
                      value={guestInfo.last_name}
                      onChange={(e) => setGuestInfo(v => ({...v, last_name: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo(v => ({...v, email: e.target.value}))}
                    className="mt-3 w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                  />
                  {guestError && <div className="text-sm text-error-600 mt-2 font-medium">{guestError}</div>}
                </div>
              )}

              {!isAuthenticated && (
                <div className="mb-6">
                  <label className="block text-base font-semibold text-neutral-700 mb-2">Endereço de entrega</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Rua"
                      value={guestAddr.shipping_street}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_street: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={guestAddr.shipping_number}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_number: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <input
                      type="text"
                      placeholder="Complemento"
                      value={guestAddr.shipping_complement}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_complement: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={guestAddr.shipping_neighborhood}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_neighborhood: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={guestAddr.shipping_city}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_city: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Estado (UF)"
                      value={guestAddr.shipping_state}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_state: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="CEP"
                      value={formatZip(guestAddr.shipping_zip)}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_zip: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Telefone (opcional)"
                      value={guestAddr.shipping_phone}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_phone: e.target.value}))}
                      className="px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                    />
                  </div>
                  {guestAddrError && <div className="text-sm text-error-600 mt-2 font-medium">{guestAddrError}</div>}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-base font-semibold text-neutral-700 mb-2">Cupom de desconto</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Digite seu cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium"
                  />
                  <button onClick={applyCoupon} className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-all">Aplicar</button>
                </div>
                {couponError && <div className="text-sm text-error-600 mt-2 font-medium">{couponError}</div>}
                {coupon && (
                  <div className="text-sm text-success-700 mt-2 font-semibold">✓ Cupom aplicado: {coupon.code}</div>
                )}
              </div>

              <div className="space-y-5">
                <div className="flex justify-between text-base">
                  <span className="text-neutral-600 font-medium">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                  <span className="font-semibold text-neutral-900">R$ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-base">
                  <span className="text-neutral-600 font-medium">Frete</span>
                  <span className="font-semibold text-neutral-900">{shipping === 0 ? '—' : `R$ ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-neutral-600 font-medium">Desconto</span>
                  <span className="font-semibold text-success-700">{discount > 0 ? `- R$ ${discount.toFixed(2)}` : '—'}</span>
                </div>

                {/* Tip: could add free shipping rule hint here if needed */}

                <div className="border-t-2 border-neutral-200 pt-5">
                  <div className="flex justify-between text-2xl font-bold">
                    <span className="text-neutral-900">Total</span>
                    <span className="text-primary-700">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {/* Botão PIX - Principal */}
                <button 
                  onClick={handleCheckoutPix}
                  disabled={isProcessing}
                  className={`w-full py-6 px-6 rounded-xl transition-all ${
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
                      Processando...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xl font-bold">Pagar com PIX</span>
                      </div>
                      <span className="text-sm font-normal opacity-90">Pagamento instantâneo via QR Code</span>
                    </div>
                  )}
                </button>

                {/* Botão Outros Métodos - Secundário */}
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`w-full py-6 px-6 rounded-xl transition-all ${
                    isProcessing 
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' 
                      : 'bg-white border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-lg font-bold">Cartão, Boleto e Mais</span>
                    </div>
                    <span className="text-sm font-normal text-neutral-600">Parcelamento em até 12x sem juros</span>
                  </div>
                </button>
              </div>

              <Link 
                to="/catalog" 
                className="block w-full mt-4 text-center py-4 px-6 border-2 border-neutral-300 rounded-xl font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all"
              >
                Continuar comprando
              </Link>

              {/* Security badges */}
              <div className="mt-8 pt-8 border-t-2 border-neutral-200">
                <div className="flex items-center justify-center gap-3 text-base text-neutral-600">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-semibold">Compra 100% segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
