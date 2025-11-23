import { useState, useEffect } from 'react';
import { X, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Banner Promocional com Countdown Timer
 * Fixo no topo da página, dismissível
 */
export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Data final da promoção (ajuste conforme necessário)
  const promoEndDate = new Date('2025-12-31T23:59:59');

  useEffect(() => {
    // Verificar se banner foi fechado antes
    const dismissed = localStorage.getItem('promoBannerDismissed');
    const dismissedPromoDate = localStorage.getItem('promoBannerPromoDate');
    const currentPromoDate = promoEndDate.toISOString();

    // Se a data da promoção mudou, limpar o dismiss anterior
    if (dismissedPromoDate !== currentPromoDate) {
      localStorage.removeItem('promoBannerDismissed');
      localStorage.setItem('promoBannerPromoDate', currentPromoDate);
    } else if (dismissed) {
      // Verificar se foi fechado recentemente (nas últimas 24 horas)
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      if (now - dismissedDate < 24 * 60 * 60 * 1000) {
        setIsVisible(false);
        return;
      }
    }

    // Atualizar countdown a cada segundo
    const interval = setInterval(() => {
      const now = new Date();
      const difference = promoEndDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Promoção expirada - esconder banner
        setIsVisible(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [promoEndDate]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('promoBannerDismissed', new Date().toISOString());
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-white overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-bold truncate">
                <span className="hidden sm:inline">🔥 BLACK NOVEMBER: </span>
                <span className="uppercase">30% OFF em TODA a Loja!</span>
              </p>
              <p className="text-xs sm:text-sm opacity-90 hidden sm:block">
                Use o cupom: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">NOVEMBRO30</span>
              </p>
            </div>
          </div>

          {/* Center: Countdown */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Clock className="w-5 h-5 hidden sm:block" />
            <div className="flex items-center gap-1 sm:gap-2">
              <TimeUnit value={timeLeft.days} label="d" />
              <span className="font-bold">:</span>
              <TimeUnit value={timeLeft.hours} label="h" />
              <span className="font-bold hidden sm:inline">:</span>
              <TimeUnit value={timeLeft.minutes} label="m" className="hidden sm:flex" />
              <span className="font-bold hidden md:inline">:</span>
              <TimeUnit value={timeLeft.seconds} label="s" className="hidden md:flex" />
            </div>
          </div>

          {/* Right: CTA + Close */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              to="/catalog"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-white text-orange-600 font-bold text-sm rounded-lg hover:bg-neutral-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Aproveitar
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fechar banner"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mobile CTA */}
        <Link
          to="/catalog"
          className="sm:hidden mt-2 flex items-center justify-center px-4 py-2 bg-white text-orange-600 font-bold text-sm rounded-lg shadow-lg"
        >
          Aproveitar Agora
        </Link>
      </div>
    </div>
  );
}

/**
 * Componente para exibir uma unidade de tempo
 */
function TimeUnit({ value, label, className = '' }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="min-w-[2rem] sm:min-w-[2.5rem] px-1 sm:px-2 py-1 bg-white/20 backdrop-blur-sm rounded font-mono font-bold text-base sm:text-lg text-center">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] sm:text-xs font-semibold mt-0.5 opacity-80">
        {label}
      </span>
    </div>
  );
}
