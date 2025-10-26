import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'

export default function ProductModal({ product, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    fabric_type: '',
    category: '',
    is_active: true
  })
  const [variants, setVariants] = useState([])
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        base_price: product.base_price || '',
        fabric_type: product.fabric_type || '',
        category: product.category?.id || '',
        is_active: product.is_active !== false
      })
      setVariants(product.variants || [])
      // Load existing images
      if (product.images && product.images.length > 0) {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
        const existingPreviews = product.images.map(img => ({
          url: img.image.startsWith('http') ? img.image : `${baseURL}${img.image}`,
          isExisting: true,
          id: img.id
        }))
        setImagePreviews(existingPreviews)
      }
    }
  }, [product])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function handleVariantChange(index, field, value) {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  function addVariant() {
    setVariants([...variants, { size: '', color: '', price: '', stock: 0 }])
  }

  function removeVariant(index) {
    setVariants(variants.filter((_, i) => i !== index))
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(f => !validTypes.includes(f.type))
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ ...prev, images: 'Apenas arquivos JPG, PNG e WEBP são permitidos' }))
      return
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({ ...prev, images: 'Cada imagem deve ter no máximo 5MB' }))
      return
    }

    setImages(prev => [...prev, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, { url: reader.result, isExisting: false }])
      }
      reader.readAsDataURL(file)
    })

    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }

  async function removeImage(index) {
    const preview = imagePreviews[index]

    if (preview.isExisting && product) {
      try {
        await api.delete(`/api/products/${product.id}/images/${preview.id}/`)
      } catch (err) {
        setErrors(prev => ({ ...prev, images: 'Falha ao remover a imagem existente' }))
        return
      }
    } else {
      const newImageIndex = imagePreviews.slice(0, index).filter(p => !p.isExisting).length
      setImages(prev => prev.filter((_, i) => i !== newImageIndex))
    }

    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadImages(productId) {
    if (images.length === 0) return

    setUploadingImages(true)
    try {
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData()
        formData.append('image', images[i])
        formData.append('sort_order', i)
        formData.append('is_primary', i === 0 ? 'true' : 'false')
        
        await api.post(`/api/products/${productId}/upload-image/`, formData)
      }
    } catch (error) {
      console.error('Erro ao fazer upload de imagens:', error)
      throw error
    } finally {
      setUploadingImages(false)
    }
  }

  function validateForm() {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    
    if (!formData.base_price || Number(formData.base_price) <= 0) {
      newErrors.base_price = 'Preço base deve ser maior que zero'
    }
    
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
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
        ...formData,
        base_price: toNumber(formData.base_price),
        variants: variants.map(v => ({
          size: normalizeSize(v.size),
          color: v.color || '',
          price: v.price ? toNumber(v.price) : toNumber(formData.base_price),
          stock: toNumber(v.stock || 0),
          is_default: Boolean(v.is_default)
        }))
      }

      let response
      if (product) {
        // Update existing product
        response = await api.put(`/api/products/${product.id}/`, payload)
        
        // Upload new images if any
        if (images.length > 0) {
          await uploadImages(product.id)
        }
      } else {
        // Create new product
        response = await api.post('/api/products/', payload)
        
        // Upload images for new product
        if (images.length > 0) {
          await uploadImages(response.data.id)
        }
      }

      onSave(response.data)
      onClose()
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
      if (err.response?.data) {
        setErrors(err.response.data)
      } else {
        setErrors({ general: 'Erro ao salvar produto. Tente novamente.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-strong max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-display font-bold text-primary-950">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {errors.general && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark-900">Informações Básicas</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                Nome do Produto *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-error-300 bg-error-50' : 'border-neutral-300'
                }`}
                placeholder="Ex: Camiseta Oversized Preta"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Descreva o produto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="base_price" className="block text-sm font-medium text-neutral-700 mb-2">
                  Preço Base (R$) *
                </label>
                <input
                  id="base_price"
                  name="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.base_price}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.base_price ? 'border-error-300 bg-error-50' : 'border-neutral-300'
                  }`}
                  placeholder="79.90"
                />
                {errors.base_price && (
                  <p className="mt-1 text-sm text-error-600">{errors.base_price}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                  Categoria *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.category ? 'border-error-300 bg-error-50' : 'border-neutral-300'
                  }`}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-error-600">{errors.category}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="fabric_type" className="block text-sm font-medium text-neutral-700 mb-2">
                Tipo de Tecido
              </label>
              <input
                id="fabric_type"
                name="fabric_type"
                type="text"
                value={formData.fabric_type}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Ex: Algodão Premium"
              />
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-neutral-700">
                Produto ativo (visível no catálogo)
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark-900">Imagens do Produto</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Adicionar Imagens
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-neutral-500">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-neutral-500">PNG, JPG ou WEBP (máx. 5MB cada)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {errors.images && (
                <p className="mt-1 text-sm text-error-600">{errors.images}</p>
              )}
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm text-neutral-600 mb-3">
                  {imagePreviews.length} imagem{imagePreviews.length !== 1 ? 's' : ''} selecionada{imagePreviews.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-error-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded">
                          Principal
                        </div>
                      )}
                      {preview.isExisting && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded">
                          Existente
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark-900">Variantes</h3>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Variante
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">
                Nenhuma variante adicionada. Clique em "Adicionar Variante" para criar tamanhos e cores.
              </p>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 bg-neutral-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Tamanho (P, M, G)"
                        value={variant.size || ''}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="Cor"
                        value={variant.color || ''}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço (opcional)"
                        value={variant.price || ''}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        placeholder="Estoque"
                        value={variant.stock || 0}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-error-500 hover:text-error-700 transition-colors p-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="px-6 py-3 bg-bronze-800 text-white rounded-lg hover:bg-bronze-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploadingImages ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploadingImages ? 'Fazendo upload de imagens...' : 'Salvando...'}
                </div>
              ) : (
                product ? 'Atualizar Produto' : 'Criar Produto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
