import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useCart } from '../context/CartContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import SEO from '../components/SEO.jsx'
import { ProductSchema, BreadcrumbSchema } from '../components/StructuredData.jsx'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const { add } = useCart()
  const { isAuthenticated } = useAuth()

  // Wishlist state
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState('')

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  async function toggleWishlist() {
    if (!product) return
    if (!isAuthenticated) {
      alert('Faça login para usar a wishlist.')
      return
    }
    if (wishlistLoading) return
    setWishlistLoading(true)
    try {
      if (wishlisted) {
        await api.delete(`/api/user/wishlist/${product.id}/`)
        setWishlisted(false)
      } else {
        await api.post('/api/user/wishlist/', { product_id: product.id })
        setWishlisted(true)
      }
    } catch (e) {
      // noop
    } finally {
      setWishlistLoading(false)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!product) return
    try {
      setReviewLoading(true)
      await api.post(`/api/reviews/${product.id}/`, { rating: Number(ratingInput), comment: commentInput })
      setCommentInput('')
      // reload
      const rev = await api.get(`/api/reviews/${product.id}/`)
      setReviews(Array.isArray(rev.data) ? rev.data : [])
    } catch (e) {
      // noop
    } finally {
      setReviewLoading(false)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/products/${id}/`)
        setProduct(res.data)
        // Select first available variant
        if (res.data.variants && res.data.variants.length > 0) {
          const firstAvailable = res.data.variants.find(v => v.stock > 0) || res.data.variants[0]
          setSelectedVariant(firstAvailable)
        }
        
        // Load related products from same category
        if (res.data.category) {
          try {
            const relatedRes = await api.get(`/api/products/?category=${res.data.category.id}&limit=4`)
            const filtered = relatedRes.data.filter(p => p.id !== parseInt(id))
            setRelatedProducts(filtered.slice(0, 3))
          } catch (error) {
            console.error('Erro ao carregar produtos relacionados:', error)
          }
        }
        // Load wishlist status if logged in
        try {
          if (isAuthenticated) {
            const wl = await api.get('/api/user/wishlist/')
            const has = (wl.data || []).some(w => Number(w.product_id) === Number(id))
            setWishlisted(has)
          } else {
            setWishlisted(false)
          }
        } catch {}

        // Load reviews
        try {
          const rev = await api.get(`/api/reviews/${id}/`)
          setReviews(Array.isArray(rev.data) ? rev.data : [])
        } catch {}
      } catch (error) {
        console.error('Erro ao carregar produto:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isAuthenticated])

  const pdfUrl = useMemo(() => {
    if (!product?.catalog_pdf) return null
    const p = product.catalog_pdf
    return p.startsWith('http') ? p : `${baseURL}${p}`
  }, [product, baseURL])

  async function downloadProductPdf() {
    if (!pdfUrl) return
    try {
      const res = await fetch(pdfUrl)
      if (!res.ok) throw new Error('PDF não disponível')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${product?.slug || 'produto'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      window.open(pdfUrl, '_blank')
    }
  }

  const images = useMemo(() => {
    if (!product?.images) return []
    return product.images.map(img => {
      const path = img.image
      return path.startsWith('http') ? path : `${baseURL}${path}`
    })
  }, [product, baseURL])

  const availableSizes = useMemo(() => {
    if (!product?.variants) return []
    return [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))].filter(Boolean)
  }, [product])

  const availableColors = useMemo(() => {
    if (!product?.variants) return []
    return [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.color))].filter(Boolean)
  }, [product])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Carregando produto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gold-500 to-bronze-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-950 mb-4">Produto não encontrado</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">O produto que você está procurando não existe ou foi removido.</p>
          <Link 
            to="/catalog" 
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gold-500 to-bronze-500 text-dark-950 font-semibold rounded-lg hover:from-gold-400 hover:to-bronze-400 transition-all duration-200"
          >
            Voltar ao catálogo
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  async function addToCart() {
    if (!selectedVariant) return
    
    setAddingToCart(true)
    try {
      const price = selectedVariant.price || Number(product.base_price)
      const image = images.length > 0 ? images[0] : null
      
      add({ 
        id: product.id, 
        variantId: selectedVariant.id, 
        name: product.name, 
        price, 
        qty,
        size: selectedVariant.size,
        color: selectedVariant.color,
        image: image
      })
      
      // Show success feedback
      setTimeout(() => setAddingToCart(false), 1000)
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      setAddingToCart(false)
    }
  }

  function selectVariant(size, color) {
    const variant = product.variants.find(v => 
      v.size === size && v.color === color && v.stock > 0
    )
    if (variant) {
      setSelectedVariant(variant)
    }
  }

  const currentPrice = Number(selectedVariant?.price) || Number(product.base_price)
  const isInStock = selectedVariant?.stock > 0
  const stockCount = selectedVariant?.stock || 0

  const breadcrumbItems = [
    { name: 'Início', url: '/' },
    { name: 'Catálogo', url: '/catalog' },
    { name: product.name, url: `/product/${product.id}` }
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <SEO 
        title={`${product.name} - BASE CORPORATIVA`}
        description={`${product.description} Compre agora na BASE CORPORATIVA com frete grátis acima de R$ 200. Qualidade premium em roupas corporativas.`}
        keywords={`${product.name}, ${product.category?.name || 'roupas corporativas'}, uniformes profissionais, BASE CORPORATIVA`}
        url={`/product/${product.id}`}
        type="product"
        image={product.images?.[0]?.image}
      />
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Link to="/" className="hover:text-primary-950">Início</Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-primary-950">Catálogo</Link>
            <span>/</span>
            <span className="text-primary-950">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-soft">
              {images.length > 0 ? (
                <img 
                  src={images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary-950' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-primary-950 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                {product.category && (
                  <div className="text-neutral-600 dark:text-neutral-400">
                    <Link to={`/catalog?category=${product.category.id}`} className="hover:text-primary-950">
                      {product.category.name}
                    </Link>
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition ${wishlisted ? 'border-gold-500 text-gold-700 bg-gold-50' : 'border-neutral-300 text-neutral-700 hover:border-primary-950'}`}
                >
                  <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                  {wishlisted ? 'Salvo' : 'Salvar' }
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-gold-600 to-bronze-600 bg-clip-text text-transparent">
                R$ {currentPrice.toFixed(2)}
              </div>
              {selectedVariant?.price && Number(selectedVariant.price) !== Number(product.base_price) && (
                <div className="text-lg text-neutral-500 dark:text-neutral-500 line-through">
                  R$ {Number(product.base_price).toFixed(2)}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Fabric info */}
            {(product.fabric_type || product.composition) && (
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-soft">
                <h3 className="font-semibold text-primary-950 mb-2">Informações do tecido</h3>
                {product.fabric_type && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    <span className="font-medium">Tipo:</span> {product.fabric_type}
                  </p>
                )}
                {product.composition && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-medium">Composição:</span> {product.composition}
                  </p>
                )}
              </div>
            )}

            {/* Size selection */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="font-semibold text-primary-950 mb-3">Tamanho</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => selectVariant(size, selectedVariant?.color)}
                      className={`px-4 py-2 border rounded-lg transition-all ${
                        selectedVariant?.size === size
                          ? 'border-primary-950 bg-primary-950 text-white'
                          : 'border-neutral-300 hover:border-primary-950'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selection */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="font-semibold text-primary-950 mb-3">Cor</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => selectVariant(selectedVariant?.size, color)}
                      className={`px-4 py-2 border rounded-lg transition-all capitalize ${
                        selectedVariant?.color === color
                          ? 'border-primary-950 bg-primary-950 text-white'
                          : 'border-neutral-300 hover:border-primary-950'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock info */}
            <div className="text-sm">
              {isInStock ? (
                <span className="text-success-600">
                  {stockCount <= 5 ? `Apenas ${stockCount} em estoque` : 'Em estoque'}
                </span>
              ) : (
                <span className="text-error-500">Fora de estoque</span>
              )}
            </div>

            {/* Add to cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded-lg">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={stockCount}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(stockCount, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center py-2 border-0 focus:ring-0"
                />
                <button
                  onClick={() => setQty(Math.min(stockCount, qty + 1))}
                  className="px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={!isInStock || !selectedVariant || addingToCart}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  addingToCart 
                    ? 'bg-green-500 text-white' 
                    : isInStock && selectedVariant
                      ? 'bg-gradient-to-r from-gold-500 to-bronze-500 text-dark-950 hover:from-gold-400 hover:to-bronze-400 hover:scale-105 shadow-medium hover:shadow-strong'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {addingToCart ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Adicionado ao carrinho!
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    Adicionar ao carrinho
                  </div>
                )}
              </button>
              {pdfUrl && (
                <button
                  type="button"
                  onClick={downloadProductPdf}
                  className="px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:bg-neutral-800"
                >
                  Baixar ficha PDF
                </button>
              )}
            </div>

            {/* Care instructions */}
            {product.care_instructions && (
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                <h3 className="font-semibold text-primary-950 mb-2">Cuidados</h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{product.care_instructions}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-primary-950 mb-4">
                Produtos Relacionados
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Outras peças da categoria {product.category?.name}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                to={`/catalog?category=${product.category?.id}`}
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-gold-500 text-gold-700 font-semibold rounded-lg hover:bg-gold-50 transition-all duration-200"
              >
                Ver todos os produtos da categoria
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-2xl font-bold text-primary-950 mb-4">Avaliações</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                {reviews.length === 0 && (
                  <div className="text-neutral-600 dark:text-neutral-400">Ainda não há avaliações.</div>
                )}
                {reviews.map(r => (
                  <div key={r.id} className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-soft">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-primary-950">{r.user_name || 'Cliente'}</div>
                      <div className="text-yellow-600">{'★'.repeat(Number(r.rating)||0)}{'☆'.repeat(5 - (Number(r.rating)||0))}</div>
                    </div>
                    {r.title && <div className="text-neutral-800 dark:text-neutral-200 mt-1">{r.title}</div>}
                    {r.comment && <div className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">{r.comment}</div>}
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <form onSubmit={submitReview} className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-soft space-y-3">
                <div className="font-semibold text-primary-950">Escreva uma avaliação</div>
                <div>
                  <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">Nota</label>
                  <select value={ratingInput} onChange={(e)=>setRatingInput(Number(e.target.value))} className="w-full px-3 py-2 border rounded">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrelas</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">Comentário</label>
                  <textarea value={commentInput} onChange={(e)=>setCommentInput(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded" placeholder="Conte sua experiência"></textarea>
                </div>
                <button disabled={reviewLoading} className="px-4 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800">Enviar</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
