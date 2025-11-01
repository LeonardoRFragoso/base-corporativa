import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await api.get(`/api/products/?search=${encodeURIComponent(query)}`)
        setResults(response.data.slice(0, 5))
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
    onClose?.()
  }

  const handleViewAll = () => {
    navigate(`/catalog?search=${encodeURIComponent(query)}`)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-neutral-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar produtos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 outline-none text-lg"
              aria-label="Buscar produtos"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Fechar busca"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-500">
              Buscando...
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-500">
              Nenhum produto encontrado
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="divide-y divide-neutral-100">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 transition-colors text-left"
                  >
                    <img
                      src={product.images?.[0]?.image ? `${baseURL}${product.images[0].image}` : '/placeholder.png'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {product.category?.name}
                      </p>
                      <p className="text-primary-700 font-bold mt-1">
                        R$ {Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={handleViewAll}
                  className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Ver todos os resultados
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
