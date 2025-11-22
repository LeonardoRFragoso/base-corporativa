import { useState, useEffect } from 'react';
import { Eye, ShoppingCart, Clock, TrendingUp } from 'lucide-react';

/**
 * Componente de Prova Social - Aumenta confiança e urgência
 */
export function LiveViewers({ productId, initialCount = 0 }) {
  const [viewerCount, setViewerCount] = useState(initialCount);

  useEffect(() => {
    // Simula contagem de visualizadores em tempo real
    const baseCount = Math.floor(Math.random() * 8) + 3; // 3-10 pessoas
    setViewerCount(baseCount);

    // Atualiza a cada 10-20 segundos
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 3) - 1; // -1, 0, ou +1
      setViewerCount(prev => Math.max(1, prev + change));
    }, Math.random() * 10000 + 10000);

    return () => clearInterval(interval);
  }, [productId]);

  if (viewerCount < 2) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-lg text-sm font-medium animate-pulse">
      <Eye className="w-4 h-4" />
      <span>{viewerCount} pessoas vendo agora</span>
    </div>
  );
}

/**
 * Contador de vendas recentes
 */
export function RecentSales({ count = 0, timeframe = '24h' }) {
  const [salesCount, setSalesCount] = useState(count);

  useEffect(() => {
    // Simula vendas recentes baseado no produto
    if (count === 0) {
      const randomSales = Math.floor(Math.random() * 15) + 5; // 5-20 vendas
      setSalesCount(randomSales);
    }
  }, [count]);

  if (salesCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 rounded-lg text-sm font-medium">
      <ShoppingCart className="w-4 h-4" />
      <span>{salesCount} vendidos nas últimas {timeframe}</span>
    </div>
  );
}

/**
 * Indicador de estoque baixo (urgência)
 */
export function LowStockBadge({ stock, threshold = 5 }) {
  if (stock > threshold) return null;
  if (stock === 0) return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 rounded-lg text-sm font-semibold">
      <Clock className="w-4 h-4" />
      <span>Esgotado</span>
    </div>
  );

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 rounded-lg text-sm font-semibold animate-pulse">
      <Clock className="w-4 h-4" />
      <span>⚠️ Apenas {stock} em estoque!</span>
    </div>
  );
}

/**
 * Trending badge para produtos populares
 */
export function TrendingBadge({ isTrending = false }) {
  if (!isTrending) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-bold shadow-lg animate-pulse">
      <TrendingUp className="w-3.5 h-3.5" />
      <span>EM ALTA</span>
    </div>
  );
}

/**
 * Timer de oferta com contagem regressiva
 */
export function CountdownTimer({ endDate, label = "Oferta termina em" }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-4 shadow-lg">
      <div className="text-sm font-semibold mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs opacity-90">horas</span>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs opacity-90">min</span>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
          <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs opacity-90">seg</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Trust badges (selos de confiança)
 */
export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Compra 100% Segura</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
        <span className="font-medium">Frete Rápido</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Garantia de 30 dias</span>
      </div>
    </div>
  );
}

/**
 * Reviews summary (resumo de avaliações)
 */
export function ReviewsSummary({ rating = 0, totalReviews = 0 }) {
  if (totalReviews === 0) return null;

  const stars = Math.round(rating * 2) / 2; // Arredonda para 0.5
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 !== 0;
  const emptyStars = 5 - Math.ceil(stars);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d1d5db" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-neutral-300 dark:text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {rating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
      </div>
    </div>
  );
}
