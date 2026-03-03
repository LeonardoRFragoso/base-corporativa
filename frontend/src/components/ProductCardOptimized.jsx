import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, memo } from 'react';
import { Heart, GitCompare, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import toast from 'react-hot-toast';
import LazyImage from './LazyImage.jsx';
import { formatPrice } from '../utils/performance.js';

/**
 * ProductCard Otimizado com lazy loading e performance melhorada
 * Usa React.memo para evitar re-renders desnecessários
 */
function ProductCardOptimized({ product, onQuickView }) {
  const [isAdding, setIsAdding] = useState(false);
  const { add } = useCart();
  const { addToCompare, isInCompare } = useCompare();
  const navigate = useNavigate();
  const inCompare = isInCompare(product.id);
  
  const price = product.base_price;
  const raw = product.images && product.images[0]?.image;
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const image = raw
    ? (raw.startsWith('http')
        ? raw
        : `${baseURL}${raw.startsWith('/') ? '' : '/'}${raw}`)
    : null;
  
  const hasStock = product.variants && product.variants.some(v => v.stock > 0);
  const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : 0;
  const firstAvailableVariant = product.variants?.find(v => v.stock > 0);
  
  const availableSizes = product.variants
    ? [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))].filter(Boolean)
    : [];

  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const variantForSelectedSize = selectedSize
    ? product.variants?.find(v => v.size === selectedSize && v.stock > 0)
    : null;
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const variantToAdd = variantForSelectedSize || firstAvailableVariant;
    if (!variantToAdd || isAdding) return;
    
    setIsAdding(true);
    
    const cartItem = {
      id: product.id,
      variantId: variantToAdd.id,
      name: product.name,
      price: Number(variantToAdd.price || product.base_price),
      image: image,
      size: variantToAdd.size,
      color: variantToAdd.color,
      qty: 1
    };
    
    add(cartItem);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addToCompare(product);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };
  
  return (
    <div className="group bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-soft dark:shadow-neutral-900/50 hover:shadow-strong dark:hover:shadow-primary-500/20 transition-all duration-500 overflow-hidden hover:-translate-y-2 border border-neutral-100 dark:border-neutral-700 hover:border-primary-200 dark:hover:border-primary-500">
      {/* Image com Lazy Loading */}
      <div 
        className="relative cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <LazyImage
          src={image}
          alt={product.name}
          className="aspect-square"
          fallback={
            <div className="text-neutral-400 dark:text-neutral-600">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          }
        />

        {/* Badge de estoque */}
        {!hasStock && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Esgotado
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleQuickView}
            className="p-2 rounded-full bg-white/90 text-neutral-700 hover:bg-primary-600 hover:text-white backdrop-blur-sm transition-colors"
            aria-label="Visualização rápida"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCompare}
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

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        {product.category && (
          <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2 min-h-[3rem]">
          <Link to={`/product/${product.id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(price)}
          </span>
        </div>

        {/* Sizes */}
        {availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedSize === size
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Stock Info */}
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${
            totalStock === 0 
              ? 'text-red-600 dark:text-red-400' 
              : totalStock < 10 
                ? 'text-orange-600 dark:text-orange-400' 
                : 'text-green-600 dark:text-green-400'
          }`}>
            {totalStock === 0 ? 'Sem estoque' : `${totalStock} em estoque`}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!hasStock || isAdding}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            !hasStock
              ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
              : isAdding
                ? 'bg-green-500 text-white scale-95'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg hover:scale-105'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {isAdding ? 'Adicionado!' : hasStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
}

export default memo(ProductCardOptimized, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.base_price === nextProps.product.base_price &&
         JSON.stringify(prevProps.product.variants) === JSON.stringify(nextProps.product.variants);
});
