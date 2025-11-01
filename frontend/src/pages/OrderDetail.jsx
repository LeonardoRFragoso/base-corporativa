import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  Phone,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function OrderDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/api/orders/${id}/`)
        setOrder(res.data)
      } catch (e) {
        console.error('Erro ao carregar pedido:', e)
        if (e.response?.status === 404) {
          setError('Pedido não encontrado. Verifique se o ID está correto ou se você tem permissão para visualizá-lo.')
        } else if (e.response?.status === 403) {
          setError('Você não tem permissão para visualizar este pedido.')
        } else {
          setError('Não foi possível carregar o pedido. Tente novamente.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isAuthenticated, navigate])

  if (!isAuthenticated) return null

  // Função para obter badge de status
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: Clock, 
        label: 'Pendente' 
      },
      paid: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: CheckCircle, 
        label: 'Pago' 
      },
      failed: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: XCircle, 
        label: 'Falhou' 
      },
      canceled: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: AlertCircle, 
        label: 'Cancelado' 
      }
    }
    const config = statusConfig[status] || statusConfig.pending
    const IconComponent = config.icon
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com navegação */}
        <div className="mb-8">
          <Link 
            to="/orders" 
            className="inline-flex items-center text-sm text-primary-800 hover:text-primary-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para pedidos
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950"></div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}
        
        {order && (
          <div className="space-y-6">
            {/* Cabeçalho do Pedido */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-2xl font-bold text-primary-950 mb-2">Pedido #{order.id}</h1>
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(order.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <div className="text-2xl font-bold text-primary-950 mt-2">
                    R$ {Number(order.total_amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna Principal - Itens e Resumo */}
              <div className="lg:col-span-2 space-y-6">
                {/* Itens do Pedido */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6">
                  <h2 className="text-xl font-semibold text-primary-950 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Itens do Pedido
                  </h2>
                  <div className="space-y-4">
                    {(order.items || []).map((item, index) => (
                      <div key={item.id || index} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{item.product_name}</h3>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            Quantidade: {item.quantity} × R$ {Number(item.unit_price).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6">
                  <h2 className="text-xl font-semibold text-primary-950 mb-4">Resumo do Pedido</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Subtotal:</span>
                      <span>R$ {(Number(order.total_amount || 0) - Number(order.shipping_price || 0)).toFixed(2)}</span>
                    </div>
                    {Number(order.shipping_price || 0) > 0 && (
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Frete:</span>
                        <span>R$ {Number(order.shipping_price || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                      <div className="flex justify-between text-lg font-bold text-primary-950">
                        <span>Total:</span>
                        <span>R$ {Number(order.total_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Lateral - Informações */}
              <div className="space-y-6">
                {/* Informações do Cliente */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-primary-950 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Cliente
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-500">Nome</div>
                      <div className="font-medium">{order.first_name} {order.last_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-500 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </div>
                      <div className="font-medium">{order.email}</div>
                    </div>
                  </div>
                </div>

                {/* Informações de Entrega */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-primary-950 mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Entrega
                  </h3>
                  <div className="space-y-3">
                    {order.shipping_carrier && (
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500">Transportadora</div>
                        <div className="font-medium">{order.shipping_carrier}</div>
                      </div>
                    )}
                    {order.shipping_service_name && (
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500">Serviço</div>
                        <div className="font-medium">{order.shipping_service_name}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        CEP Destino
                      </div>
                      <div className="font-medium">{order.destination_zip || 'Não informado'}</div>
                    </div>
                    {(order.shipping_street || order.shipping_city) && (
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500">Endereço</div>
                        <div className="font-medium text-sm">
                          {order.shipping_street && `${order.shipping_street}${order.shipping_number ? `, ${order.shipping_number}` : ''}`}
                          {order.shipping_complement && `, ${order.shipping_complement}`}
                          {order.shipping_neighborhood && `\n${order.shipping_neighborhood}`}
                          {order.shipping_city && `\n${order.shipping_city}`}
                          {order.shipping_state && ` - ${order.shipping_state}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações de Pagamento */}
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-primary-950 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pagamento
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-500">Método</div>
                      <div className="font-medium">Mercado Pago</div>
                    </div>
                    {order.mp_payment_id && (
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500">ID do Pagamento</div>
                        <div className="font-medium text-sm">{order.mp_payment_id}</div>
                      </div>
                    )}
                    {order.mp_status && (
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500">Status MP</div>
                        <div className="font-medium">{order.mp_status}</div>
                      </div>
                    )}
                    {order.external_reference && (
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500">Referência</div>
                        <div className="font-medium text-sm">{order.external_reference}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
