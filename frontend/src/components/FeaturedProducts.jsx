import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import OptimizedImage from './OptimizedImage.jsx';

/**
 * Seção de Produtos em Destaque na Home
 * Grid responsivo com hover effects
 */
export default function FeaturedProducts({ products = [], title = "Destaques da Coleção" }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Seleção Especial
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4 transition-colors duration-300">
            {title}
          </h2>
          
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Peças cuidadosamente selecionadas para elevar seu estilo profissional
          </p>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* CTA Ver Mais */}
        <div className="text-center mt-12">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-bronze-700 hover:from-primary-500 hover:to-bronze-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Ver Todos os Produtos
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Card individual de produto
 */
function ProductCard({ product, index }) {
  const hasDiscount = product.discount_percentage > 0;
  const finalPrice = hasDiscount 
    ? (parseFloat(product.base_price) * (1 - product.discount_percentage / 100)).toFixed(2)
    : product.base_price;

  return (
    <div 
      className="group relative bg-white dark:bg-neutral-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Imagem do Produto */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        {product.images && product.images.length > 0 ? (
          <OptimizedImage
            src={product.images[0].image}
            alt={product.name}
            width={300}
            height={400}
            className="transition-transform duration-700 group-hover:scale-110"
            objectFit="cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center">
            <span className="text-neutral-400 dark:text-neutral-500">Sem imagem</span>
          </div>
        )}

        {/* Overlay com ações */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 transform hover:scale-110"
            aria-label="Ver produto"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-110"
            aria-label="Adicionar à wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
              NOVO
            </span>
          )}
          
          {hasDiscount && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{product.discount_percentage}%
            </span>
          )}
          
          {product.is_featured && (
            <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full shadow-lg">
              DESTAQUE
            </span>
          )}
        </div>

        {/* Badge de estoque baixo */}
        {product.stock < 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              Últimas unidades!
            </span>
          </div>
        )}
      </Link>

      {/* Informações do Produto */}
      <div className="p-5">
        {/* Categoria */}
        {product.category && (
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-2">
            {product.category.name}
          </p>
        )}

        {/* Nome */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Avaliação */}
        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(product.average_rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-neutral-300 dark:text-neutral-600'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">
              ({product.review_count || 0})
            </span>
          </div>
        )}

        {/* Preço */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            R$ {finalPrice}
          </span>
          
          {hasDiscount && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400 line-through">
              R$ {product.base_price}
            </span>
          )}
        </div>

        {/* Botão Adicionar ao Carrinho */}
        <button className="w-full py-3 bg-gradient-to-r from-primary-600 to-bronze-700 hover:from-primary-500 hover:to-bronze-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          <ShoppingCart className="w-4 h-4" />
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}
