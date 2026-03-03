import { useState, useEffect } from 'react';
import { api } from '../lib/api';

/**
 * Hook para produtos em destaque
 */
export function useFeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        const response = await api.get('/api/products/featured/');
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar produtos em destaque:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return { products, loading, error };
}

/**
 * Hook para produtos mais vendidos
 */
export function useBestsellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBestsellers() {
      try {
        setLoading(true);
        const response = await api.get('/api/products/bestsellers/');
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar bestsellers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBestsellers();
  }, []);

  return { products, loading, error };
}

/**
 * Hook para novidades
 */
export function useNewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        setLoading(true);
        const response = await api.get('/api/products/new-arrivals/');
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar novidades:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNewArrivals();
  }, []);

  return { products, loading, error };
}

/**
 * Hook para produtos relacionados
 */
export function useRelatedProducts(productId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    async function fetchRelated() {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${productId}/related/`);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar produtos relacionados:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [productId]);

  return { products, loading, error };
}

/**
 * Hook para recomendações personalizadas
 */
export function useRecommendations() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const response = await api.get('/api/products/recommendations/');
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar recomendações:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  return { products, loading, error };
}

/**
 * Hook para tracking de visualização de produto
 */
export function useProductView(productId) {
  useEffect(() => {
    if (!productId) return;

    async function trackView() {
      try {
        await api.post(`/api/products/${productId}/view/`);
      } catch (err) {
        console.error('Erro ao registrar visualização:', err);
      }
    }

    trackView();
  }, [productId]);
}

/**
 * Hook para verificar estoque
 */
export function useStockCheck(productId) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStock = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/products/${productId}/stock/`);
      setStock(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao verificar estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStock();
  }, [productId]);

  return { stock, loading, error, refetch: checkStock };
}
