import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Package, Image as ImageIcon, Layers, DollarSign, Tag, FileText } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import SEO from '../components/SEO.jsx'
import toast from 'react-hot-toast'

export default function AdminProductEdit() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()

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
    variants: [],
  })
  const [images, setImages] = useState([]) // new uploads
  const [imagePreviews, setImagePreviews] = useState([]) // {url,isExisting,id}
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/api/categories/'),
          api.get(`/api/products/${id}/`),
        ])
        setCategories(catRes.data || [])

        const p = prodRes.data
        setForm({
          name: p.name || '',
          description: p.description || '',
          fabric_type: p.fabric_type || '',
          composition: p.composition || '',
          care_instructions: p.care_instructions || '',
          base_price: p.base_price ?? '',
          category: p.category?.id || '',
          is_active: p.is_active !== false,
          variants: (p.variants || []).map(v => ({
            size: v.size || '',
            color: v.color || '',
            price: v.price ?? '',
            stock: v.stock ?? 0,
            is_default: !!v.is_default,
            id: v.id,
          })),
        })

        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
        const previews = (p.images || []).map(img => ({
          url: img.image?.startsWith('http') ? img.image : `${baseURL}${img.image}`,
          isExisting: true,
          id: img.id,
        }))
        setImagePreviews(previews)
      } catch (e) {
        setError('Falha ao carregar produto')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Acesso restrito</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Você precisa ser administrador para acessar esta página.</p>
        </div>
      </div>
    )
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  // Variants handlers
  function addVariantRow() {
    setForm((f) => ({
      ...f,
      variants: [...(f.variants || []), { size: '', color: '', price: '', stock: 0, is_default: false }],
    }))
  }

  function updateVariantRow(index, field, value) {
    setForm((f) => {
      const list = [...(f.variants || [])]
      list[index] = { ...list[index], [field]: value }
      return { ...f, variants: list }
    })
  }

  function removeVariantRow(index) {
    setForm((f) => ({
      ...f,
      variants: (f.variants || []).filter((_, i) => i !== index),
    }))
  }

  function setDefaultVariant(index) {
    setForm((f) => {
      const list = (f.variants || []).map((v, i) => ({ ...v, is_default: i === index }))
      return { ...f, variants: list }
    })
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setImages((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, { url: reader.result, isExisting: false }])
      }
      reader.readAsDataURL(file)
    })
  }

  async function removeImage(index) {
    const preview = imagePreviews[index]
    if (preview.isExisting) {
      try {
        await api.delete(`/api/products/${id}/images/${preview.id}/`)
      } catch (e) {
        setError('Falha ao remover imagem existente')
        return
      }
    } else {
      // Remove da fila de uploads
      const nonExistingIndicesBefore = imagePreviews.slice(0, index).filter(p => !p.isExisting).length
      setImages((prev) => prev.filter((_, i) => i !== nonExistingIndicesBefore))
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadImages(productId) {
    if (!images.length) return
    for (let i = 0; i < images.length; i++) {
      const formData = new FormData()
      formData.append('image', images[i])
      formData.append('sort_order', i)
      formData.append('is_primary', i === 0 ? 'true' : 'false')
      await api.post(`/api/products/${productId}/upload-image/`, formData)
    }
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
          is_default: Boolean(v.is_default),
          id: v.id,
        })),
      }

      await api.put(`/api/products/${id}/`, payload)
      if (images.length) {
        await uploadImages(id)
      }
      navigate('/admin/products')
    } catch (e) {
      console.error(e)
      setError('Falha ao salvar alterações. Verifique os campos e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Carregando produto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <SEO title="Editar Produto - Admin" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Produtos', path: '/admin/products' },
          { label: 'Editar Produto' }
        ]} />

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Editar produto</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">Atualize os dados do produto e suas variantes</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/admin/products')} className="px-4 py-2 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium">
            Cancelar
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-400">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Informações Básicas</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Nome do Produto *</label>
                <input name="name" value={form.name} onChange={onChange} className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Descrição</label>
                <textarea name="description" value={form.description} onChange={onChange} className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none" rows={4} />
              </div>
            </div>
          </div>

          {/* Detalhes do Tecido */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Detalhes do Tecido</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Tipo de tecido</label>
                <input name="fabric_type" value={form.fabric_type} onChange={onChange} className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Composição</label>
                <input name="composition" value={form.composition} onChange={onChange} className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Instruções de cuidado</label>
              <input name="care_instructions" value={form.care_instructions} onChange={onChange} className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400" />
            </div>
          </div>

          {/* Preço e Categoria */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Preço e Categoria</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Preço base (R$) *</label>
                <input type="number" step="0.01" name="base_price" value={form.base_price} onChange={onChange} className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Categoria *</label>
                <select name="category" value={form.category} onChange={onChange} className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100" required>
                  <option value="">Selecione uma categoria</option>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <input id="is_active" type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} className="w-5 h-5 text-primary-600 border-neutral-300 dark:border-neutral-600 rounded focus:ring-2 focus:ring-primary-500" />
              <label htmlFor="is_active" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">Produto ativo (visível no catálogo)</label>
            </div>
          </div>

          {/* Variantes */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Variantes</h2>
              </div>
              <button type="button" onClick={addVariantRow} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Adicionar variante
              </button>
            </div>
            {(form.variants || []).length === 0 ? (
              <div className="text-center py-8 px-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                <Tag className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Nenhuma variante adicionada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(form.variants || []).map((v, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Tamanho</label>
                      <input value={v.size || ''} onChange={(e)=>updateVariantRow(idx, 'size', e.target.value)} className="w-full px-3 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Cor</label>
                      <input value={v.color || ''} onChange={(e)=>updateVariantRow(idx, 'color', e.target.value)} className="w-full px-3 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Preço (opcional)</label>
                      <input type="number" step="0.01" value={v.price ?? ''} onChange={(e)=>updateVariantRow(idx, 'price', e.target.value)} className="w-full px-3 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Estoque</label>
                      <input type="number" value={v.stock ?? 0} onChange={(e)=>updateVariantRow(idx, 'stock', e.target.value)} className="w-full px-3 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm" />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input id={`def-${idx}`} type="checkbox" checked={!!v.is_default} onChange={() => setDefaultVariant(idx)} className="w-4 h-4 text-primary-600 border-neutral-300 dark:border-neutral-600 rounded focus:ring-2 focus:ring-primary-500" />
                        <label htmlFor={`def-${idx}`} className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Padrão</label>
                      </div>
                      <button type="button" onClick={()=>removeVariantRow(idx)} className="px-3 py-2 text-xs font-semibold rounded-lg bg-error-600 text-white hover:bg-error-700 transition-colors">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Imagens */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Imagens do Produto</h2>
            </div>
            <div className="flex items-center justify-center w-full mb-4">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-neutral-300 dark:border-neutral-600 border-dashed rounded-xl cursor-pointer bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-10 h-10 mb-3 text-neutral-400" />
                  <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">PNG, JPG ou WEBP (máx. 5MB cada)</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview.url} alt="preview" className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200 dark:border-neutral-700" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1.5 rounded-full bg-error-600 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-700">×</button>
                    {index === 0 && <span className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded bg-primary-600 text-white font-semibold">Principal</span>}
                    {preview.isExisting && <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-neutral-800 text-white">Existente</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-3 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-semibold">
              Cancelar
            </button>
            <button disabled={submitting} className="px-8 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Salvando alterações...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
