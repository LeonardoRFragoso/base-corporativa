import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

/**
 * Componente de imagem com lazy loading otimizado
 * Melhora significativamente a performance do e-commerce
 */
export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  aspectRatio = 'aspect-square'
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver();

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      ref={targetRef} 
      className={`${aspectRatio} bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative ${className}`}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-700" />
      )}

      {/* Imagem real - só carrega quando visível */}
      {hasIntersected && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
      )}

      {/* Fallback para erro */}
      {hasError && fallback && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback}
        </div>
      )}

      {/* Fallback padrão */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 dark:text-neutral-600">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}
