import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Search, Filter, Calendar, Package, Eye, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react'

export default function Orders() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/api/orders/')
        setOrders(res.data || [])
      } catch (e) {
        setError('Não foi possível carregar seus pedidos.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAuthenticated, navigate])

  // Filtros e funções auxiliares
  const statusList = ['all', 'pending', 'paid', 'failed', 'canceled']
  const statusLabels = {
    all: 'Todos',
    pending: 'Pendente',
    paid: 'Pago',
    failed: 'Falhou',
    canceled: 'Cancelado'
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      canceled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    }
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      failed: 'Falhou',
      canceled: 'Cancelado',
    }
    const cls = styles[status] || styles.pending
    const label = labels[status] || labels.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>
        {label}
      </span>
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    // Filtro de data
    let matchesDate = true
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= monthAgo
          break
        case 'custom':
          if (customDateFrom && customDateTo) {
            const fromDate = new Date(customDateFrom)
            const toDate = new Date(customDateTo)
            toDate.setHours(23, 59, 59, 999) // Include the entire end date
            matchesDate = orderDate >= fromDate && orderDate <= toDate
          }
          break
      }
    }
    
    // Filtro por produto
    let matchesProduct = true
    if (productFilter.trim()) {
      matchesProduct = order.items?.some(item => 
        item.product_name?.toLowerCase().includes(productFilter.toLowerCase())
      ) || false
    }
    
    // Filtro por faixa de preço
    let matchesPrice = true
    if (priceMin || priceMax) {
      const orderTotal = Number(order.total_amount || 0)
      if (priceMin && orderTotal < Number(priceMin)) matchesPrice = false
      if (priceMax && orderTotal > Number(priceMax)) matchesPrice = false
    }
    
    return matchesSearch && matchesStatus && matchesDate && matchesProduct && matchesPrice
  }).sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'created_at':
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
      case 'total_amount':
        aValue = Number(a.total_amount || 0)
        bValue = Number(b.total_amount || 0)
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'customer':
        aValue = `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.email || ''
        bValue = `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.email || ''
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Paginação
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm, dateFilter, productFilter, priceMin, priceMax])

  // Função de exportação
  const exportToCSV = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Email', 'Status', 'Total', 'Produtos']
    const csvData = filteredOrders.map(order => [
      order.id,
      new Date(order.created_at).toLocaleDateString('pt-BR'),
      `${order.first_name || ''} ${order.last_name || ''}`.trim(),
      order.email || '',
      order.status,
      `R$ ${Number(order.total_amount || 0).toFixed(2)}`,
      order.items?.map(item => `${item.product_name} (${item.quantity}x)`).join('; ') || ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const Pagination = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-800/90 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-700 rounded-b-lg">
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredOrders.length)} de {filteredOrders.length} pedidos
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
        >
          Anterior
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === pageNum
                    ? 'bg-primary-950 text-white'
                    : 'border hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
        >
          Próxima
        </button>
        
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value))
            setCurrentPage(1)
          }}
          className="ml-2 border rounded px-2 py-1 text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-600"
        >
          <option value={5}>5/página</option>
          <option value={10}>10/página</option>
          <option value={20}>20/página</option>
          <option value={50}>50/página</option>
        </select>
      </div>
    </div>
  )

  const StatusChips = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {statusList.map((status) => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            statusFilter === status
              ? 'bg-primary-950 text-white border-primary-950 dark:bg-primary-700 dark:border-primary-700'
              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800'
          }`}
        >
          {statusLabels[status]} ({orders.filter(o => status === 'all' || o.status === status).length})
        </button>
      ))}
    </div>
  )

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 dark:text-primary-300">Meus Pedidos</h1>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {filteredOrders.length} de {orders.length} pedidos
            </div>
          </div>
          
          {/* Controles de Ordenação e Exportação */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={filteredOrders.length === 0}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              title="Exportar pedidos filtrados"
            >
              <Download className="w-4 h-4 mr-1" />
              Exportar ({filteredOrders.length})
            </button>
            
            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700"></div>
            
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="created_at">Data</option>
              <option value="total_amount">Valor</option>
              <option value="status">Status</option>
              <option value="customer">Cliente</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 transition-colors"
              title={`Ordenação ${sortOrder === 'asc' ? 'crescente' : 'decrescente'}`}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-soft dark:shadow-neutral-900/50 p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
          <StatusChips />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID do pedido, email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent appearance-none bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white transition-colors"
              >
                <option value="all">Todos os períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Últimos 7 dias</option>
                <option value="month">Últimos 30 dias</option>
                <option value="custom">Período personalizado</option>
              </select>
            </div>
          </div>

          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Data inicial</label>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Data final</label>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Filtros Avançados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Filtrar por produto..."
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
              />
            </div>
            
            <div>
              <input
                type="number"
                placeholder="Valor mínimo (R$)"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <input
                type="number"
                placeholder="Valor máximo (R$)"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-950"></div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}
        {!loading && filteredOrders.length === 0 && orders.length > 0 && (
          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm p-6 rounded-lg shadow-soft dark:shadow-neutral-900/50 text-center border border-neutral-200 dark:border-neutral-700">
            <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-700 dark:text-neutral-300">Nenhum pedido encontrado com os filtros aplicados.</p>
            <button 
              onClick={() => {
                setStatusFilter('all'); 
                setSearchTerm(''); 
                setDateFilter('all'); 
                setCustomDateFrom(''); 
                setCustomDateTo('');
                setProductFilter('');
                setPriceMin('');
                setPriceMax('')
              }}
              className="inline-block mt-3 px-4 py-2 bg-primary-950 text-white rounded-lg hover:bg-primary-800"
            >
              Limpar filtros
            </button>
          </div>
        )}
        {!loading && orders.length === 0 && (
          <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm p-6 rounded-lg shadow-soft dark:shadow-neutral-900/50 text-center border border-neutral-200 dark:border-neutral-700">
            <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-700 dark:text-neutral-300">Você ainda não possui pedidos.</p>
            <Link to="/catalog" className="inline-block mt-3 px-4 py-2 bg-primary-950 text-white rounded-lg hover:bg-primary-800">Ir para o catálogo</Link>
          </div>
        )}
        <div className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg shadow-soft dark:shadow-neutral-900/50 overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 gap-4 p-4">
            {paginatedOrders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition block border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Pedido #{o.id}</div>
                      {getStatusBadge(o.status)}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">{new Date(o.created_at).toLocaleString('pt-BR')}</div>
                    {(o.first_name || o.last_name || o.email) && (
                      <div className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                        {o.first_name} {o.last_name} {o.email && `(${o.email})`}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary-950 dark:text-primary-300">R$ {Number(o.total_amount || 0).toFixed(2)}</div>
                    <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver detalhes
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {paginatedOrders.length > 0 && <Pagination />}
        </div>
      </div>
    </div>
  )
}
