import { useState, useEffect, useMemo } from 'react';

/**
 * Hook customizado para gerenciar filtros de produtos
 * Melhora a performance e reutilização de lógica
 */
export function useProductFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    ordering: '-created_at',
    in_stock: false,
    ...initialFilters
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search para evitar muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      ordering: '-created_at',
      in_stock: false
    });
  };

  const buildQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (filters.category) params.append('category', filters.category);
    if (filters.min_price) params.append('base_price__gte', filters.min_price);
    if (filters.max_price) params.append('base_price__lte', filters.max_price);
    if (filters.ordering) params.append('ordering', filters.ordering);
    if (filters.in_stock) params.append('variants__stock__gt', '0');
    
    return params.toString();
  }, [debouncedSearch, filters]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.category ||
      filters.min_price ||
      filters.max_price ||
      filters.in_stock
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    buildQueryParams,
    hasActiveFilters,
    debouncedSearch
  };
}
