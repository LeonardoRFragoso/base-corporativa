import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Filter, X, SlidersHorizontal, Grid3x3, List, Eye } from 'lucide-react'
import { api } from '../lib/api.js'
import ProductCard from '../components/ProductCard.jsx'
import SEO from '../components/SEO.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { ProductCardSkeleton } from '../components/SkeletonLoader.jsx'
import CatalogHeroBanner from '../components/CatalogHeroBanner.jsx'
import FeaturedProductsBanner from '../components/FeaturedProductsBanner.jsx'
import QuickViewModal from '../components/QuickViewModal.jsx'
import NewsletterCatalog from '../components/NewsletterCatalog.jsx'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

export default function Catalog() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    ordering: searchParams.get('ordering') || '-created_at',
    in_stock: searchParams.get('in_stock') === 'true'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
    updateURLParams()
  }, [filters])

  const updateURLParams = () => {
    const params = {}
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key]
    })
    setSearchParams(params)
  }

  async function loadCategories() {
    try {
      const res = await api.get('/api/categories/')
      setCategories(res.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  async function loadProducts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.min_price) params.append('min_price', filters.min_price)
      if (filters.max_price) params.append('max_price', filters.max_price)
      if (filters.ordering) params.append('ordering', filters.ordering)
      if (filters.in_stock) params.append('in_stock', 'true')
      
      const res = await api.get(`/api/products/?${params}`)
      setProducts(res.data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      ordering: '-created_at',
      in_stock: false
    })
    toast.success('Filtros limpos')
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) return
    setDeletingProduct(product.id)
    try {
      await api.delete(`/api/products/${product.id}/`)
      setProducts(prev => prev.filter(p => p.id !== product.id))
      toast.success('Produto excluído')
    } catch (error) {
      toast.error('Erro ao excluir produto')
    } finally {
      setDeletingProduct(null)
    }
  }

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '-created_at').length

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <SEO 
        title="Catálogo - BASE CORPORATIVA"
        description="Explore nossa coleção completa de roupas corporativas de qualidade premium"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Catálogo' }]} />

        {/* Hero Banner */}
        <CatalogHeroBanner />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Catálogo de Produtos</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {loading ? 'Carregando...' : `${products.length} produtos encontrados`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
                title="Visualização em grade"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
                title="Visualização em lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-400 transition-colors text-neutral-900 dark:text-neutral-100 font-semibold"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate('/admin/products/new')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
                >
                  Novo Produto
                </button>
                <button
                  onClick={() => navigate('/admin/products')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg"
                >
                  Gerenciar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Active Filters Chips */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Filtros ativos:
            </span>
            {filters.category && (
              <button
                onClick={() => handleFilterChange('category', '')}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              >
                {categories.find(c => c.id === filters.category)?.name || 'Categoria'}
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.min_price && (
              <button
                onClick={() => handleFilterChange('min_price', '')}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              >
                Min: R$ {filters.min_price}
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.max_price && (
              <button
                onClick={() => handleFilterChange('max_price', '')}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              >
                Max: R$ {filters.max_price}
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.in_stock && (
              <button
                onClick={() => handleFilterChange('in_stock', false)}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              >
                Em estoque
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-error-600 hover:text-error-700 font-semibold underline"
            >
              Limpar todos
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6 sticky top-24 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-error-600 hover:text-error-700 font-semibold"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 text-neutral-900 dark:text-neutral-100 transition-colors"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Faixa de Preço
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.in_stock}
                      onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 dark:border-neutral-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Apenas em estoque
                    </span>
                  </label>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Ordenar por
                  </label>
                  <select
                    value={filters.ordering}
                    onChange={(e) => handleFilterChange('ordering', e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 text-neutral-900 dark:text-neutral-100 transition-colors"
                  >
                    <option value="-created_at">Mais recentes</option>
                    <option value="created_at">Mais antigos</option>
                    <option value="price">Menor preço</option>
                    <option value="-price">Maior preço</option>
                    <option value="name">Nome (A-Z)</option>
                    <option value="-name">Nome (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Featured Products Banner */}
            {!loading && products.length > 0 && <FeaturedProductsBanner products={products} />}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-neutral-900/50 p-12 text-center border border-neutral-200 dark:border-neutral-700">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Tente ajustar os filtros ou limpar a busca
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {products.map(product => (
                  <div key={product.id} className="relative group">
                    <ProductCard product={product} />
                    
                    {/* Quick View Button */}
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 px-4 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold rounded-lg shadow-xl flex items-center gap-2 hover:scale-105"
                    >
                      <Eye className="w-5 h-5" />
                      Visualização Rápida
                    </button>

                    {isAdmin && (
                      <div className="absolute top-2 left-2 flex gap-2 z-10">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          disabled={deletingProduct === product.id}
                          className="p-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletingProduct === product.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Newsletter CTA */}
        {!loading && products.length > 0 && <NewsletterCatalog />}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
