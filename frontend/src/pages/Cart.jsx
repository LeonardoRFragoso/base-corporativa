import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { trackBeginCheckout } from '../utils/analytics.js'
import CartProgressIndicator from '../components/CartProgressIndicator.jsx'
import FreeShippingBar from '../components/FreeShippingBar.jsx'
import CartTrustBadges from '../components/CartTrustBadges.jsx'
import PaymentMethodsPreview from '../components/PaymentMethodsPreview.jsx'
import SavingsBadge from '../components/SavingsBadge.jsx'

export default function Cart() {
  const { items, update, remove, clear } = useCart()
  const { isAuthenticated, user } = useAuth()
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
  const [guestInfo, setGuestInfo] = useState({ first_name: '', last_name: '', email: '', cpf: '' })
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
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [addressFilled, setAddressFilled] = useState(false)
  
  // Validação em tempo real
  const [emailValid, setEmailValid] = useState(true)
  const [cpfValid, setCpfValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)

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

  // Formatar CPF
  function formatCPF(v) {
    const n = onlyNumbers(v).slice(0, 11)
    if (n.length <= 3) return n
    if (n.length <= 6) return `${n.slice(0,3)}.${n.slice(3)}`
    if (n.length <= 9) return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6)}`
    return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9)}`
  }

  // Validar email
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Validar CPF
  function validateCPF(cpf) {
    const cleanCpf = onlyNumbers(cpf)
    return cleanCpf.length === 11
  }

  // Validar telefone
  function validatePhone(phone) {
    const cleanPhone = onlyNumbers(phone)
    return cleanPhone.length === 0 || cleanPhone.length === 10 || cleanPhone.length === 11
  }

  // Buscar endereço pelo CEP via ViaCEP
  async function fetchAddressByZip(cep) {
    setLoadingAddress(true)
    setGuestAddrError('')
    try {
      const cleanCep = zipNumbersOnly(cep)
      if (cleanCep.length !== 8) {
        setGuestAddrError('CEP deve conter 8 dígitos')
        return
      }
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        setGuestAddrError('CEP não encontrado')
        return
      }
      
      setGuestAddr(prev => ({
        ...prev,
        shipping_street: data.logradouro || prev.shipping_street,
        shipping_neighborhood: data.bairro || prev.shipping_neighborhood,
        shipping_city: data.localidade || prev.shipping_city,
        shipping_state: data.uf || prev.shipping_state,
        shipping_zip: formatZip(cleanCep)
      }))
      setAddressFilled(true)
      setGuestAddrError('')
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      setGuestAddrError('Erro ao buscar endereço. Preencha manualmente.')
    } finally {
      setLoadingAddress(false)
    }
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
      
      // Para usuários não autenticados, preencher endereço automaticamente
      if (!isAuthenticated && zipNormalized.length === 8) {
        fetchAddressByZip(zipNormalized)
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
      const { first_name, last_name, email, cpf } = guestInfo
      if (!first_name || !last_name || !email) {
        setGuestError('Preencha nome, sobrenome e e-mail para concluir a compra.')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setGuestError('Informe um e-mail válido.')
        return false
      }
      // Validar CPF (11 dígitos)
      const cpfDigits = cpf.replace(/\D/g, '')
      if (!cpfDigits || cpfDigits.length !== 11) {
        setGuestError('Informe um CPF válido (11 dígitos).')
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
      shipping_price: selectedQuote ? parseFloat(Number(selectedQuote.price).toFixed(2)) : 0,
      items: items.map(item => ({
        name: item.name,
        qty: item.qty,
        price: parseFloat(Number(item.price).toFixed(2)),
        size: item.size,
        color: item.color
      }))
    }
    
    // Adicionar dados do comprador (obrigatório para todos)
    if (isAuthenticated) {
      checkoutData.email = user?.email || ''
      checkoutData.first_name = user?.first_name || ''
      checkoutData.last_name = user?.last_name || ''
      if (selectedAddressId) {
        checkoutData.address_id = selectedAddressId
        // Enviar dados do endereço selecionado
        const selectedAddr = addresses.find(a => a.id === selectedAddressId)
        if (selectedAddr) {
          checkoutData.shipping_first_name = selectedAddr.first_name || user?.first_name || ''
          checkoutData.shipping_last_name = selectedAddr.last_name || user?.last_name || ''
          checkoutData.shipping_phone = selectedAddr.phone || ''
          checkoutData.shipping_street = selectedAddr.street || ''
          checkoutData.shipping_number = selectedAddr.number || ''
          checkoutData.shipping_complement = selectedAddr.complement || ''
          checkoutData.shipping_neighborhood = selectedAddr.neighborhood || ''
          checkoutData.shipping_city = selectedAddr.city || ''
          checkoutData.shipping_state = selectedAddr.state || ''
          checkoutData.shipping_zip = selectedAddr.zip_code || ''
        }
      }
    } else {
      checkoutData.first_name = guestInfo.first_name
      checkoutData.last_name = guestInfo.last_name
      checkoutData.email = guestInfo.email
      checkoutData.cpf = guestInfo.cpf.replace(/\D/g, '')
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
      checkoutData.discount_amount = parseFloat(Number(discount).toFixed(2))
    }
    // Para PIX, adicionar frete como item (mantém compatibilidade)
    // Para cartão, o shipping_price já está sendo enviado separadamente
    if (selectedQuote && Number(selectedQuote.price) > 0) {
      checkoutData.items.push({ name: 'Frete', qty: 1, price: parseFloat(Number(selectedQuote.price).toFixed(2)) })
    }
    return checkoutData
  }

  const handleCheckoutPix = async () => {
    if (isProcessing) return
    if (!validateCheckoutData()) {
      return
    }
    
    // Track begin checkout
    trackBeginCheckout(items, total)
    
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
    
    // Track begin checkout
    trackBeginCheckout(items, total)
    
    setIsProcessing(true)
    
    try {
      const checkoutData = buildCheckoutData()
      // Redirecionar para checkout de cartão transparente
      navigate('/checkout/card', { state: { checkoutData } })
    } catch (error) {
      console.error('Erro no checkout:', error)
      alert('Erro ao processar checkout. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-bronze-100 rounded-full mb-8">
              <svg className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6L5 9z" />
              </svg>
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-6">Seu carrinho está vazio</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto">Que tal dar uma olhada em nossos produtos?</p>
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
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <CartProgressIndicator currentStep={1} />

        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Carrinho de Compras
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            {items.length} {items.length === 1 ? 'item' : 'itens'} no seu <span className="text-primary-700 font-medium">carrinho</span>
          </p>
        </div>

        {/* Free Shipping Progress Bar */}
        <FreeShippingBar subtotal={subtotal} freeShippingThreshold={200} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-3 space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-neutral-900/50 hover:shadow-xl dark:hover:shadow-primary-500/20 transition-all duration-300 p-4 sm:p-6 md:p-8 border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Product image placeholder */}
                  {item.image ? (
                    <img
                      src={item.image.startsWith('http') ? item.image : `${baseURL}${item.image}`}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-neutral-100 dark:bg-neutral-800"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{item.name}</h3>
                    <div className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 space-y-1">
                      {item.size && <div><span className="font-medium">Tamanho:</span> {item.size}</div>}
                      {item.color && <div><span className="font-medium">Cor:</span> {item.color}</div>}
                      <div className="font-semibold text-primary-700 dark:text-primary-400 text-base sm:text-lg mt-2">R$ {Number(item.price).toFixed(2)} <span className="text-xs sm:text-sm font-normal text-neutral-500 dark:text-neutral-400">cada</span></div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
                    {/* Quantity controls */}
                    <div className="flex items-center border-2 border-neutral-300 dark:border-neutral-600 rounded-xl overflow-hidden">
                      <button
                        onClick={() => update(item, Math.max(1, item.qty - 1))}
                        className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors font-semibold text-base sm:text-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => update(item, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 sm:w-16 text-center py-2 sm:py-3 border-0 focus:ring-0 font-semibold bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm sm:text-base"
                      />
                      <button
                        onClick={() => update(item, item.qty + 1)}
                        className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors font-semibold text-base sm:text-lg"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => remove(item)}
                      className="p-2 sm:p-3 text-error-500 hover:bg-error-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Remover item"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Item total */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                  <span className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium">Subtotal do item:</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary-700 dark:text-primary-400">R$ {(Number(item.price) * item.qty).toFixed(2)}</span>
                </div>
              </div>
            ))}

            {/* Clear cart button */}
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={clear}
                className="text-error-500 hover:text-error-700 text-sm font-medium transition-colors px-4 py-2 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg"
              >
                Limpar carrinho
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Savings Badge */}
            <SavingsBadge discount={discount} freeShipping={subtotal >= 200} />

            <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-neutral-900/50 p-6 sm:p-8 overflow-hidden border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">Resumo do pedido</h2>
                </div>

              {/* Shipping: CEP and quotes */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">
                  📍 Calcular Frete
                </label>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="20730-480"
                    value={formatZip(zip)}
                    onChange={(e) => setZip(e.target.value)}
                    autoComplete="off"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={loadingQuotes || items.length === 0}
                    className="w-full px-6 py-3 rounded-xl bg-neutral-900 dark:bg-neutral-700 text-white font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {loadingQuotes ? 'Calculando...' : 'Calcular'}
                  </button>
                </div>
                {quoteError && <div className="text-sm text-error-600 mt-2 font-medium">{quoteError}</div>}
              </div>

              {loadingQuotes && (
                <div className="mb-6 space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              )}

              {quotes.length > 0 && !loadingQuotes && (
                <div className="mb-6 space-y-3">
                  {quotes.map(q => (
                    <label key={q.service_id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedQuote?.service_id === q.service_id ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-md'}`}>
                      <div className="flex items-center gap-3">
                        {q.carrier_logo ? (
                          <img src={q.carrier_logo} alt={q.carrier} className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-primary-950 dark:text-neutral-100">{q.carrier} • {q.service_name}</div>
                          {q.delivery_time && (
                            <div className="text-xs text-neutral-600 dark:text-neutral-400">Prazo: {q.delivery_time} dias úteis</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-primary-950 dark:text-primary-400">R$ {Number(q.price).toFixed(2)}</div>
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
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Endereço de entrega</label>
                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value) || null)}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-950 dark:focus:ring-primary-400 focus:border-transparent text-neutral-900 dark:text-neutral-100 transition-colors"
                    >
                      {addresses.map(a => (
                        <option key={a.id} value={a.id}>{a.street}, {a.number} - {a.city}/{a.state} • CEP {a.zip_code}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Nenhum endereço cadastrado.</div>
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
                <div className="mb-5">
                  <label className="block text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">
                    👤 Dados do Comprador
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nome"
                      value={guestInfo.first_name}
                      onChange={(e) => setGuestInfo(v => ({...v, first_name: e.target.value}))}
                      autoComplete="given-name"
                      className="px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Sobrenome"
                      value={guestInfo.last_name}
                      onChange={(e) => setGuestInfo(v => ({...v, last_name: e.target.value}))}
                      autoComplete="family-name"
                      className="px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={guestInfo.email}
                        onChange={(e) => {
                          const email = e.target.value
                          setGuestInfo(v => ({...v, email}))
                          setEmailValid(email === '' || validateEmail(email))
                        }}
                        onBlur={() => setEmailValid(guestInfo.email === '' || validateEmail(guestInfo.email))}
                        autoComplete="email"
                        aria-label="E-mail"
                        aria-invalid={!emailValid}
                        className={`px-4 py-2.5 w-full bg-white dark:bg-neutral-700 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors ${
                          emailValid 
                            ? 'border-neutral-300 dark:border-neutral-600 focus:border-primary-600 dark:focus:border-primary-400' 
                            : 'border-error-500 focus:border-error-600'
                        }`}
                      />
                      {!emailValid && guestInfo.email && (
                        <div className="flex items-center gap-1 text-xs text-error-600 mt-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          E-mail inválido
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="CPF (000.000.000-00)"
                        value={guestInfo.cpf}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value)
                          setGuestInfo(v => ({...v, cpf: formatted}))
                          setCpfValid(formatted === '' || validateCPF(formatted))
                        }}
                        onBlur={() => setCpfValid(guestInfo.cpf === '' || validateCPF(guestInfo.cpf))}
                        maxLength={14}
                        autoComplete="off"
                        aria-label="CPF"
                        aria-invalid={!cpfValid}
                        className={`px-4 py-2.5 w-full bg-white dark:bg-neutral-700 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors ${
                          cpfValid 
                            ? 'border-neutral-300 dark:border-neutral-600 focus:border-primary-600 dark:focus:border-primary-400' 
                            : 'border-error-500 focus:border-error-600'
                        }`}
                      />
                      {!cpfValid && guestInfo.cpf && (
                        <div className="flex items-center gap-1 text-xs text-error-600 mt-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          CPF deve conter 11 dígitos
                        </div>
                      )}
                    </div>
                  </div>
                  {guestError && <div className="text-sm text-error-600 mt-2 font-medium">{guestError}</div>}
                </div>
              )}

              {!isAuthenticated && (
                <div className="mb-5">
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">
                    🏠 Endereço de Entrega
                    {addressFilled && (
                      <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full font-medium">
                        ✓ Preenchido automaticamente pelo CEP
                      </span>
                    )}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Rua"
                      value={guestAddr.shipping_street}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_street: e.target.value}))}
                      disabled={loadingAddress}
                      autoComplete="street-address"
                      className="px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={guestAddr.shipping_number}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_number: e.target.value}))}
                      autoComplete="off"
                      className="px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Complemento (opcional)"
                      value={guestAddr.shipping_complement}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_complement: e.target.value}))}
                      autoComplete="off"
                      className="px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={guestAddr.shipping_neighborhood}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_neighborhood: e.target.value}))}
                      disabled={loadingAddress}
                      autoComplete="off"
                      className="px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={guestAddr.shipping_city}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_city: e.target.value}))}
                      disabled={loadingAddress}
                      autoComplete="address-level2"
                      className="px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      placeholder="Estado (UF)"
                      value={normalizeUF(guestAddr.shipping_state)}
                      onChange={(e) => setGuestAddr(v => ({...v, shipping_state: e.target.value}))}
                      maxLength={2}
                      disabled={loadingAddress}
                      autoComplete="address-level1"
                      className="px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Telefone (opcional) - (00) 00000-0000"
                        value={formatPhoneBR(guestAddr.shipping_phone)}
                        onChange={(e) => {
                          const value = e.target.value
                          setGuestAddr(v => ({...v, shipping_phone: value}))
                          setPhoneValid(validatePhone(value))
                        }}
                        onBlur={() => setPhoneValid(validatePhone(guestAddr.shipping_phone))}
                        maxLength={15}
                        autoComplete="tel"
                        aria-label="Telefone"
                        aria-invalid={!phoneValid}
                        className={`px-4 py-2.5 w-full bg-white dark:bg-neutral-700 border-2 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors ${
                          phoneValid 
                            ? 'border-neutral-300 dark:border-neutral-600 focus:border-primary-600 dark:focus:border-primary-400' 
                            : 'border-error-500 focus:border-error-600'
                        }`}
                      />
                      {!phoneValid && guestAddr.shipping_phone && (
                        <div className="flex items-center gap-1 text-xs text-error-600 mt-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Telefone inválido (use DDD + número)
                        </div>
                      )}
                    </div>
                  </div>
                  {guestAddrError && <div className="text-sm text-error-600 mt-2 font-medium">{guestAddrError}</div>}
                </div>
              )}

              <div className="mb-5">
                <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">
                  🎟️ Cupom de Desconto
                  <button
                    type="button"
                    className="group relative"
                    aria-label="Informações sobre cupom de desconto"
                  >
                    <svg className="w-4 h-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                      Digite o código do cupom para obter desconto
                      <svg className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 text-neutral-900" viewBox="0 0 8 8">
                        <path fill="currentColor" d="M0 0l4 4 4-4z" />
                      </svg>
                    </span>
                  </button>
                </label>
                <div className="flex items-stretch gap-3">
                  <input
                    type="text"
                    placeholder="Digite seu cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    autoComplete="off"
                    className="flex-1 min-w-0 px-4 py-2.5 bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-primary-600 dark:focus:border-primary-400 font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
                  />
                  <button onClick={applyCoupon} className="px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-700 text-white font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-600 transition-all shrink-0 whitespace-nowrap hover:scale-[1.02] active:scale-95">Aplicar</button>
                </div>
                {couponError && <div className="text-sm text-error-600 mt-2 font-medium">{couponError}</div>}
                {coupon && (
                  <div className="text-sm text-success-700 mt-2 font-semibold">✓ Cupom aplicado: {coupon.code}</div>
                )}
              </div>

              <div className="space-y-3 bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900/50 dark:to-neutral-900/30 rounded-xl p-5 border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-sm">
                <div className="flex items-center justify-between py-2.5 border-b-2 border-neutral-200/60 dark:border-neutral-700/60">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                  </div>
                  <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">R$ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">Frete</span>
                  </div>
                  <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {shipping === 0 ? (
                      <span className="text-neutral-500 dark:text-neutral-400">—</span>
                    ) : subtotal >= 200 ? (
                      <span className="text-success-600 dark:text-success-400">Grátis</span>
                    ) : (
                      `R$ ${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">Desconto</span>
                  </div>
                  <span className="text-lg font-bold text-success-600 dark:text-success-400">
                    {discount > 0 ? `- R$ ${discount.toFixed(2)}` : <span className="text-neutral-500 dark:text-neutral-400">—</span>}
                  </span>
                </div>
              </div>

                {/* Tip: could add free shipping rule hint here if needed */}

                <div className="mt-5 bg-gradient-to-br from-primary-50 via-primary-100/50 to-bronze-50 dark:from-primary-900/30 dark:via-primary-900/20 dark:to-bronze-900/30 rounded-xl p-6 border-2 border-primary-300/60 dark:border-primary-700/60 shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide block mb-1">Total a Pagar</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-500">{items.length} {items.length === 1 ? 'produto' : 'produtos'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-display font-black text-primary-700 dark:text-primary-400 leading-none">
                        R$ {total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/20 px-4 py-2 rounded-lg">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Você está economizando R$ {discount.toFixed(2)}!</span>
                    </div>
                  )}
                  {subtotal >= 200 && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/20 px-4 py-2 rounded-lg">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                      <span className="font-semibold">Frete grátis!</span>
                    </div>
                  )}
                </div>

              <div className="mt-6 space-y-3 sm:space-y-4">
                {/* Botão PIX - Principal */}
                <button 
                  onClick={handleCheckoutPix}
                  disabled={isProcessing}
                  className={`w-full py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all ${
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
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-lg sm:text-xl font-bold">Pagar com PIX</span>
                      </div>
                      <span className="text-xs sm:text-sm font-normal opacity-90">Pagamento instantâneo via QR Code</span>
                    </div>
                  )}
                </button>

                {/* Botão Outros Métodos - Secundário */}
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`w-full py-4 sm:py-5 px-4 sm:px-6 rounded-xl transition-all ${
                    isProcessing 
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' 
                      : 'bg-white border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-base sm:text-lg font-bold">Cartão, Boleto e Mais</span>
                    </div>
                    <span className="text-xs sm:text-sm font-normal text-neutral-600 dark:text-neutral-400">Parcelamento em até 12x sem juros</span>
                  </div>
                </button>
              </div>

              <Link 
                to="/catalog" 
                className="block w-full mt-4 text-center py-4 px-6 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 hover:border-neutral-400 transition-all hover:scale-[1.01] active:scale-99"
              >
                Continuar comprando
              </Link>
            </div>
          </div>

          {/* Sidebar - Payment Methods & Trust Badges */}
          <div className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Payment Methods Preview */}
              <PaymentMethodsPreview />

              {/* Trust Badges */}
              <CartTrustBadges />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
