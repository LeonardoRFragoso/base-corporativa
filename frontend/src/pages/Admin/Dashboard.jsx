import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatBRL, formatNumber } from '../../utils/format';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';

// Usar o cliente compartilhado `api` que já resolve baseURL a partir de VITE_API_BASE_URL

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesChart, setSalesChart] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [period, user]);

  const fetchDashboardData = async () => {
    try {
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
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Acesso negado. Apenas administradores podem acessar esta página.');
        navigate('/');
      }
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, to }) => (
    <button
      type="button"
      onClick={() => to && navigate(to)}
      className={`text-left w-full bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${to ? 'hover:ring-2 hover:ring-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </button>
  );

  const EmptyState = ({ title, subtitle }) => (
    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">–</div>
      <p className="font-medium">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded" />
      <div className="h-8 w-32 bg-gray-200 rounded mt-4" />
      <div className="h-3 w-40 bg-gray-100 rounded mt-2" />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-72 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded mt-3 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 h-72 animate-pulse" />
            <div className="bg-white rounded-lg shadow-md p-6 h-72 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Visão geral do seu e-commerce</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={DollarSign}
            title="Vendas Totais"
            value={formatBRL(dashboardData?.sales?.total)}
            subtitle={`${formatBRL(dashboardData?.sales?.last_30_days)} nos últimos 30 dias`}
            color="text-green-600"
            to="/admin/orders?status=paid"
          />
          <StatCard
            icon={ShoppingCart}
            title="Pedidos"
            value={formatNumber(dashboardData?.orders?.total)}
            subtitle={`${formatNumber(dashboardData?.orders?.pending)} pendentes`}
            color="text-blue-600"
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
            to="/admin/orders"
          />
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Vendas
              </h2>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="7">7 dias</option>
                <option value="30">30 dias</option>
                <option value="90">90 dias</option>
              </select>
            </div>
            <div className="h-64">
              {salesChart && salesChart.sales && salesChart.sales.length > 0 ? (
                <div className="h-full flex items-end justify-between space-x-2">
                  {salesChart.sales.map((value, index) => {
                    const maxValue = Math.max(...salesChart.sales);
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md hover:from-amber-700 hover:to-amber-500 transition-colors cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={formatBRL(value)}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">{salesChart.labels[index]}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Nenhuma venda no período" subtitle="Tente outro intervalo de datas." />
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Produtos Mais Vendidos
            </h2>
            <div className="space-y-3">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{formatNumber(product.quantity)} unidades vendidas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatBRL(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="Sem dados de produtos" subtitle="Nenhuma venda registrada." />
              )}
            </div>
          </div>
        </div>

        {/* Alerts and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Alertas de Estoque
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                {lowStock.length}
              </span>
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lowStock && lowStock.length > 0 ? (
                lowStock.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.status === 'out_of_stock' ? 'bg-red-50' : 'bg-orange-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.size && `Tamanho: ${item.size}`} {item.color && `- Cor: ${item.color}`}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.status === 'out_of_stock'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-orange-200 text-orange-800'
                      }`}
                    >
                      {item.stock} un.
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState title="Nenhum alerta de estoque" />
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Pedidos Recentes
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentOrders && recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatBRL(order.total)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
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
                <EmptyState title="Sem pedidos recentes" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Gerenciar Pedidos
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <Package className="w-5 h-5 mr-2" />
            Gerenciar Produtos
          </button>
          <button
            onClick={() => window.open(`${API_URL}/admin/`, '_blank')}
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <Activity className="w-5 h-5 mr-2" />
            Django Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
