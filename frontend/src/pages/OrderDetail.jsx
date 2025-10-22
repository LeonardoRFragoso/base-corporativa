import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'

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
        setError('Não foi possível carregar o pedido.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isAuthenticated, navigate])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/orders" className="text-sm text-primary-800 hover:text-primary-950">← Voltar para pedidos</Link>
        </div>
        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-950"></div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}
        {order && (
          <div className="bg-white p-6 rounded-lg shadow-soft space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-500">Pedido #{order.id}</div>
                <div className="text-neutral-700">{new Date(order.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm capitalize">Status: <span className="font-medium text-primary-950">{order.status}</span></div>
                <div className="text-lg font-semibold text-primary-950">Total R$ {Number(order.total_amount || 0).toFixed(2)}</div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-primary-950 mb-2">Itens</h2>
              <div className="divide-y divide-neutral-200">
                {(order.items || []).map((it) => (
                  <div key={it.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-neutral-800">{it.product_name}</div>
                      <div className="text-sm text-neutral-600">Qtd: {it.quantity}</div>
                    </div>
                    <div className="text-neutral-900 font-medium">R$ {Number(it.unit_price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="text-sm text-neutral-500">Frete</div>
                <div className="text-neutral-800">{order.shipping_carrier || '—'} {order.shipping_service_name ? `• ${order.shipping_service_name}` : ''}</div>
                <div className="text-neutral-700">CEP destino: {order.destination_zip || '—'}</div>
                <div className="text-neutral-900 font-medium mt-1">R$ {Number(order.shipping_price || 0).toFixed(2)}</div>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="text-sm text-neutral-500">Pagamento</div>
                <div className="text-neutral-800">Mercado Pago</div>
                <div className="text-sm text-neutral-600">Status MP: {order.mp_status || '—'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
