import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import OptimizedImage from './OptimizedImage.jsx';

/**
 * Hero Section com Slider de Produtos em Destaque
 * Substitui mockup estático por produtos reais
 */
export default function HeroProductSlider({ products = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play do slider
  useEffect(() => {
    if (isPaused || products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000); // 5 segundos por slide

    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!products || products.length === 0) {
    return null;
  }

  const currentProduct = products[currentSlide];

  return (
    <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 text-white overflow-hidden transition-colors duration-300">
      {/* Overlay decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 via-transparent to-bronze-900/5 pointer-events-none"></div>
      
      {/* Geometric Pattern Background */}
      <div className="hidden md:block absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary-400/30 transform rotate-45 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-bronze-700/30 transform rotate-45 animate-pulse" style={{animationDuration: '5s', animationDelay: '0.5s'}}></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto à esquerda */}
          <div className="animate-fade-in z-10">
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Mais de 1.000 profissionais confiam
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-black mb-6 leading-tight tracking-tight">
              BASE<br className="md:hidden" /> CORPORATIVA
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-primary-200 mb-4 font-light tracking-wide">
              {currentProduct.name}
            </p>
            
            <p className="text-sm sm:text-base text-neutral-200 mb-6 leading-relaxed max-w-xl line-clamp-3">
              {currentProduct.description || 'Roupas minimalistas, monocromáticas e de alta qualidade dedicadas ao trabalho.'}
            </p>

            {/* Preço */}
            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">
                  R$ {currentProduct.base_price}
                </span>
                <span className="text-lg text-neutral-400 line-through">
                  R$ {(parseFloat(currentProduct.base_price) * 1.3).toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  -30% OFF
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to={`/product/${currentProduct.id}`}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-bronze-600 to-bronze-700 text-white font-bold text-lg rounded-xl hover:from-bronze-500 hover:to-bronze-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <ShoppingCart className="mr-2 w-5 h-5" />
                Ver Produto
              </Link>
              
              <Link 
                to="/catalog"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                Ver Catálogo
              </Link>
            </div>

            {/* Indicadores de slide */}
            <div className="flex items-center gap-2 mt-8">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-primary-500'
                      : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Produto à direita */}
          <div 
            className="relative flex justify-center lg:justify-end"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Container do produto */}
            <div className="relative w-full max-w-md">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 to-bronze-600/30 rounded-full blur-3xl scale-150 animate-glow-pulse"></div>
              
              {/* Imagem do produto */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-primary-400/40 transition-all duration-500 shadow-2xl">
                <div className="aspect-[3/4] relative overflow-hidden rounded-2xl">
                  {currentProduct.images && currentProduct.images.length > 0 ? (
                    <OptimizedImage
                      src={currentProduct.images[0].image}
                      alt={currentProduct.name}
                      width={400}
                      height={533}
                      priority={currentSlide === 0}
                      objectFit="cover"
                      className="transition-transform duration-700 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-900/20 to-bronze-900/20 flex items-center justify-center">
                      <span className="text-white/50 text-lg">Sem imagem</span>
                    </div>
                  )}
                </div>

                {/* Badge de destaque */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                  DESTAQUE
                </div>
              </div>

              {/* Controles de navegação */}
              {products.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 border border-white/20"
                    aria-label="Slide anterior"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 border border-white/20"
                    aria-label="Próximo slide"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
