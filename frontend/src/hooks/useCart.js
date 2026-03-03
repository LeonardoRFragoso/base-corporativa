import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Hook aprimorado para gerenciamento do carrinho
 */
export function useCartEnhanced() {
  const [loading, setLoading] = useState(false);

  const mergeCart = useCallback(async (sessionKey) => {
    try {
      setLoading(true);
      const response = await api.post('/api/cart/merge/', {
        session_key: sessionKey
      });
      toast.success(response.data.message);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao mesclar carrinho';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getCartCount = useCallback(async () => {
    try {
      const response = await api.get('/api/cart/count/');
      return response.data.count;
    } catch (err) {
      console.error('Erro ao buscar contador do carrinho:', err);
      return 0;
    }
  }, []);

  const validateCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/cart/validate/');
      
      if (!response.data.valid) {
        if (response.data.out_of_stock.length > 0) {
          toast.error('Alguns itens estão sem estoque');
        }
        if (response.data.insufficient_stock.length > 0) {
          toast.error('Alguns itens têm estoque insuficiente');
        }
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao validar carrinho';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCartValidated = useCallback(async (variantId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await api.post('/api/cart/add-validated/', {
        variant_id: variantId,
        quantity
      });
      toast.success('Produto adicionado ao carrinho!');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao adicionar ao carrinho';
      
      // Mensagens específicas para erros de estoque
      if (err.response?.data?.available !== undefined) {
        toast.error(`Apenas ${err.response.data.available} unidade(s) disponível(is)`);
      } else {
        toast.error(errorMsg);
      }
      
      return { success: false, error: errorMsg, data: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    mergeCart,
    getCartCount,
    validateCart,
    addToCartValidated
  };
}
