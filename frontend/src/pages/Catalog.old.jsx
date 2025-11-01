import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import ProductCard from '../components/ProductCard.jsx'
import SEO from '../components/SEO.jsx'
import { BreadcrumbSchema } from '../components/StructuredData.jsx'
import ProductModal from '../components/ProductModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Catalog() {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    ordering: '-created_at'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [filters])

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
      if (filters.ordering) params.append('ordering', filters.ordering)
      
      const res = await api.get(`/api/products/?${params}`)
      setProducts(res.data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleCreateProduct() {
    setEditingProduct(null)
    setShowModal(true)
  }

  function handleEditProduct(product) {
    setEditingProduct(product)
    setShowModal(true)
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      return
    }
    
    setDeletingProduct(product.id)
    try {
      await api.delete(`/api/products/${product.id}/`)
      setProducts(products.filter(p => p.id !== product.id))
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto. Tente novamente.')
    } finally {
      setDeletingProduct(null)
    }
  }

  function handleSaveProduct(savedProduct) {
    if (editingProduct) {
      // Update existing
      setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p))
    } else {
      // Add new
      setProducts([savedProduct, ...products])
    }
    loadProducts() // Reload to get full data with relations
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters({
      search: '',
      category: '',
      ordering: '-created_at'
    })
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-bronze-600 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-neutral-600">Carregando produtos...</p>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { name: 'Início', url: '/' },
    { name: 'Catálogo', url: '/catalog' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <SEO 
        title="Catálogo - Roupas Corporativas | BASE CORPORATIVA"
        description="Explore nosso catálogo completo de roupas corporativas. Camisas polo, calças sociais, uniformes profissionais de alta qualidade. Frete grátis acima de R$ 200."
        keywords="catálogo roupas corporativas, camisas polo masculinas, calças sociais, uniformes profissionais, roupas de trabalho, moda corporativa"
        url="/catalog"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="inline-block mb-4">
                <span className="text-sm font-semibold text-bronze-700 uppercase tracking-wider bg-bronze-50 px-3 py-1 rounded-full">
                  Coleção Profissional
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-primary-950 mb-4 bg-gradient-to-r from-primary-950 to-primary-700 bg-clip-text text-transparent">
                Catálogo de Produtos
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl">
                Descubra nossa coleção completa de roupas corporativas de alta qualidade
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={handleCreateProduct}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-bronze-800 to-bronze-600 text-white rounded-xl hover:from-bronze-700 hover:to-bronze-500 transition-all shadow-medium hover:shadow-strong font-semibold transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Produto
              </button>
            )}
          </div>
          <div className="mt-6 flex lg:hidden">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center px-5 py-2.5 border-2 border-primary-200 rounded-xl text-primary-950 hover:bg-primary-50 transition-all font-medium shadow-soft"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white rounded-2xl shadow-medium border border-neutral-100 p-6 mb-10 backdrop-blur-sm`}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-neutral-900 font-medium"
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={filters.ordering}
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-neutral-900 font-medium"
              >
                <option value="-created_at">Mais recentes</option>
                <option value="created_at">Mais antigos</option>
                <option value="base_price">Menor preço</option>
                <option value="-base_price">Maior preço</option>
                <option value="name">Nome A-Z</option>
                <option value="-name">Nome Z-A</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(filters.search || filters.category || filters.ordering !== '-created_at') && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 text-neutral-600 hover:text-primary-950 transition-all font-medium hover:bg-neutral-50 rounded-xl"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-bronze-600 to-bronze-400 rounded-full"></div>
            <p className="text-neutral-700 font-medium text-lg">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-950"></div>
                  Carregando...
                </span>
              ) : (
                <span>
                  <span className="text-2xl font-bold text-primary-950">{products.length}</span>
                  <span className="text-neutral-600 ml-2">produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg className="h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Nenhum produto encontrado</h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">Tente ajustar os filtros ou buscar por outros termos para encontrar o que procura.</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-950 to-primary-800 text-white rounded-xl hover:from-primary-900 hover:to-primary-700 transition-all shadow-medium hover:shadow-strong font-semibold transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Ver todos os produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                {isAdmin && (
                  <div className="absolute top-2 left-2 flex gap-2 z-10">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-medium"
                      title="Editar produto"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      disabled={deletingProduct === product.id}
                      className="p-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors shadow-medium disabled:opacity-50"
                      title="Excluir produto"
                    >
                      {deletingProduct === product.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading overlay */}
        {loading && products.length > 0 && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-strong border border-neutral-100">
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 mx-auto"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-bronze-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              </div>
              <p className="text-neutral-700 font-medium text-center">Carregando...</p>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onClose={() => {
              setShowModal(false)
              setEditingProduct(null)
            }}
            onSave={handleSaveProduct}
          />
        )}
      </div>
    </div>
  )
}
