# 💡 EXEMPLOS PRÁTICOS DE USO

## 📸 1. IMAGENS OTIMIZADAS

### Exemplo 1: Product Card
```jsx
import OptimizedImage from '../components/OptimizedImage.jsx';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <OptimizedImage
        src={product.image}
        alt={product.name}
        width={300}
        height={400}
        priority={false}
        objectFit="cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <h3>{product.name}</h3>
      <p>R$ {product.price}</p>
    </div>
  );
}
```

### Exemplo 2: Hero Banner (Priority Loading)
```jsx
<OptimizedImage
  src="/hero-banner.jpg"
  alt="Roupas Corporativas Premium"
  width={1920}
  height={800}
  priority={true} // Carrega imediatamente
  objectFit="cover"
/>
```

---

## 🔥 2. PROVA SOCIAL E URGÊNCIA

### Exemplo Completo: Página de Produto
```jsx
import { 
  LiveViewers, 
  RecentSales, 
  LowStockBadge, 
  TrendingBadge,
  CountdownTimer,
  TrustBadges,
  ReviewsSummary 
} from '../components/SocialProof.jsx';

function ProductPage({ product, variant }) {
  return (
    <div className="product-page">
      {/* Badges no topo */}
      <div className="flex gap-3 mb-4">
        <TrendingBadge isTrending={product.is_popular} />
        <LiveViewers productId={product.id} initialCount={8} />
      </div>

      {/* Imagem e detalhes */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <OptimizedImage src={product.image} alt={product.name} />
        </div>
        
        <div>
          <h1>{product.name}</h1>
          <ReviewsSummary 
            rating={product.average_rating} 
            totalReviews={product.review_count} 
          />
          
          <div className="my-6">
            <RecentSales count={product.sales_24h} timeframe="24h" />
            <LowStockBadge stock={variant.stock} threshold={5} />
          </div>

          {/* Oferta com timer */}
          {product.has_promotion && (
            <CountdownTimer 
              endDate={product.promotion_end_date}
              label="Promoção termina em"
            />
          )}

          <button className="add-to-cart-btn">
            Adicionar ao Carrinho
          </button>

          {/* Selos de confiança */}
          <TrustBadges />
        </div>
      </div>
    </div>
  );
}
```

### Exemplo: Apenas Urgência Simples
```jsx
function QuickProductView({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      {product.stock < 5 && (
        <LowStockBadge stock={product.stock} />
      )}
    </div>
  );
}
```

---

## 🔍 3. BUSCA AVANÇADA

### Exemplo: Adicionar ao Navbar
```jsx
// Navbar.jsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import AdvancedSearch from './AdvancedSearch.jsx';

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <nav>
      {/* ... outros itens do menu */}
      
      {/* Botão de busca */}
      <button 
        onClick={() => setShowSearch(true)}
        className="btn-search"
      >
        <Search className="w-5 h-5" />
        <span>Buscar</span>
      </button>

      {/* Modal de busca */}
      {showSearch && (
        <AdvancedSearch onClose={() => setShowSearch(false)} />
      )}
    </nav>
  );
}
```

