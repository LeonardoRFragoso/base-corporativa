import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { trackSearch } from '../utils/analytics';
import { Link, useNavigate } from 'react-router-dom';

export default function SearchBarEnhanced() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/products/?search=${query}&limit=5`);
      setSuggestions(res.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      trackSearch(query);
      navigate(`/catalog?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setQuery('');
    }
  };

  const handleSelectSuggestion = (product) => {
    trackSearch(query);
    setShowSuggestions(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder="Buscar produtos..."
          className="w-full px-4 py-3 pl-12 pr-10 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-600 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 transition-all text-neutral-900 dark:text-neutral-100"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {showSuggestions && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
              Buscando...
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  Produtos encontrados
                </p>
              </div>
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={() => handleSelectSuggestion(product)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {product.images?.[0]?.image ? (
                    <img
                      src={product.images[0].image.startsWith('http') ? product.images[0].image : `${baseURL}${product.images[0].image}`}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                      <Search className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
                      R$ {Number(product.base_price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
              Nenhum produto encontrado para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
