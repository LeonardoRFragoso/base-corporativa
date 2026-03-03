import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciamento completo da wishlist
 */
export function useWishlist() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/wishlist/');
      setItems(response.data);
      setCount(response.data.length);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const response = await api.get('/api/wishlist/count/');
      setCount(response.data.count);
    } catch (err) {
      console.error('Erro ao carregar contador da wishlist:', err);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    try {
      const response = await api.post(`/api/wishlist/toggle/${productId}/`);
      toast.success(response.data.message);
      await fetchWishlist();
      await fetchCount();
      return { success: true, inWishlist: response.data.in_wishlist };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar wishlist';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const checkInWishlist = async (productId) => {
    try {
      const response = await api.get(`/api/wishlist/check/${productId}/`);
      return response.data.in_wishlist;
    } catch (err) {
      console.error('Erro ao verificar wishlist:', err);
      return false;
    }
  };

  const clearWishlist = async () => {
    try {
      const response = await api.post('/api/wishlist/clear/');
      toast.success(response.data.message);
      await fetchWishlist();
      await fetchCount();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao limpar wishlist';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return {
    items,
    count,
    loading,
    error,
    toggleWishlist,
    checkInWishlist,
    clearWishlist,
    refetch: fetchWishlist,
    refetchCount: fetchCount
  };
}

/**
 * Hook simples para verificar se produto está na wishlist
 */
export function useIsInWishlist(productId) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    async function checkWishlist() {
      try {
        setLoading(true);
        const response = await api.get(`/api/wishlist/check/${productId}/`);
        setInWishlist(response.data.in_wishlist);
      } catch (err) {
        console.error('Erro ao verificar wishlist:', err);
      } finally {
        setLoading(false);
      }
    }

    checkWishlist();
  }, [productId]);

  return { inWishlist, loading };
}
