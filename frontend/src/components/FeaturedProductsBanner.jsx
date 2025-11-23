import { Star, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Banner de Produtos em Destaque para Catálogo
 */
export default function FeaturedProductsBanner({ products = [] }) {
  // Pegar apenas os 3 primeiros produtos em destaque
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 3)

  if (featuredProducts.length === 0) return null

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            Em Destaque
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Os produtos mais vendidos da semana
          </p>
        </div>
      </div>

      {/* Featured Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredProducts.map((product, index) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group relative bg-gradient-to-br from-primary-50 to-bronze-50/50 dark:from-neutral-800 dark:to-neutral-800 rounded-2xl p-6 border-2 border-primary-200 dark:border-primary-900/30 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            {/* Position Badge */}
            <div className="absolute top-4 left-4 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
              {index + 1}
            </div>

            {/* Trending Badge */}
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
              <TrendingUp className="w-3 h-3" />
              TOP
            </div>

            {/* Image */}
            <div className="relative mb-4 mt-8">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info */}
            <div>
              {/* Category */}
              <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold mb-2">
                {product.category_name || 'Camisas'}
              </div>

              {/* Name */}
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  4.8 (89)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  R$ {product.price}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-500 line-through">
                  R$ {(product.price * 1.43).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                  -30%
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      Em estoque
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 dark:text-red-400 font-semibold">
                      Esgotado
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/0 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </Link>
        ))}
      </div>

      {/* Bottom Message */}
      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          ⚡ Compre agora e ganhe <strong className="text-primary-600 dark:text-primary-400">frete grátis</strong> acima de R$ 200
        </p>
      </div>
    </div>
  )
}
