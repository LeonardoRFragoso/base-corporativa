import { useState, useEffect } from 'react';

/**
 * Componente de imagem otimizada com:
 * - Lazy loading nativo
 * - WebP com fallback
 * - Blur placeholder
 * - Dimensões responsivas
 * - Cloudflare R2 transformations
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false, // Se true, carrega imediatamente
  objectFit = 'cover',
  sizes = '100vw' // Responsive sizes
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Gera URL otimizada para Cloudflare R2
  const getOptimizedUrl = (url, format = 'auto') => {
    if (!url || url.startsWith('data:')) return url;
    
    // Se já for http/https, usar direto
    if (url.startsWith('http')) {
      // Para Cloudflare R2, adicionar parâmetros de transformação
      if (url.includes('r2.dev')) {
        const urlObj = new URL(url);
        // Adicionar query params para otimização
        urlObj.searchParams.set('format', format);
        if (width) urlObj.searchParams.set('width', width);
        if (height) urlObj.searchParams.set('height', height);
        urlObj.searchParams.set('quality', '85');
        return urlObj.toString();
      }
      return url;
    }
    
    // URL relativa - adicionar base
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    return `${baseURL}${url}`;
  };

  const optimizedSrc = getOptimizedUrl(src, 'webp');
  const fallbackSrc = getOptimizedUrl(src, 'jpeg');

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto'
      }}
    >
      {/* Blur placeholder enquanto carrega */}
      {!isLoaded && !error && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 animate-pulse"
          aria-hidden="true"
        />
      )}
      
      {/* Imagem principal */}
      <picture>
        <source 
          srcSet={optimizedSrc} 
          type="image/webp" 
        />
        <img
          src={fallbackSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={width}
          height={height}
          sizes={sizes}
          className={`
            w-full h-full transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${objectFit === 'cover' ? 'object-cover object-center' : ''}
            ${objectFit === 'contain' ? 'object-contain object-center' : ''}
          `}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
        />
      </picture>
      
      {/* Fallback se a imagem falhar */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <svg 
            className="w-12 h-12 text-neutral-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de background image otimizada
 */
export function OptimizedBackgroundImage({ 
  src, 
  children, 
  className = '',
  overlay = false,
  overlayOpacity = 0.5
}) {
  const getOptimizedUrl = (url) => {
    if (!url || url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    return `${baseURL}${url}`;
  };

  return (
    <div 
      className={`relative ${className}`}
      style={{
        backgroundImage: `url(${getOptimizedUrl(src)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {overlay && (
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
