import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import ProductCard from './ProductCard';

export default function ProductRecommendationsEnhanced({ 
  productId, 
  categoryId,
  type = 'related', 
  title = 'Você também pode gostar',
  limit = 4 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [productId, categoryId, type]);

  const loadRecommendations = async () => {
    try {
      let endpoint = '';
      let params = { limit };
      
      switch(type) {
        case 'related':
          if (categoryId) {
            endpoint = '/api/products/';
            params.category = categoryId;
            params.ordering = '-created_at';
          } else {
            endpoint = '/api/products/';
            params.ordering = '-created_at';
          }
          break;
        case 'frequently_bought':
          endpoint = '/api/products/';
          params.ordering = '-created_at';
          break;
        case 'similar':
          if (categoryId) {
            endpoint = '/api/products/';
            params.category = categoryId;
          } else {
            endpoint = '/api/products/';
          }
          break;
        case 'bestsellers':
          endpoint = '/api/products/';
          params.ordering = '-created_at';
          break;
        default:
          endpoint = '/api/products/';
          params.ordering = '-created_at';
      }
      
      const res = await api.get(endpoint, { params });
      const allProducts = res.data || [];
      
      const filtered = productId 
        ? allProducts.filter(p => p.id !== parseInt(productId))
        : allProducts;
      
      setProducts(filtered.slice(0, limit));
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="py-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
