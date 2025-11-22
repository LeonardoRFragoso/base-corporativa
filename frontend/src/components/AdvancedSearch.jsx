import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { trackSearch } from '../utils/analytics';

/**
 * Componente de busca avançada com autocomplete
 */
export default function AdvancedSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(recent.slice(0, 5));
    } catch (e) {
      setRecentSearches([]);
    }
  }, []);

  // Carregar termos trending
  useEffect(() => {
    async function loadTrending() {
      try {
        const res = await api.get('/api/catalog/trending-searches/');
        setTrending(res.data.trending || []);
      } catch (e) {
        console.error('Erro ao carregar trending:', e);
      }
    }
    loadTrending();
  }, []);

  // Focus automático
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Autocomplete
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/catalog/autocomplete/', {
          params: { q: query, limit: 8 }
        });
        setSuggestions(res.data.suggestions || []);
        setShowSuggestions(true);
      } catch (e) {
        console.error('Erro no autocomplete:', e);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (searchTerm) => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updated = [searchTerm, ...recent.filter(s => s !== searchTerm)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecentSearches(updated.slice(0, 5));
    } catch (e) {
      console.error('Erro ao salvar busca recente:', e);
    }
  };

  const handleSearch = (searchTerm = query) => {
    if (!searchTerm.trim()) return;

    saveRecentSearch(searchTerm);
    trackSearch(searchTerm);
    
    // Navegar para catálogo com query
    navigate(`/catalog?q=${encodeURIComponent(searchTerm)}`);
    
    if (onClose) onClose();
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/product/${suggestion.id}`);
    saveRecentSearch(suggestion.name);
    if (onClose) onClose();
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="absolute top-0 left-0 right-0 bg-white dark:bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto p-6">
          {/* Search Input */}
          <div className="relative">
            <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-6 py-4">
              <Search className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar produtos... (Ex: camisa polo preta)"
                className="flex-1 bg-transparent outline-none text-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              )}
              <button
                onClick={() => handleSearch()}
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-bronze-600 text-white rounded-lg font-semibold hover:from-primary-500 hover:to-bronze-500 transition"
              >
                Buscar
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 max-h-96 overflow-y-auto z-10">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition text-left"
                  >
                    {suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                        <Search className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {suggestion.category}
                      </div>
                    </div>
                    <div className="text-primary-600 dark:text-primary-400 font-bold">
                      R$ {suggestion.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Buscas Recentes
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    Limpar
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {trending.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Buscas Populares
                </h3>
                <div className="space-y-2">
                  {trending.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition flex items-center gap-2"
                    >
                      <span className="text-orange-500 font-bold">#{index + 1}</span>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Popular Categories */}
          <div className="mt-8">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Categorias Populares
            </h3>
            <div className="flex flex-wrap gap-3">
              {['Camisas Polo', 'Calças Sociais', 'Blazers', 'Camisas Sociais', 'Ternos'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleSearch(cat)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-neutral-700 dark:text-neutral-300 rounded-lg transition font-medium"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
