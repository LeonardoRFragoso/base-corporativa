import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatBRL } from '../../utils/format';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/Breadcrumbs';

const Coupons = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    percent_off: '',
    amount_off: '',
    active: true,
    valid_from: '',
    valid_until: '',
    usage_limit: ''
  });

  useEffect(() => {
    if (user) {
      fetchCoupons();
    }
  }, [user]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/discounts/');
      setCoupons(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Acesso negado.');
        navigate('/');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    if (!formData.code) {
      toast.error('Código do cupom é obrigatório');
      return;
    }
    
    if (!formData.percent_off && !formData.amount_off) {
      toast.error('Informe o desconto (percentual ou valor fixo)');
      return;
    }
    
    if (formData.percent_off && formData.amount_off) {
      toast.error('Informe apenas um tipo de desconto');
      return;
    }

    try {
      const payload = {
        ...formData,
        percent_off: formData.percent_off ? parseFloat(formData.percent_off) : null,
        amount_off: formData.amount_off ? parseFloat(formData.amount_off) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null
      };

      if (editingCoupon) {
        await api.put(`/api/discounts/${editingCoupon.id}/`, payload);
        toast.success('Cupom atualizado com sucesso!');
      } else {
        await api.post('/api/discounts/', payload);
        toast.success('Cupom criado com sucesso!');
      }
      
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar cupom');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      percent_off: coupon.percent_off || '',
      amount_off: coupon.amount_off || '',
      active: coupon.active,
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      usage_limit: coupon.usage_limit || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Excluir cupom "${coupon.code}"?`)) return;
    
    try {
      await api.delete(`/api/discounts/${coupon.id}/`);
      toast.success('Cupom excluído com sucesso!');
      fetchCoupons();
    } catch (error) {
      console.error('Erro ao excluir cupom:', error);
      toast.error('Erro ao excluir cupom');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      percent_off: '',
      amount_off: '',
      active: true,
      valid_from: '',
      valid_until: '',
      usage_limit: ''
    });
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
    
    if (!coupon.active) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          Inativo
        </span>
      );
    }
    
    if (validUntil && now > validUntil) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Expirado
        </span>
      );
    }
    
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Limite atingido
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativo
      </span>
    );
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
    const isExpired = validUntil && now > validUntil;
    const isLimitReached = coupon.usage_limit && coupon.times_used >= coupon.usage_limit;
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && coupon.active && !isExpired && !isLimitReached) ||
      (statusFilter === 'inactive' && !coupon.active) ||
      (statusFilter === 'expired' && isExpired);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => {
      const now = new Date();
      const validUntil = c.valid_until ? new Date(c.valid_until) : null;
      const isExpired = validUntil && now > validUntil;
      const isLimitReached = c.usage_limit && c.times_used >= c.usage_limit;
      return c.active && !isExpired && !isLimitReached;
    }).length,
    totalUsage: coupons.reduce((sum, c) => sum + c.times_used, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-neutral-400">Carregando cupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Cupons de Desconto' }
        ]} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">Cupons de Desconto</h1>
              <p className="text-gray-600 dark:text-neutral-400 mt-2">Gerencie cupons e promoções</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setEditingCoupon(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Cupom
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-md dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-neutral-500 text-sm">Total de Cupons</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-neutral-100 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Tag className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-md dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-neutral-500 text-sm">Cupons Ativos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-md dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-neutral-500 text-sm">Total de Usos</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalUsage}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-md dark:shadow-neutral-900/50 p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-4 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="expired">Expirados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-md dark:shadow-neutral-900/50 overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Desconto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Uso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Validade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="w-5 h-5 text-amber-600 mr-2" />
                        <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        {coupon.percent_off ? `${coupon.percent_off}%` : formatBRL(coupon.amount_off)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100">
                      {coupon.times_used} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : '/ ∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-500">
                      {coupon.valid_until 
                        ? new Date(coupon.valid_until).toLocaleDateString('pt-BR')
                        : 'Sem limite'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-amber-600 hover:text-amber-900 font-medium flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="text-red-600 hover:text-red-900 font-medium flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-neutral-500 text-lg">Nenhum cupom encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100"
                  placeholder="Ex: VERAO2024"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Desconto Percentual (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.percent_off}
                    onChange={(e) => setFormData({ ...formData, percent_off: e.target.value, amount_off: '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Desconto Fixo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount_off}
                    onChange={(e) => setFormData({ ...formData, amount_off: e.target.value, percent_off: '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100"
                    placeholder="50.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Válido A Partir De
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Válido Até
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  Limite de Uso (deixe vazio para ilimitado)
                </label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100"
                  placeholder="100"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700 dark:text-neutral-300">
                  Cupom ativo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-gray-900 dark:text-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  {editingCoupon ? 'Atualizar' : 'Criar'} Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
