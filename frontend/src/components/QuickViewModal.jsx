import { useState } from 'react'
import { X, ShoppingCart, Heart, Star, Check, Truck, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

/**
 * Modal de visualização rápida de produto
 */
export default function QuickViewModal({ product, isOpen, onClose }) {
  const { add } = useCart()
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  if (!isOpen || !product) return null

  // Build image URL correctly
  const raw = product.images && product.images[0]?.image
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  const image = raw
    ? (raw.startsWith('http')
        ? raw
        : `${baseURL}${raw.startsWith('/') ? '' : '/'}${raw}`)
    : null

  // Check stock from variants
  const hasStock = product.variants && product.variants.some(v => v.stock > 0)
  const availableSizes = product.variants
    ? [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))].filter(Boolean)
    : ['P', 'M', 'G', 'GG']

  const variantForSelectedSize = selectedSize
    ? product.variants?.find(v => v.size === selectedSize && v.stock > 0)
    : null

  const firstAvailableVariant = product.variants?.find(v => v.stock > 0)

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Selecione um tamanho')
      return
    }

    const variantToAdd = variantForSelectedSize || firstAvailableVariant
    if (!variantToAdd || isAddingToCart) {
      toast.error('Tamanho indisponível')
      return
    }

    setIsAddingToCart(true)
    
    try {
      const cartItem = {
        id: product.id,
        variantId: variantToAdd.id,
        name: product.name,
        price: Number(variantToAdd.price || product.base_price),
        image: image,
        size: variantToAdd.size,
        color: variantToAdd.color,
        qty: quantity
      }
      
      add(cartItem)
      toast.success('Produto adicionado ao carrinho!')
      setTimeout(() => onClose(), 500)
    } catch (error) {
      toast.error('Erro ao adicionar ao carrinho')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const isInStock = hasStock

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Visualização Rápida
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-8 p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Image */}
            <div className="relative bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden">
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-neutral-400"><svg class="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <svg className="w-20 h-20 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Out of Stock Overlay - Only show if truly out of stock */}
              {!isInStock && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-white text-2xl font-bold block mb-2">Esgotado</span>
                    <span className="text-white/80 text-sm">Produto indisponível no momento</span>
                  </div>
                </div>
              )}
              
              {/* Featured Badge */}
              {product.is_featured && isInStock && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Destaque
                </div>
              )}
              
              {/* Discount Badge */}
              {isInStock && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  -30% OFF
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {/* Category */}
              <div className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-2">
                {product.category_name || 'Camisas'}
              </div>

              {/* Name */}
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  (127 avaliações)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    R$ {Number(product.base_price || product.price || 0).toFixed(2)}
                  </div>
                  <div className="text-lg text-neutral-500 dark:text-neutral-500 line-through">
                    R$ {(Number(product.base_price || product.price || 0) * 1.43).toFixed(2)}
                  </div>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  ou 3x de R$ {(Number(product.base_price || product.price || 0) / 3).toFixed(2)} sem juros
                </div>
              </div>

              {/* Description */}
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                {product.description || 'Camisa premium de alta qualidade, confeccionada com tecidos selecionados e design minimalista. Perfeita para o dia a dia profissional.'}
              </p>

              {/* Sizes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Tamanho {selectedSize && <span className="text-primary-600 dark:text-primary-400">({selectedSize})</span>}
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isInStock}
                      className={`px-5 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedSize === size
                          ? 'bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-neutral-800 scale-105'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {availableSizes.length === 0 && (
                  <p className="text-sm text-error-600 dark:text-error-400 mt-2">
                    Nenhum tamanho disponível no momento
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Quantidade
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock || isAddingToCart || !selectedSize}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-neutral-400 disabled:to-neutral-400 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adicionando...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {isInStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
                    </>
                  )}
                </button>
                <button 
                  className="p-4 bg-neutral-100 dark:bg-neutral-700 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-900/30 rounded-xl transition-all group"
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.success('Adicionado aos favoritos!')
                  }}
                >
                  <Heart className="w-5 h-5 text-neutral-900 dark:text-neutral-100 group-hover:fill-error-600 group-hover:text-error-600 transition-all" />
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Frete grátis acima de R$ 200</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Garantia de 30 dias</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Troca facilitada</span>
                </div>
              </div>

              {/* View Full Details */}
              <Link
                to={`/product/${product.id}`}
                className="mt-6 text-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
              >
                Ver todos os detalhes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
