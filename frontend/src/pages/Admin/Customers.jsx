import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatBRL } from '../../utils/format';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Users, 
  Mail, 
  Calendar,
  ShoppingBag,
  DollarSign
} from 'lucide-react';

const Customers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, page, pageSize]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/', { 
        params: { 
          page, 
          page_size: pageSize,
          is_staff: false // Only get customers, not staff
        } 
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.results || []);
      setCustomers(list);
      setTotalCount(Number(data.count ?? list.length));
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Acesso negado.');
        navigate('/');
      }
      setLoading(false);
    }
  };

  const statusList = ['all', 'active', 'inactive'];
  const statusLabels = {
    all: 'Todos',
    active: 'Ativos',
    inactive: 'Inativos'
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  const Pagination = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-neutral-700">
      <div className="text-sm text-gray-600 dark:text-neutral-400">Total: {totalCount} clientes</div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >Anterior</button>
        <span className="text-sm text-gray-700 dark:text-neutral-300">Página {page} de {totalPages}</span>
        <button
          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >Próxima</button>
        <select
          className="ml-2 border rounded px-2 py-1 text-sm"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
        >
          {[10,20,50].map(s => <option key={s} value={s}>{s}/página</option>)}
        </select>
      </div>
    </div>
  );

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && customer.is_active) ||
      (statusFilter === 'inactive' && !customer.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const StatusChips = () => (
    <div className="flex flex-wrap gap-2">
      {statusList.map((s) => (
        <button
          key={s}
          onClick={() => setStatusFilter(s)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            statusFilter === s
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {statusLabels[s]}
        </button>
      ))}
    </div>
  );

  const CustomerModal = ({ customer, onClose }) => {
    if (!customer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-700">
          <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Cliente #{customer.id}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-3">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-neutral-500">Nome</p>
                  <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-neutral-500">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-neutral-500">Status</p>
                  {getStatusBadge(customer.is_active)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-neutral-500">Cadastro</p>
                  <p className="font-medium">{new Date(customer.date_joined).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>

            {/* Estatísticas do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{customer.total_orders || 0}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Pedidos</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{formatBRL(customer.total_spent || 0)}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Total Gasto</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{customer.days_since_last_order || 'N/A'}</p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Dias desde último pedido</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-2">
            <button
              onClick={() => navigate(`/admin/orders?customer=${customer.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ver Pedidos
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-neutral-400">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">Gerenciar Clientes</h1>
              <p className="text-gray-600 dark:text-neutral-400 mt-2">Total de {filteredCustomers.length} clientes</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-md dark:shadow-neutral-900/50 p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
          <div className="mb-4">
            <StatusChips />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {/* TODO: Export functionality */}}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-md dark:shadow-neutral-900/50 overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Pedidos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Total Gasto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Cadastro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:bg-neutral-900 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-100">#{customer.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-amber-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-neutral-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(customer.is_active)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100">{customer.total_orders || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-neutral-100">{formatBRL(customer.total_spent || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-500">{new Date(customer.date_joined).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => setSelectedCustomer(customer)} 
                        className="text-amber-600 hover:text-amber-900 font-medium flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-neutral-500 text-lg">Nenhum cliente encontrado</p>
            </div>
          )}
          <Pagination />
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
};

export default Customers;
