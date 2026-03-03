import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Hook para cancelar pedido
 */
export function useCancelOrder() {
  const [loading, setLoading] = useState(false);

  const cancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/orders/${orderId}/cancel/`);
      toast.success(response.data.message);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao cancelar pedido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { cancelOrder, loading };
}

/**
 * Hook para rastreamento de pedido
 */
export function useOrderTracking(orderId) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTracking = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/orders/${orderId}/track/`);
      setTracking(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar rastreamento:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  return { tracking, loading, error, refetch: fetchTracking };
}

/**
 * Hook para resumo de pedidos do usuário
 */
export function useOrderSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders/summary/');
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar resumo de pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

/**
 * Hook para atualização em massa de status (admin)
 */
export function useBulkUpdateOrderStatus() {
  const [loading, setLoading] = useState(false);

  const bulkUpdateStatus = async (orderIds, status) => {
    try {
      setLoading(true);
      const response = await api.post('/api/orders/bulk-update-status/', {
        order_ids: orderIds,
        status
      });
      toast.success(response.data.message);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar pedidos';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { bulkUpdateStatus, loading };
}
