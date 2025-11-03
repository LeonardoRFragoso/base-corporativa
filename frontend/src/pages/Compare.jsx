import { Link } from 'react-router-dom'
import { X, ShoppingCart } from 'lucide-react'
import { useCompare } from '../context/CompareContext'
import { useCart } from '../context/CartContext'
import Breadcrumbs from '../components/Breadcrumbs'
import SEO from '../components/SEO'
import toast from 'react-hot-toast'
import { formatBRL } from '../utils/format'

export default function Compare() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare()
  const { add } = useCart()
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  const resolvePrice = (product) => {
    const candidates = []
    if (product?.base_price != null) candidates.push(product.base_price)
    if (product?.price != null) candidates.push(product.price)
    const defVar = Array.isArray(product?.variants) ? product.variants.find(v => v?.is_default && v?.price != null) : null
    if (defVar?.price != null) candidates.push(defVar.price)
    const anyVar = Array.isArray(product?.variants) ? product.variants.find(v => v?.price != null) : null
    if (anyVar?.price != null) candidates.push(anyVar.price)
    const n = Number(candidates.find(v => !Number.isNaN(Number(v))) ?? 0)
    return Number.isFinite(n) ? n : 0
  }

  const resolveImage = (product) => {
    const raw = product?.images?.[0]?.image
    if (!raw) return '/placeholder.png'
    return raw.startsWith('http') ? raw : `${baseURL}${raw}`
  }

  const handleAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      const firstAvailable = product.variants.find(v => v.stock > 0)
      if (firstAvailable) {
        const price = Number(firstAvailable.price ?? product.base_price ?? 0)
        add({
          id: product.id,
          variantId: firstAvailable.id,
          name: product.name,
          price,
          image: resolveImage(product),
          size: firstAvailable.size,
          color: firstAvailable.color,
          qty: 1
        })
        toast.success('Produto adicionado ao carrinho!')
      } else {
        toast.error('Produto sem estoque disponível')
      }
    }
  }

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
        <SEO title="Comparar Produtos - BASE CORPORATIVA" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Comparar Produtos' }]} />
          
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                Nenhum produto para comparar
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                Adicione produtos à comparação para ver as diferenças lado a lado
              </p>
              <Link
                to="/catalog"
                className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const features = [
    { key: 'price', label: 'Preço' },
    { key: 'category', label: 'Categoria' },
    { key: 'description', label: 'Descrição' },
    { key: 'variants', label: 'Variantes Disponíveis' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
      <SEO title="Comparar Produtos - BASE CORPORATIVA" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Comparar Produtos' }]} />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Comparar Produtos ({compareItems.length})
          </h1>
          <button
            onClick={clearCompare}
            className="px-4 py-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors font-semibold"
          >
            Limpar Todos
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="p-6 text-left font-semibold text-neutral-900 dark:text-neutral-100 sticky left-0 bg-white dark:bg-neutral-800 z-10">
                  Característica
                </th>
                {compareItems.map((product) => (
                  <th key={product.id} className="p-6 min-w-[250px]">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-2 -right-2 p-1 bg-error-500 text-white rounded-full hover:bg-error-600 transition-colors"
                        aria-label="Remover da comparação"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={resolveImage(product)}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.key} className={index % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-900/40' : 'bg-white dark:bg-neutral-800'}>
                  <td className="p-6 font-semibold text-neutral-900 dark:text-neutral-100 sticky left-0 bg-white dark:bg-neutral-800 z-10">
                    {feature.label}
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="p-6">
                      {feature.key === 'price' && (
                        <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                          {formatBRL(resolvePrice(product))}
                        </span>
                      )}
                      {feature.key === 'category' && (
                        <span className="text-neutral-700 dark:text-neutral-300">{product.category?.name || 'N/A'}</span>
                      )}
                      {feature.key === 'description' && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                          {product.description || 'Sem descrição'}
                        </p>
                      )}
                      {feature.key === 'variants' && (
                        <div className="text-sm text-neutral-700 dark:text-neutral-300">
                          {product.variants?.length || 0} variantes
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-6 font-semibold text-neutral-900 dark:text-neutral-100 sticky left-0 bg-white dark:bg-neutral-800 z-10">
                  Ações
                </td>
                {compareItems.map((product) => (
                  <td key={product.id} className="p-6">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Adicionar ao Carrinho
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
