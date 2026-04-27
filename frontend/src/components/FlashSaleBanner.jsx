import { useState, useEffect } from 'react'
import { X, Gift, Clock } from 'lucide-react'
import { api } from '../lib/api.js'

/**
 * Banner de Flash Sale - Exibe promoções ativas do backend
 * Aparece no topo da página, acima do Navbar
 */
export default function FlashSaleBanner() {
  const [flashSale, setFlashSale] = useState(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    loadActiveFlashSale()
  }, [])

  useEffect(() => {
    if (!flashSale) return

    const calculateTimeLeft = () => {
      const difference = new Date(flashSale.end_time) - new Date()
      
      if (difference <= 0) {
        setIsVisible(false)
        return { hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      
      // Se expirou, esconde o banner
      if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsVisible(false)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [flashSale])

  async function loadActiveFlashSale() {
    try {
      const res = await api.get('/api/flash-sales/active/')
      if (res.data && res.data.length > 0) {
        // Pega a primeira promoção ativa
        const activeSale = res.data[0]
        
        // Verifica se o usuário já fechou este banner
        const closedBanners = JSON.parse(localStorage.getItem('closedFlashSaleBanners') || '[]')
        if (closedBanners.includes(activeSale.id)) {
          setIsVisible(false)
          return
        }
        
        setFlashSale(activeSale)
      }
    } catch (error) {
      console.error('Erro ao carregar flash sale:', error)
    }
  }

  function handleClose() {
    setIsClosed(true)
    setIsVisible(false)
    
    // Salva no localStorage que o usuário fechou este banner
    if (flashSale) {
      const closedBanners = JSON.parse(localStorage.getItem('closedFlashSaleBanners') || '[]')
      closedBanners.push(flashSale.id)
      localStorage.setItem('closedFlashSaleBanners', JSON.stringify(closedBanners))
    }
  }

  if (!isVisible || !flashSale || isClosed) return null

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-3 px-4 shadow-lg z-[60]">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Conteúdo Principal */}
        <div className="flex items-center gap-3 flex-1">
          <Gift className="w-6 h-6 animate-bounce hidden sm:block" />
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="font-bold text-lg">
                🎁 {flashSale.name.toUpperCase()}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-sm sm:text-base">
                {flashSale.discount_percentage}% OFF EM TODA A LOJA!
              </span>
            </div>
            {flashSale.description && (
              <p className="text-xs sm:text-sm opacity-90 mt-1">
                {flashSale.description}
              </p>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <Clock className="w-4 h-4" />
            <div className="flex items-center gap-1 text-sm font-bold">
              {timeLeft.days > 0 && (
                <>
                  <span>{String(timeLeft.days).padStart(2, '0')}d</span>
                  <span>:</span>
                </>
              )}
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Botão Fechar */}
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fechar banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
