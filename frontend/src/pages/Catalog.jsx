import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import ProductCard from '../components/ProductCard.jsx'
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
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-primary-950 mb-4">
                Catálogo de Produtos
              </h1>
              <p className="text-lg text-neutral-600">
                Descubra nossa coleção completa de roupas corporativas
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={handleCreateProduct}
                className="inline-flex items-center px-4 py-3 bg-bronze-800 text-white rounded-lg hover:bg-bronze-700 transition-all shadow-soft hover:shadow-medium font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Produto
              </button>
            )}
          </div>
          <div className="mt-4 flex lg:hidden">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white rounded-lg shadow-soft p-6 mb-8`}>
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
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-950 focus:border-transparent transition-all"
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
                className="px-4 py-3 text-neutral-600 hover:text-primary-950 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600">
            {loading ? 'Carregando...' : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 && !loading ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-neutral-600 mb-4">Tente ajustar os filtros ou buscar por outros termos.</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 bg-primary-950 text-white rounded-lg hover:bg-primary-800 transition-colors"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-strong">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-950 mx-auto"></div>
              <p className="text-neutral-600 mt-2">Carregando...</p>
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
