import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Hook para estatísticas de reviews de um produto
 */
export function useReviewStats(productId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    async function fetchStats() {
      try {
        setLoading(true);
        const response = await api.get(`/api/reviews/product/${productId}/stats/`);
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar estatísticas de reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [productId]);

  return { stats, loading, error };
}

/**
 * Hook para marcar review como útil
 */
export function useReviewHelpful() {
  const [loading, setLoading] = useState(false);

  const markHelpful = async (reviewId, isHelpful = true) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/reviews/${reviewId}/helpful/`, {
        helpful: isHelpful
      });
      toast.success(isHelpful ? 'Marcado como útil!' : 'Marcado como não útil');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao votar';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { markHelpful, loading };
}

/**
 * Hook para reportar review
 */
export function useReportReview() {
  const [loading, setLoading] = useState(false);

  const reportReview = async (reviewId, reason) => {
    try {
      setLoading(true);
      await api.post(`/api/reviews/${reviewId}/report/`, { reason });
      toast.success('Review reportado com sucesso');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao reportar review';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { reportReview, loading };
}

/**
 * Hook para reviews do usuário
 */
export function useUserReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/reviews/user/reviews/');
      setReviews(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar reviews do usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return { reviews, loading, error, refetch: fetchReviews };
}

/**
 * Hook para verificar se pode avaliar produto
 */
export function useCanReview(productId) {
  const [canReview, setCanReview] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    async function checkCanReview() {
      try {
        setLoading(true);
        const response = await api.get(`/api/reviews/product/${productId}/can-review/`);
        setCanReview(response.data.can_review);
        setReason(response.data.reason || '');
      } catch (err) {
        console.error('Erro ao verificar permissão de review:', err);
        setCanReview(false);
      } finally {
        setLoading(false);
      }
    }

    checkCanReview();
  }, [productId]);

  return { canReview, reason, loading };
}
