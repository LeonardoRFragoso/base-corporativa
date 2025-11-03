import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Star, CheckCircle, XCircle, MessageSquare, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/Breadcrumbs';

const Reviews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') {
        params.approved = statusFilter === 'approved';
      }
      if (ratingFilter !== 'all') {
        params.rating = ratingFilter;
      }
      
      const response = await api.get('/api/reviews/', { params });
      setReviews(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar reviews:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Acesso negado.');
        navigate('/');
      }
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await api.patch(`/api/reviews/${reviewId}/moderate/`, { approved: true });
      toast.success('Review aprovado!');
      fetchReviews();
    } catch (error) {
      toast.error('Erro ao aprovar review');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await api.patch(`/api/reviews/${reviewId}/moderate/`, { approved: false });
      toast.success('Review rejeitado!');
      fetchReviews();
    } catch (error) {
      toast.error('Erro ao rejeitar review');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) {
      toast.error('Selecione pelo menos um review');
      return;
    }
    try {
      await api.post('/api/reviews/bulk-approve/', { review_ids: selectedReviews });
      toast.success(`${selectedReviews.length} review(s) aprovado(s)!`);
      setSelectedReviews([]);
      fetchReviews();
    } catch (error) {
      toast.error('Erro ao aprovar reviews');
    }
  };

  const handleBulkReject = async () => {
    if (selectedReviews.length === 0) {
      toast.error('Selecione pelo menos um review');
      return;
    }
    try {
      await api.post('/api/reviews/bulk-reject/', { review_ids: selectedReviews });
      toast.success(`${selectedReviews.length} review(s) rejeitado(s)!`);
      setSelectedReviews([]);
      fetchReviews();
    } catch (error) {
      toast.error('Erro ao rejeitar reviews');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Excluir este review permanentemente?')) return;
    try {
      await api.delete(`/api/reviews/${reviewId}/`);
      toast.success('Review excluído!');
      fetchReviews();
    } catch (error) {
      toast.error('Erro ao excluir review');
    }
  };

  const handleAddResponse = (review) => {
    setCurrentReview(review);
    setAdminResponse(review.admin_response || '');
    setShowResponseModal(true);
  };

  const handleSaveResponse = async () => {
    try {
      await api.patch(`/api/reviews/${currentReview.id}/moderate/`, { 
        admin_response: adminResponse,
        approved: true 
      });
      toast.success('Resposta salva!');
      setShowResponseModal(false);
      fetchReviews();
    } catch (error) {
      toast.error('Erro ao salvar resposta');
    }
  };

  const toggleSelectReview = (reviewId) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.approved).length,
    approved: reviews.filter(r => r.approved).length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-neutral-400">Carregando reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Moderação de Reviews' }
        ]} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">Moderação de Reviews</h1>
              <p className="text-gray-600 dark:text-neutral-400 mt-2">Gerencie avaliações de produtos</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-neutral-800/90 rounded-lg shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
            <p className="text-gray-500 dark:text-neutral-500 text-sm">Total de Reviews</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-neutral-100 mt-2">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-6">
            <p className="text-yellow-700 text-sm">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-6">
            <p className="text-green-700 text-sm">Aprovados</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-6">
            <p className="text-blue-700 text-sm">Média de Avaliação</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgRating} ⭐</p>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-blue-800 font-medium">{selectedReviews.length} review(s) selecionado(s)</span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                ✓ Aprovar Selecionados
              </button>
              <button
                onClick={handleBulkReject}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                ✕ Rejeitar Selecionados
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800/90 rounded-lg shadow-md p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por produto, usuário ou comentário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-4 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="py-2 px-4 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
            >
              <option value="all">Todas as Avaliações</option>
              <option value="5">5 Estrelas</option>
              <option value="4">4 Estrelas</option>
              <option value="3">3 Estrelas</option>
              <option value="2">2 Estrelas</option>
              <option value="1">1 Estrela</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-neutral-800/90 rounded-lg shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review.id)}
                  onChange={() => toggleSelectReview(review.id)}
                  className="mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-neutral-100">{review.product_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500 dark:text-neutral-500">
                          por {review.user_email || 'Anônimo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.approved ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>

                  {review.title && (
                    <p className="font-medium text-gray-800 dark:text-neutral-200 mb-2">{review.title}</p>
                  )}
                  
                  <p className="text-gray-600 dark:text-neutral-400 mb-3">{review.comment}</p>

                  {review.admin_response && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Resposta do Admin:</p>
                      <p className="text-sm text-blue-800 dark:text-blue-400">{review.admin_response}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-500">
                    <span>{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      ✓ Aprovar
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Rejeitar
                    </button>
                  )}
                  <button
                    onClick={() => handleAddResponse(review)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Responder
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-neutral-800/90 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-neutral-500 text-lg">Nenhum review encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && currentReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Responder Review</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">Review de {currentReview.user_email}:</p>
                <p className="text-gray-800 dark:text-neutral-200">{currentReview.comment}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  Sua Resposta
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100"
                  placeholder="Digite sua resposta..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3">
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-6 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-gray-900 dark:text-neutral-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveResponse}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                Salvar e Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
