import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Heart, GitCompare } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useCompare } from '../context/CompareContext.jsx'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false)
  const { add } = useCart()
  const { addToCompare, isInCompare } = useCompare()
  const navigate = useNavigate()
  const inCompare = isInCompare(product.id)
  
  const price = product.base_price
  const raw = product.images && product.images[0]?.image
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  const image = raw
    ? (raw.startsWith('http')
        ? raw
        : `${baseURL}${raw.startsWith('/') ? '' : '/'}${raw}`)
    : null
  
  // Check if product has variants in stock
  const hasStock = product.variants && product.variants.some(v => v.stock > 0)
  const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : 0
  
  // Get first available variant for quick add
  const firstAvailableVariant = product.variants?.find(v => v.stock > 0)
  
  // Sizes available (in stock) and selection state
  const availableSizes = product.variants
    ? [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))].filter(Boolean)
    : []

  const [selectedSize, setSelectedSize] = useState(null)

  useEffect(() => {
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0])
    }
  }, [availableSizes, selectedSize])

  const variantForSelectedSize = selectedSize
    ? product.variants?.find(v => v.size === selectedSize && v.stock > 0)
    : null
  
  const handleAddToCart = (e) => {
    e.preventDefault() // Prevent navigation to product page
    e.stopPropagation()
    
    const variantToAdd = variantForSelectedSize || firstAvailableVariant
    if (!variantToAdd || isAdding) return
    
    setIsAdding(true)
    
    const cartItem = {
      id: product.id,
      variantId: variantToAdd.id,
      name: product.name,
      price: Number(variantToAdd.price || product.base_price),
      image: image,
      size: variantToAdd.size,
      color: variantToAdd.color,
      qty: 1
    }
    
    add(cartItem)
    
    // Reset button state after animation
    setTimeout(() => setIsAdding(false), 1000)
  }
  
  return (
    <div className="group bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-soft dark:shadow-neutral-900/50 hover:shadow-strong dark:hover:shadow-primary-500/20 transition-all duration-500 overflow-hidden hover:-translate-y-2 border border-neutral-100 dark:border-neutral-700 hover:border-primary-200 dark:hover:border-primary-500">
        {/* Image */}
        <div 
          className="aspect-square bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden relative cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={(e) => {
                e.stopPropagation()
                const result = addToCompare(product)
                if (result.success) {
                  toast.success(result.message)
                } else {
                  toast.error(result.message)
                }
              }}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                inCompare 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white/90 text-neutral-700 hover:bg-primary-600 hover:text-white'
              }`}
              aria-label="Adicionar à comparação"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          </div>
          {image ? (
            <img 
              src={image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Stock badge */}
          {!hasStock && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-error-600 to-error-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-medium backdrop-blur-sm">
              Esgotado
            </div>
          )}
          
          {/* Fabric Type badge */}
          {product.fabric_type && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-bronze-700 to-bronze-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-medium backdrop-blur-sm">
              {product.fabric_type}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 
            className="font-semibold text-lg text-primary-950 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-bronze-700 dark:hover:text-bronze-400 transition-colors cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {product.name}
          </h3>
          
          {/* Description preview */}
          {product.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          {/* Fabric type */}
          {product.fabric_type && (
            <div className="inline-flex items-center text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 px-2 py-1 rounded-lg mb-3">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {product.fabric_type}
            </div>
          )}
          
          {/* Price and stock info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-600 dark:text-neutral-400 mb-0.5">A partir de</span>
              <div className="text-2xl font-bold text-primary-950 dark:text-primary-400">
                R$ {Number(price).toFixed(2)}
              </div>
            </div>
            {hasStock && totalStock <= 5 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-warning-700 bg-warning-50 px-2 py-1 rounded-lg">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Últimas {totalStock}
              </div>
            )}
          </div>
          
          {/* Available sizes (interactive) */}
          {product.variants && product.variants.length > 0 && availableSizes.length > 0 && (
            <div className="mt-3 mb-4">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 block">Tamanhos disponíveis:</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedSize(size) }}
                    className={`text-sm font-semibold px-3 py-1.5 rounded-lg border-2 transition-all ${
                      selectedSize === size
                        ? 'border-primary-950 dark:border-primary-500 bg-primary-950 dark:bg-primary-600 text-white shadow-medium transform scale-105'
                        : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Add to Cart Button */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <Link 
              to={`/product/${product.id}`}
              className="flex-1 text-center px-4 py-2.5 border-2 border-primary-500 dark:border-primary-600 text-primary-700 dark:text-primary-400 text-sm font-semibold rounded-xl hover:bg-primary-50 dark:hover:bg-neutral-700 hover:border-primary-600 dark:hover:border-primary-400 transition-all duration-200 transform hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              Ver detalhes
            </Link>
            
            {hasStock && (variantForSelectedSize || firstAvailableVariant) ? (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-soft ${
                  isAdding 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-medium' 
                    : 'bg-gradient-to-r from-bronze-800 to-bronze-600 text-white hover:from-bronze-700 hover:to-bronze-500 hover:shadow-medium transform hover:scale-105'
                }`}
              >
                {isAdding ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Adicionado!
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    Comprar
                  </div>
                )}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed border-2 border-neutral-200 dark:border-neutral-700"
              >
                Esgotado
              </button>
            )}
          </div>
        </div>
    </div>
  )
}
