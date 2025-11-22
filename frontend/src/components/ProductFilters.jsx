import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { api } from '../lib/api';

/**
 * Componente de filtros avançados para catálogo
 */
export default function ProductFilters({ filters, onFilterChange, onClear }) {
  const [filterOptions, setFilterOptions] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Carregar opções de filtros do backend
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const res = await api.get('/api/catalog/filter-options/');
        setFilterOptions(res.data);
      } catch (e) {
        console.error('Erro ao carregar filtros:', e);
      }
    }
    loadFilterOptions();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterUpdate = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const cleared = {
      category: '',
      min_price: '',
      max_price: '',
      size: [],
      color: [],
      in_stock: false,
      sort_by: 'newest'
    };
    setLocalFilters(cleared);
    onClear();
    setIsOpen(false);
  };

  const activeFilterCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'sort_by') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== false;
  }).length;

  if (!filterOptions) return null;

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-bronze-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span className="font-semibold">Filtros</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-white text-primary-700 rounded-full text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filters Sidebar/Modal */}
      <div className={`
        fixed lg:static inset-0 z-50 lg:z-auto
        ${isOpen ? 'block' : 'hidden lg:block'}
      `}>
        {/* Mobile Overlay */}
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Filters Panel */}
        <div className={`
          fixed lg:static right-0 top-0 bottom-0 w-80 lg:w-full
          bg-white dark:bg-neutral-800 lg:rounded-xl shadow-2xl lg:shadow-lg
          overflow-y-auto
          transform transition-transform duration-300 lg:transform-none
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between z-10">
            <div>
              <h3 className="font-bold text-xl text-neutral-900 dark:text-neutral-100">
                Filtros
              </h3>
              {activeFilterCount > 0 && (
                <p className="text-sm text-neutral-500 mt-1">
                  {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} ativo{activeFilterCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Categoria */}
            {filterOptions.categories.length > 0 && (
              <div>
                <label className="block font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Categoria
                </label>
                <select
                  value={localFilters.category || ''}
                  onChange={(e) => handleFilterUpdate('category', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas as categorias</option>
                  {filterOptions.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Faixa de Preço */}
            <div>
              <label className="block font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Faixa de Preço
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={localFilters.min_price || ''}
                    onChange={(e) => handleFilterUpdate('min_price', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={localFilters.max_price || ''}
                    onChange={(e) => handleFilterUpdate('max_price', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-neutral-500">
                R$ {filterOptions.price_range.min.toFixed(2)} - R$ {filterOptions.price_range.max.toFixed(2)}
              </div>
            </div>

            {/* Tamanhos */}
            {filterOptions.sizes.length > 0 && (
              <div>
                <label className="block font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Tamanho
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.sizes.map((size) => {
                    const isSelected = (localFilters.size || []).includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          const current = localFilters.size || [];
                          const updated = isSelected
                            ? current.filter(s => s !== size)
                            : [...current, size];
                          handleFilterUpdate('size', updated);
                        }}
                        className={`
                          px-4 py-2 rounded-lg border-2 font-medium transition-all
                          ${isSelected
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-primary-400'
                          }
                        `}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cores */}
            {filterOptions.colors.length > 0 && (
              <div>
                <label className="block font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.colors.map((color) => {
                    const isSelected = (localFilters.color || []).includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          const current = localFilters.color || [];
                          const updated = isSelected
                            ? current.filter(c => c !== color)
                            : [...current, color];
                          handleFilterUpdate('color', updated);
                        }}
                        className={`
                          px-4 py-2 rounded-lg border-2 font-medium transition-all capitalize
                          ${isSelected
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-primary-400'
                          }
                        `}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disponibilidade */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.in_stock || false}
                  onChange={(e) => handleFilterUpdate('in_stock', e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  Apenas produtos em estoque
                </span>
              </label>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Ordenar por
              </label>
              <select
                value={localFilters.sort_by || 'newest'}
                onChange={(e) => handleFilterUpdate('sort_by', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
              >
                {filterOptions.sort_options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6 space-y-3">
            <button
              onClick={applyFilters}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-bronze-600 text-white font-semibold rounded-lg hover:from-primary-500 hover:to-bronze-500 transition"
            >
              Aplicar Filtros
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
