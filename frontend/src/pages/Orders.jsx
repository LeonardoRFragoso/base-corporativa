import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Orders() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
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

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-6">Meus Pedidos</h1>
        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-950"></div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}
        {!loading && orders.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow-soft">
            <p className="text-neutral-700">Você ainda não possui pedidos.</p>
            <Link to="/catalog" className="inline-block mt-3 px-4 py-2 bg-primary-950 text-white rounded-lg hover:bg-primary-800">Ir para o catálogo</Link>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="bg-white p-6 rounded-lg shadow-soft hover:shadow-medium transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-500">Pedido #{o.id}</div>
                  <div className="text-neutral-700">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm capitalize">Status: <span className="font-medium text-primary-950">{o.status}</span></div>
                  <div className="text-lg font-semibold text-primary-950">R$ {Number(o.total_amount || 0).toFixed(2)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
