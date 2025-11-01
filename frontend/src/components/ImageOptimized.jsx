import { useState } from 'react'

export default function ImageOptimized({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  loading = 'lazy',
  objectFit = 'cover'
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Placeholder while loading
  const placeholderSrc = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width || 400} ${height || 400}'%3E%3Crect width='100%25' height='100%25' fill='%23e5e5e5'/%3E%3C/svg%3E`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
      )}
      
      <img
        src={hasError ? placeholderSrc : src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit }}
      />
    </div>
  )
}