### Exemplo: Busca Inline (Alternativa)
```jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

function InlineSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length < 2) return;

    const timer = setTimeout(async () => {
      const res = await api.get('/api/catalog/autocomplete/', {
        params: { q: query }
      });
      setSuggestions(res.data.suggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar produtos..."
      />
      
      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map(s => (
            <a key={s.id} href={`/product/${s.id}`}>
              {s.name} - R$ {s.price}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 4. FILTROS DE CATÁLOGO

### Exemplo: Página de Catálogo Completa
```jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import ProductFilters from '../components/ProductFilters.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    min_price: '',
    max_price: '',
    size: [],
    color: [],
    in_stock: false,
    sort_by: 'newest'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  async function loadProducts() {
    setLoading(true);
    try {
      // Construir query params
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.size.length) params.append('size', filters.size.join(','));
      if (filters.color.length) params.append('color', filters.color.join(','));
      if (filters.in_stock) params.append('in_stock', 'true');
      params.append('sort_by', filters.sort_by);

      const res = await api.get(`/api/catalog/advanced-search/?${params}`);
      setProducts(res.data.results);
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  function clearFilters() {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      size: [],
      color: [],
      in_stock: false,
      sort_by: 'newest'
    });
  }

  return (
    <div className="catalog-page">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de filtros */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={clearFilters}
            />
          </div>

          {/* Grid de produtos */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Catálogo</h1>
              <p className="text-neutral-600">
                {products.length} produtos encontrados
              </p>
            </div>

            {loading ? (
              <div>Carregando...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 5. TRACKING DE EVENTOS

### Exemplo: Página de Produto com Tracking
```jsx
import { useEffect } from 'react';
import { trackViewItem, trackAddToCart } from '../utils/analytics';

export default function Product({ product }) {
  // Track visualização ao carregar
  useEffect(() => {
    if (product) {
      trackViewItem(product);
    }
  }, [product]);

  function handleAddToCart() {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    };

    // Adicionar ao carrinho (sua lógica)
    addToCart(cartItem);

    // Track evento
    trackAddToCart(cartItem);
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>
        Adicionar ao Carrinho
      </button>
    </div>
  );
}
```

### Exemplo: Checkout com Tracking
```jsx
import { trackBeginCheckout, trackPurchase } from '../utils/analytics';

function Checkout({ items, total }) {
  function handleStartCheckout() {
    // Track início do checkout
    trackBeginCheckout(items, total);
    
    // Sua lógica de checkout
    proceedToPayment();
  }

  function handlePurchaseComplete(orderId) {
    // Track compra concluída
    trackPurchase(orderId, total, items);
    
    // Redirecionar para sucesso
    navigate('/checkout/success');
  }

  return (
    <div>
      <button onClick={handleStartCheckout}>
        Finalizar Compra
      </button>
    </div>
  );
}
```

### Exemplo: Busca com Tracking
```jsx
import { trackSearch } from '../utils/analytics';

function SearchBar() {
  function handleSearch(query) {
    // Track busca
    trackSearch(query);
    
    // Executar busca
    navigate(`/catalog?q=${query}`);
  }

  return (
    <input 
      type="text"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSearch(e.target.value);
        }
      }}
    />
  );
}
```

---

## 🛒 6. RESERVA DE ESTOQUE

### Exemplo: Adicionar ao Carrinho com Reserva
```jsx
import { api } from '../lib/api';

async function addToCartWithReservation(product, variant, quantity) {
  try {
    // 1. Criar reserva de estoque
    const reservationRes = await api.post('/api/cart/reservation/', {
      variant_id: variant.id,
      quantity: quantity,
      session_key: getSessionKey() // Função para obter session
    });

    console.log('Estoque reservado por 15 minutos:', reservationRes.data);

    // 2. Adicionar ao carrinho local
    addToLocalCart({
      id: product.id,
      variantId: variant.id,
      name: product.name,
      price: variant.price,
      qty: quantity,
      reservationId: reservationRes.data.reservation_id
    });

    // 3. Mostrar feedback
    toast.success(`${product.name} adicionado ao carrinho!`);
    
  } catch (error) {
    if (error.response?.status === 400) {
      // Estoque insuficiente
      const available = error.response.data.available || 0;
      toast.error(`Apenas ${available} unidades disponíveis`);
    } else {
      toast.error('Erro ao adicionar ao carrinho');
    }
  }
}
```

### Exemplo: Verificar Disponibilidade Antes
```jsx
async function checkAndAddToCart(variantId, quantity) {
  // Verificar disponibilidade primeiro
  const checkRes = await api.get('/api/cart/check-availability/', {
    params: { variant_id: variantId, quantity }
  });

  if (!checkRes.data.is_available) {
    alert(`Apenas ${checkRes.data.available} em estoque`);
    return;
  }

  // Prosseguir com adição
  await addToCartWithReservation(product, variant, quantity);
}
```

---

## 💌 7. E-MAILS DE CARRINHO ABANDONADO

### Criar Carrinho Abandonado (Backend)
```python
# No seu view de checkout ou carrinho
from abandoned_cart.models import AbandonedCart

def save_abandoned_cart(request):
    cart_items = get_cart_items(request)
    
    if not cart_items:
        return
    
    # Criar ou atualizar carrinho abandonado
    abandoned_cart, created = AbandonedCart.objects.get_or_create(
        session_key=request.session.session_key,
        defaults={
            'user': request.user if request.user.is_authenticated else None,
            'email': request.user.email if request.user.is_authenticated else '',
        }
    )
    
    # Atualizar itens
    abandoned_cart.items = cart_items
    abandoned_cart.save()
```

### Teste Manual de E-mail
```bash
# Criar um carrinho de teste no Django Admin
# Depois executar:

cd backend
python manage.py send_abandoned_cart_emails --dry-run

# Ver output:
# [DRY RUN] E-mail seria enviado para carrinho 1 (sequência 1)
# [DRY RUN] E-mail seria enviado para carrinho 2 (sequência 2)
```

---

## 📝 8. BLOG PARA SEO

### Criar Post via Django Admin
1. Acessar `/admin/blog/blogpost/add/`
2. Preencher:
   - **Título:** "10 Dicas de Estilo Corporativo Masculino"
   - **Slug:** Auto-gerado
   - **Categoria:** Criar "Dicas de Estilo"
   - **Conteúdo:** Texto em HTML/Markdown
   - **Meta Description:** "Descubra as melhores dicas para se vestir bem no ambiente corporativo. Guia completo com fotos e exemplos práticos."
   - **Keywords:** "estilo corporativo masculino, dicas de roupa, como se vestir trabalho"
   - **Status:** Publicado

### Exibir Posts no Frontend
```jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function BlogList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPosts() {
      const res = await api.get('/api/blog/posts/');
      setPosts(res.data.results);
    }
    loadPosts();
  }, []);

  return (
    <div className="blog-grid">
      {posts.map(post => (
        <article key={post.id} className="blog-card">
          <img src={post.featured_image} alt={post.title} />
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <a href={`/blog/${post.slug}`}>Ler mais →</a>
        </article>
      ))}
    </div>
  );
}
```

---

## 🎨 9. UPSELL E CROSS-SELL

### Exemplo: "Complete o Look"
```jsx
function CompleteTheLook({ product }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadRecommendations() {
      const res = await api.get(`/api/products/${product.id}/recommendations/`);
      setRecommendations(res.data);
    }
    loadRecommendations();
  }, [product.id]);

  if (recommendations.length === 0) return null;

  return (
    <section className="my-12">
      <h3 className="text-2xl font-bold mb-6">Complete o Look</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map(item => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
```

### Exemplo: "Frequentemente Comprados Juntos"
```jsx
function FrequentlyBoughtTogether({ product }) {
  const [bundle, setBundle] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Buscar produtos frequentemente comprados juntos
    async function loadBundle() {
      const res = await api.get(`/api/products/${product.id}/frequently-bought/`);
      setBundle(res.data);
      
      const total = res.data.reduce((sum, p) => sum + parseFloat(p.price), 0);
      setTotalPrice(total);
    }
    loadBundle();
  }, [product.id]);

  async function addBundleToCart() {
    // Adicionar todos os itens do bundle
    for (const item of bundle) {
      await addToCart(item);
    }
    toast.success('Bundle adicionado ao carrinho!');
  }

  if (bundle.length === 0) return null;

  return (
    <div className="bundle-card">
      <h3>Frequentemente Comprados Juntos</h3>
      <div className="flex items-center gap-4">
        {bundle.map((item, index) => (
          <>
            <div key={item.id} className="bundle-item">
              <img src={item.image} alt={item.name} />
              <p>{item.name}</p>
              <span>R$ {item.price}</span>
            </div>
            {index < bundle.length - 1 && <span>+</span>}
          </>
        ))}
      </div>
      <div className="bundle-footer">
        <div>
          <span>Preço Total:</span>
          <strong>R$ {totalPrice.toFixed(2)}</strong>
        </div>
        <button onClick={addBundleToCart}>
          Adicionar Todos ao Carrinho
        </button>
      </div>
    </div>
  );
}
```

---

## 🚀 DICAS FINAIS

### Performance
- Use `<OptimizedImage>` em TODAS as imagens de produto
- Lazy load componentes pesados:
  ```jsx
  const HeavyComponent = lazy(() => import('./HeavyComponent'));
  ```

### SEO
- Sempre preencha `alt` em imagens
- Use `<SEO>` component em todas as páginas
- Adicione `keywords` long-tail específicas

### UX
- Combine prova social (`<LiveViewers>`) com urgência (`<LowStockBadge>`)
- Sempre mostre `<TrustBadges>` no checkout
- Use `<CountdownTimer>` apenas em promoções reais

### Analytics
- Track TODOS os eventos importantes
- Revise dados semanalmente
- A/B test CTAs e layouts

---

**Esses exemplos são plug-and-play!** 🎯
Copie, cole e adapte para suas necessidades.
