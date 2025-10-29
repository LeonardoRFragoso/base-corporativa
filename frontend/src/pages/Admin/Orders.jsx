import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../lib/api';
import { formatBRL } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import OrderModal from '../../components/OrderModal';
import { Search, Filter, Download, Eye, Package, Calendar, DollarSign } from 'lucide-react';

// Usar baseURL do cliente `api` (controlado por VITE_API_BASE_URL)

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, page, pageSize]);

  const fetchOrders = async () => {
    try {
      setLoadingList(true);
      const response = await api.get(`/api/orders/`, { params: { page, page_size: pageSize } });
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.results || []);
      setOrders(list);
      setTotalCount(Number(data.count ?? list.length));
      setLoading(false);
      setLoadingList(false);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Acesso negado.');
        navigate('/');
      }
      setLoading(false);
      setLoadingList(false);
    }
  };

  const statusList = ['all','pending','paid','failed','canceled'];
  const statusLabels = {
    all: 'Todos',
    pending: 'Pendente',
    paid: 'Pago',
    failed: 'Falhou',
    canceled: 'Cancelado'
  };

  const countsByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pago' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Falhou' },
      canceled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const Pagination = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600">Total: {totalCount} pedidos</div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >Anterior</button>
        <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
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
          {statusLabels[s]} ({countsByStatus[s] || 0})
        </button>
      ))}
    </div>
  );


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
              <p className="text-gray-600 mt-2">Total de {filteredOrders.length} pedidos</p>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="hidden md:block" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loadingList ? (
            <div className="p-6 animate-pulse">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.first_name} {order.last_name}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatBRL(order.total_amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => setSelectedOrder(order)} className="text-amber-600 hover:text-amber-900 font-medium flex items-center">
                            <Eye className="w-4 h-4 mr-1" /> Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum pedido encontrado</p>
                </div>
              )}
              <Pagination />
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onOrderUpdate={fetchOrders}
        />
      )}
    </div>
  );
};

export default Orders;
