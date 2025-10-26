import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext.jsx'

export default function ProductCard({ product }) {
  const [isAdding, setIsAdding] = useState(false)
  const { add } = useCart()
  const navigate = useNavigate()
  
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
    <div className="group bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden hover:-translate-y-1">
        {/* Image */}
        <div 
          className="aspect-square bg-neutral-100 overflow-hidden relative cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {image ? (
            <img 
              src={image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
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
            <div className="absolute top-2 left-2 bg-error-500 text-white text-xs px-2 py-1 rounded">
              Esgotado
            </div>
          )}
          
          {/* Category badge */}
          {product.category && (
            <div className="absolute top-2 right-2 bg-primary-500/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-medium">
              {product.category.name}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 
            className="font-medium text-primary-950 mb-2 line-clamp-2 group-hover:text-primary-800 transition-colors cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {product.name}
          </h3>
          
          {/* Description preview */}
          {product.description && (
            <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* Fabric type */}
          {product.fabric_type && (
            <div className="text-xs text-neutral-500 mb-2">
              {product.fabric_type}
            </div>
          )}
          
          {/* Price and stock info */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-primary-950">
              R$ {Number(price).toFixed(2)}
            </div>
            {hasStock && totalStock <= 5 && (
              <div className="text-xs text-warning-600">
                Últimas {totalStock} unidades
              </div>
            )}
          </div>
          
          {/* Available sizes (interactive) */}
          {product.variants && product.variants.length > 0 && availableSizes.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedSize(size) }}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      selectedSize === size
                        ? 'border-primary-950 bg-primary-950 text-white'
                        : 'border-neutral-300 text-neutral-700 hover:border-primary-950'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">Selecione o tamanho antes de comprar</div>
            </div>
          )}
          
          {/* Add to Cart Button */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Link 
              to={`/product/${product.id}`}
              className="flex-1 text-center px-3 py-2 border border-primary-500 text-primary-700 text-sm font-medium rounded-lg hover:bg-primary-50 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              Ver detalhes
            </Link>
            
            {hasStock && (variantForSelectedSize || firstAvailableVariant) ? (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isAdding 
                    ? 'bg-green-500 text-white' 
                    : 'bg-bronze-800 text-white hover:bg-bronze-700 hover:scale-105'
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
                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-neutral-200 text-neutral-500 cursor-not-allowed"
              >
                Esgotado
              </button>
            )}
          </div>
        </div>
    </div>
  )
}
