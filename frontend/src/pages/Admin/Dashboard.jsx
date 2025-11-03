import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatBRL, formatNumber } from '../../utils/format';
import { exportOrders, exportProducts, exportCustomers, exportSalesReport, exportLowStock } from '../../utils/export';
import OrderModal from '../../components/OrderModal';
import Breadcrumbs from '../../components/Breadcrumbs';
import { DashboardCardSkeleton } from '../../components/SkeletonLoader';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesChart, setSalesChart] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [period, setPeriod] = useState('30');
  const [comparePeriod, setComparePeriod] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [period, user]);

  const fetchDashboardData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      const [overview, chart, products, stock, orders] = await Promise.all([
        api.get(`/api/analytics/dashboard/`),
        api.get(`/api/analytics/sales-chart/?period=${period}`),
        api.get(`/api/analytics/top-products/?limit=5`),
        api.get(`/api/analytics/low-stock/?threshold=5`),
        api.get(`/api/analytics/recent-orders/?limit=5`)
      ]);

      setDashboardData(overview.data);
      setSalesChart(chart.data);
      setTopProducts(products.data);
      setLowStock(stock.data);
      setRecentOrders(orders.data);
      
      if (showToast) toast.success('Dashboard atualizado!');
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
        navigate('/');
      } else {
        toast.error('Erro ao carregar dados do dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOrderClick = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do pedido:', error);
      toast.error('Erro ao carregar detalhes do pedido');
    }
  };

  const exportData = async (type) => {
    switch(type) {
      case 'dashboard':
        await exportSalesReport(30);
        break;
      case 'orders':
        await exportOrders();
        break;
      case 'products':
        await exportProducts();
        break;
      case 'customers':
        await exportCustomers();
        break;
      case 'low-stock':
        await exportLowStock();
        break;
      default:
        toast.error('Tipo de exportação não suportado');
    }
  };

  // Chart configurations
  const salesLineChartData = salesChart ? {
    labels: salesChart.labels || [],
    datasets: [
      {
        label: 'Vendas (R$)',
        data: salesChart.sales || [],
        borderColor: 'rgb(212, 165, 116)',
        backgroundColor: 'rgba(212, 165, 116, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  } : null;

  const salesLineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `R$ ${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R$ ${value}`
        }
      }
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend, to }) => (
    <button
      type="button"
      onClick={() => to && navigate(to)}
      className={`text-left w-full bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-md dark:shadow-neutral-900/50 hover:shadow-xl dark:hover:shadow-primary-500/20 p-6 transition-all transform hover:-translate-y-1 border border-neutral-200 dark:border-neutral-700 ${
        to ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-neutral-500 text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-2">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}% vs período anterior</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-72 bg-gray-200 rounded" />
            <div className="h-4 w-56 bg-gray-100 dark:bg-neutral-800 rounded mt-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <DashboardCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Dashboard' }
        ]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">Dashboard Administrativo</h1>
            <p className="text-gray-600 dark:text-neutral-400 mt-2">Visão geral do seu e-commerce</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 text-neutral-900 dark:text-neutral-100"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => exportData('dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={DollarSign}
            title="Vendas Totais"
            value={formatBRL(dashboardData?.sales?.total)}
            subtitle={`${formatBRL(dashboardData?.sales?.last_30_days)} nos últimos 30 dias`}
            color="text-green-600"
            trend={12}
            to="/admin/orders?status=paid"
          />
          <StatCard
            icon={ShoppingCart}
            title="Pedidos"
            value={formatNumber(dashboardData?.orders?.total)}
            subtitle={`${formatNumber(dashboardData?.orders?.pending)} pendentes`}
            color="text-blue-600"
            trend={8}
            to="/admin/orders"
          />
          <StatCard
            icon={Package}
            title="Produtos"
            value={formatNumber(dashboardData?.products?.total)}
            subtitle={`${formatNumber(dashboardData?.products?.total_stock)} unidades em estoque`}
            color="text-purple-600"
            to="/admin/products"
          />
          <StatCard
            icon={Users}
            title="Clientes"
            value={formatNumber(dashboardData?.customers?.total)}
            subtitle={`${formatNumber(dashboardData?.customers?.new_last_30_days)} novos este mês`}
            color="text-amber-600"
            trend={15}
            to="/admin/customers"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-md dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Evolução de Vendas
              </h2>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-600"
              >
                <option value="7">7 dias</option>
                <option value="30">30 dias</option>
                <option value="90">90 dias</option>
                <option value="365">1 ano</option>
              </select>
            </div>
            <div className="h-80">
              {salesLineChartData && (
                <Line data={salesLineChartData} options={salesLineChartOptions} />
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-md dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Produtos Mais Vendidos
            </h2>
            <div className="space-y-4">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-900 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-neutral-100 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-neutral-500">{formatNumber(product.quantity)} unidades</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatBRL(product.revenue)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Sem dados de produtos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-md dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Alertas de Estoque
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                {lowStock.length}
              </span>
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {lowStock && lowStock.length > 0 ? (
                lowStock.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      item.status === 'out_of_stock' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-neutral-100">{item.product_name}</p>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">
                        {item.size && `Tamanho: ${item.size}`} {item.color && `- Cor: ${item.color}`}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        item.status === 'out_of_stock'
                          ? 'bg-red-200 text-red-900'
                          : 'bg-orange-200 text-orange-900'
                      }`}
                    >
                      {item.stock} un.
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum alerta de estoque</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-md dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Pedidos Recentes
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentOrders && recentOrders.length > 0 ? recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer border border-gray-200 dark:border-neutral-700"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-neutral-100">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">{order.customer}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-neutral-100 mb-1">{formatBRL(order.total)}</p>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status === 'paid' ? 'Pago' : order.status === 'pending' ? 'Pendente' : 'Falhou'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Sem pedidos recentes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1 shadow-md hover:shadow-xl flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            Gerenciar Pedidos
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1 shadow-md hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Package className="w-5 h-5" />
            Gerenciar Produtos
          </button>
          <button
            onClick={() => navigate('/admin/coupons')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1 shadow-md hover:shadow-xl flex items-center justify-center gap-3"
          >
            <DollarSign className="w-5 h-5" />
            Cupons
          </button>
          <button
            onClick={() => {
              const base = (api?.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
              window.open(`${base}/admin/`, '_blank');
            }}
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:-translate-y-1 shadow-md hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Activity className="w-5 h-5" />
            Django Admin
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onOrderUpdate={() => fetchDashboardData(true)}
        />
      )}
    </div>
  );
};

export default Dashboard;
