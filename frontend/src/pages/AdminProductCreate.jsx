import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminProductCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    fabric_type: '',
    composition: '',
    care_instructions: '',
    base_price: '',
    category: '',
    is_active: true,
  })
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/categories/')
        setCategories(res.data)
      } catch (e) {
        setError('Falha ao carregar categorias')
      }
    }
    load()
  }, [])

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const toNumber = (val) => {
        if (typeof val === 'number') return val
        if (val === null || val === undefined) return 0
        const s0 = String(val).trim()
        const s = s0.includes(',') ? s0.replace(/\./g, '').replace(',', '.') : s0
        const n = Number(s)
        return Number.isFinite(n) ? n : 0
      }
      const normalizeSize = (s) => {
        const v = String(s || '').toUpperCase().trim()
        const map = { 'PP':'XS', 'P':'S', 'M':'M', 'G':'L', 'GG':'XL', 'XG':'XL', 'EG':'XL', 'XXG':'XXL', 'XGG':'XXL' }
        if (['XS','S','M','L','XL','XXL'].includes(v)) return v
        return map[v] || ''
      }

      const payload = {
        name: form.name,
        description: form.description,
        fabric_type: form.fabric_type,
        composition: form.composition,
        care_instructions: form.care_instructions,
        base_price: toNumber(form.base_price),
        is_active: form.is_active,
        category: form.category,
        variants: (form.variants || []).map(v => ({
          size: normalizeSize(v.size),
          color: v.color || '',
          price: v.price ? toNumber(v.price) : toNumber(form.base_price),
          stock: toNumber(v.stock || 0),
          is_default: Boolean(v.is_default)
        })),
      }
      const createRes = await api.post('/api/products/', payload)
      const product = createRes.data

      if (images && images.length) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i]
          const formData = new FormData()
          formData.append('image', file)
          formData.append('alt_text', `${form.name} - ${i + 1}`)
          formData.append('is_primary', i === 0 ? 'true' : 'false')
          await api.post(`/api/products/${product.id}/upload-image/`, formData)
        }
      }

      navigate(`/product/${product.id}`)
    } catch (e) {
      console.error(e)
      setError('Falha ao criar produto. Verifique os campos e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user?.is_staff) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Acesso restrito</h1>
        <p>Você precisa ser administrador para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Cadastrar novo produto</h1>
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input name="name" value={form.name} onChange={onChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea name="description" value={form.description} onChange={onChange} className="w-full border rounded p-2" rows={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de tecido</label>
            <input name="fabric_type" value={form.fabric_type} onChange={onChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Composição</label>
            <input name="composition" value={form.composition} onChange={onChange} className="w-full border rounded p-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instruções de cuidado</label>
          <input name="care_instructions" value={form.care_instructions} onChange={onChange} className="w-full border rounded p-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preço base</label>
            <input type="number" step="0.01" name="base_price" value={form.base_price} onChange={onChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select name="category" value={form.category} onChange={onChange} className="w-full border rounded p-2" required>
              <option value="">Selecione</option>
              {categories.map((c) => (
                <option value={c.id} key={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input id="is_active" type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
          <label htmlFor="is_active" className="text-sm">Ativo</label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Imagens</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} />
          <p className="text-xs text-gray-600 mt-1">A primeira imagem será marcada como principal.</p>
        </div>
        <div>
          <button disabled={submitting} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
            {submitting ? 'Enviando...' : 'Criar produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
