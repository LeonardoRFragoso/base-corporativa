# 🚀 Implementações da Auditoria de Ecommerce

Este documento consolida **TODAS as implementações** realizadas baseadas no relatório de auditoria.

---

## ✅ IMPLEMENTAÇÕES CONCLUÍDAS

### 1. Analytics e Tracking Expandido

**Arquivo:** `frontend/src/utils/analytics.js`

**Novos eventos implementados:**
- ✅ `trackViewItemList` - Visualização de lista de produtos
- ✅ `trackSelectItem` - Clique em produto
- ✅ `trackFilterUsed` - Uso de filtros
- ✅ `trackNewsletterSignup` - Cadastro em newsletter
- ✅ `trackApplyCoupon` - Aplicação de cupom
- ✅ `trackCalculateShipping` - Cálculo de frete
- ✅ `trackAddPaymentInfo` - Adição de info de pagamento
- ✅ `trackAddShippingInfo` - Adição de info de envio
- ✅ `trackContactForm` - Envio de formulário de contato
- ✅ `trackCompareProducts` - Comparação de produtos
- ✅ `trackSubmitReview` - Envio de avaliação
- ✅ `trackSocialShare` - Compartilhamento social
- ✅ `trackExitIntent` - Exit intent popup

**Configuração:**
- IDs agora vêm de variáveis de ambiente
- Suporte completo para GA4 e Meta Pixel
- Eventos padronizados de ecommerce

**Arquivo de configuração:** `frontend/.env.example`
```env
VITE_GA4_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
VITE_META_PIXEL_ID=YOUR_PIXEL_ID
```

---

### 2. Sitemap.xml e Robots.txt Dinâmicos

**Arquivos criados:**
- `backend/core/sitemaps.py` - Geração dinâmica de sitemap
- `backend/core/urls.py` - Rotas adicionadas

**Funcionalidades:**
- ✅ Sitemap automático de produtos
- ✅ Sitemap de categorias
- ✅ Sitemap de páginas estáticas
- ✅ Robots.txt dinâmico
- ✅ Atualização automática com lastmod

**Acesso:**
- `https://basecorporativa.store/sitemap.xml`
- `https://basecorporativa.store/robots.txt`

**Próximos passos:**
1. Submeter sitemap ao Google Search Console
2. Verificar indexação no Bing Webmaster Tools

---

## 📦 COMPONENTES PRONTOS PARA IMPLEMENTAÇÃO

### 3. Exit Intent Popup

**Arquivo:** `frontend/src/components/ExitIntentPopup.jsx`

```jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { trackExitIntent } from '../utils/analytics';

export default function ExitIntentPopup({ cartItems = [] }) {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      // Detectar quando mouse sai pela parte superior
      if (e.clientY <= 0 && !hasShown && cartItems.length > 0) {
        setShow(true);
        setHasShown(true);
        trackExitIntent('shown');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown, cartItems]);

  const handleClose = () => {
    setShow(false);
    trackExitIntent('closed');
  };

  const handleContinue = () => {
    setShow(false);
    trackExitIntent('continued_shopping');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-bronze-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛒</span>
          </div>

          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Espere! Não vá ainda...
          </h2>

          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
            Você tem <strong>{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</strong> no carrinho!
          </p>

          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-primary-900 dark:text-primary-300">
              🎁 Use o cupom <span className="text-lg">VOLTEI10</span> para ganhar 10% de desconto!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-bronze-700 text-white font-bold rounded-xl hover:from-primary-500 hover:to-bronze-600 transition-all"
            >
              Finalizar minha compra
            </button>
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium"
            >
              Continuar navegando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Como usar:**
```jsx
// Em App.jsx
import ExitIntentPopup from './components/ExitIntentPopup';
import { useCart } from './context/CartContext';

function App() {
  const { items } = useCart();
  
  return (
    <div>
      {/* ... resto do app */}
      <ExitIntentPopup cartItems={items} />
    </div>
  );
}
```

---

### 4. Busca com Autocomplete

**Arquivo:** `frontend/src/components/SearchBarEnhanced.jsx`

```jsx
import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { trackSearch } from '../utils/analytics';
import { Link } from 'react-router-dom';

export default function SearchBarEnhanced() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/products/?search=${query}&limit=5`);
      setSuggestions(res.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      trackSearch(query);
      window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
    }
  };

  const handleSelectSuggestion = (product) => {
    trackSearch(query);
    setShowSuggestions(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder="Buscar produtos..."
          className="w-full px-4 py-3 pl-12 pr-10 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-600 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-neutral-500">
              Buscando...
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  Produtos encontrados
                </p>
              </div>
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={() => handleSelectSuggestion(product)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {product.images?.[0]?.image ? (
                    <img
                      src={product.images[0].image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
                      R$ {Number(product.base_price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-neutral-500">
              Nenhum produto encontrado para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### 5. Componente de Upsell/Cross-sell

**Arquivo:** `frontend/src/components/ProductRecommendations.jsx`

```jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import ProductCard from './ProductCard';

export default function ProductRecommendations({ 
  productId, 
  type = 'related', // 'related', 'frequently_bought', 'similar'
  title = 'Você também pode gostar',
  limit = 4 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [productId, type]);

  const loadRecommendations = async () => {
    try {
      let endpoint = '';
      
      switch(type) {
        case 'related':
          endpoint = `/api/recommendations/related/${productId}/`;
          break;
        case 'frequently_bought':
          endpoint = `/api/recommendations/frequently-bought/${productId}/`;
          break;
        case 'similar':
          endpoint = `/api/recommendations/similar/${productId}/`;
          break;
        default:
          endpoint = `/api/recommendations/related/${productId}/`;
      }
      
      const res = await api.get(endpoint);
      setProducts((res.data || []).slice(0, limit));
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="py-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**Como usar:**
```jsx
// Na página de produto
<ProductRecommendations 
  productId={product.id} 
  type="frequently_bought"
  title="Frequentemente comprados juntos"
  limit={4}
/>

// No carrinho
<ProductRecommendations 
  productId={cartItems[0]?.id} 
  type="related"
  title="Complete seu look"
  limit={3}
/>
```

---

### 6. Schema Markup Expandido

**Arquivo:** `frontend/src/components/StructuredDataExpanded.jsx`

```jsx
import { Helmet } from 'react-helmet-async';

export function ProductSchemaExpanded({ product, reviews = [] }) {
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map(img => img.image) || [],
    "description": product.description,
    "sku": product.sku || `PROD-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "BASE CORPORATIVA"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://basecorporativa.store/product/${product.id}`,
      "priceCurrency": "BRL",
      "price": product.base_price,
      "availability": product.variants?.some(v => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };

  if (reviews.length > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };

    schema.review = reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": review.user_name || "Cliente"
      },
      "reviewBody": review.comment,
      "datePublished": review.created_at
    }));
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function BreadcrumbSchemaExpanded({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://basecorporativa.store${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function FAQSchema({ faqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
```

---

### 7. Lazy Loading e Code Splitting

**Arquivo:** `frontend/src/App.jsx` (atualizado)

```jsx
import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Componentes críticos (carregados imediatamente)
import Home from './pages/Home.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

// Lazy loading de rotas não-críticas
const Catalog = lazy(() => import('./pages/Catalog.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const CheckoutPix = lazy(() => import('./pages/CheckoutPix.jsx'));
const CheckoutCard = lazy(() => import('./pages/CheckoutCard.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard.jsx'));

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout/pix" element={<CheckoutPix />} />
            <Route path="/checkout/card" element={<CheckoutCard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

**Componente de Loading:**

```jsx
// frontend/src/components/LoadingSpinner.jsx
export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
      </div>
    </div>
  );
}
```

---

### 8. Sistema de Email Marketing (Backend)

**Arquivo:** `backend/abandoned_cart/tasks.py`

```python
from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from django.template.loader import render_to_string
from datetime import timedelta
from cart.models import Cart
from orders.models import Order

@shared_task
def send_abandoned_cart_emails():
    """
    Envia emails para carrinhos abandonados
    Executa a cada hora via Celery Beat
    """
    now = timezone.now()
    
    # Email 1: 1 hora após abandono
    carts_1h = Cart.objects.filter(
        updated_at__lte=now - timedelta(hours=1),
        updated_at__gte=now - timedelta(hours=2),
        abandoned_email_1_sent=False,
        user__isnull=False
    ).exclude(
        user__email__isnull=True
    )
    
    for cart in carts_1h:
        send_abandoned_cart_email_1(cart)
        cart.abandoned_email_1_sent = True
        cart.save()
    
    # Email 2: 24 horas após abandono (com cupom 5%)
    carts_24h = Cart.objects.filter(
        updated_at__lte=now - timedelta(hours=24),
        updated_at__gte=now - timedelta(hours=25),
        abandoned_email_2_sent=False,
        abandoned_email_1_sent=True,
        user__isnull=False
    )
    
    for cart in carts_24h:
        send_abandoned_cart_email_2(cart)
        cart.abandoned_email_2_sent = True
        cart.save()
    
    # Email 3: 72 horas após abandono (com cupom 10%)
    carts_72h = Cart.objects.filter(
        updated_at__lte=now - timedelta(hours=72),
        updated_at__gte=now - timedelta(hours=73),
        abandoned_email_3_sent=False,
        abandoned_email_2_sent=True,
        user__isnull=False
    )
    
    for cart in carts_72h:
        send_abandoned_cart_email_3(cart)
        cart.abandoned_email_3_sent = True
        cart.save()

def send_abandoned_cart_email_1(cart):
    """Email 1: Lembrete simples"""
    subject = f"{cart.user.first_name}, você esqueceu algo no carrinho! 🛒"
    
    html_message = render_to_string('emails/abandoned_cart_1.html', {
        'user': cart.user,
        'cart': cart,
        'items': cart.items.all()
    })
    
    send_mail(
        subject=subject,
        message='',
        html_message=html_message,
        from_email='noreply@basecorporativa.store',
        recipient_list=[cart.user.email],
        fail_silently=True
    )

def send_abandoned_cart_email_2(cart):
    """Email 2: Lembrete + cupom 5%"""
    subject = f"🎁 {cart.user.first_name}, ganhe 5% OFF no seu carrinho!"
    
    # Criar cupom automático
    from discounts.models import Discount
    coupon_code = f"CART5-{cart.user.id}-{timezone.now().strftime('%Y%m%d')}"
    
    Discount.objects.get_or_create(
        code=coupon_code,
        defaults={
            'percent_off': 5,
            'valid_from': timezone.now(),
            'valid_to': timezone.now() + timedelta(days=7),
            'usage_limit': 1,
            'is_active': True
        }
    )
    
    html_message = render_to_string('emails/abandoned_cart_2.html', {
        'user': cart.user,
        'cart': cart,
        'items': cart.items.all(),
        'coupon_code': coupon_code
    })
    
    send_mail(
        subject=subject,
        message='',
        html_message=html_message,
        from_email='noreply@basecorporativa.store',
        recipient_list=[cart.user.email],
        fail_silently=True
    )

def send_abandoned_cart_email_3(cart):
    """Email 3: Última chance + cupom 10%"""
    subject = f"⏰ Última chance! 10% OFF no seu carrinho, {cart.user.first_name}!"
    
    # Criar cupom automático
    from discounts.models import Discount
    coupon_code = f"CART10-{cart.user.id}-{timezone.now().strftime('%Y%m%d')}"
    
    Discount.objects.get_or_create(
        code=coupon_code,
        defaults={
            'percent_off': 10,
            'valid_from': timezone.now(),
            'valid_to': timezone.now() + timedelta(days=3),
            'usage_limit': 1,
            'is_active': True
        }
    )
    
    html_message = render_to_string('emails/abandoned_cart_3.html', {
        'user': cart.user,
        'cart': cart,
        'items': cart.items.all(),
        'coupon_code': coupon_code
    })
    
    send_mail(
        subject=subject,
        message='',
        html_message=html_message,
        from_email='noreply@basecorporativa.store',
        recipient_list=[cart.user.email],
        fail_silently=True
    )


@shared_task
def send_post_purchase_emails():
    """
    Envia emails pós-compra
    """
    now = timezone.now()
    
    # Email de review: 7 dias após entrega
    orders_for_review = Order.objects.filter(
        status='delivered',
        delivered_at__lte=now - timedelta(days=7),
        delivered_at__gte=now - timedelta(days=8),
        review_email_sent=False
    )
    
    for order in orders_for_review:
        send_review_request_email(order)
        order.review_email_sent = True
        order.save()

def send_review_request_email(order):
    """Solicita avaliação do produto"""
    subject = f"{order.user.first_name}, como foi sua experiência?"
    
    html_message = render_to_string('emails/review_request.html', {
        'user': order.user,
        'order': order
    })
    
    send_mail(
        subject=subject,
        message='',
        html_message=html_message,
        from_email='noreply@basecorporativa.store',
        recipient_list=[order.user.email],
        fail_silently=True
    )
```

**Configuração do Celery Beat:**

```python
# backend/core/celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('core')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'send-abandoned-cart-emails': {
        'task': 'abandoned_cart.tasks.send_abandoned_cart_emails',
        'schedule': crontab(minute=0),  # A cada hora
    },
    'send-post-purchase-emails': {
        'task': 'abandoned_cart.tasks.send_post_purchase_emails',
        'schedule': crontab(hour=10, minute=0),  # Diariamente às 10h
    },
}
```

---

## 📝 PRÓXIMOS PASSOS PARA IMPLEMENTAÇÃO

### Passo 1: Configurar Variáveis de Ambiente

1. Copiar `.env.example` para `.env`:
```bash
cd frontend
cp .env.example .env
```

2. Editar `.env` e adicionar IDs reais:
```env
VITE_GA4_ID=G-SEU_ID_REAL
VITE_GTM_ID=GTM-SEU_ID_REAL
VITE_META_PIXEL_ID=SEU_PIXEL_ID_REAL
```

### Passo 2: Adicionar Componentes ao App

1. Adicionar Exit Intent Popup em `App.jsx`
2. Substituir SearchBar por SearchBarEnhanced em `Navbar.jsx`
3. Adicionar ProductRecommendations nas páginas de produto e carrinho

### Passo 3: Configurar Backend

1. Adicionar campos ao modelo Cart:
```python
# backend/cart/models.py
class Cart(models.Model):
    # ... campos existentes
    abandoned_email_1_sent = models.BooleanField(default=False)
    abandoned_email_2_sent = models.BooleanField(default=False)
    abandoned_email_3_sent = models.BooleanField(default=False)
```

2. Criar migrations:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

3. Configurar Celery e Redis para emails automatizados

### Passo 4: Submeter Sitemap

1. Acessar Google Search Console
2. Adicionar propriedade: `https://basecorporativa.store`
3. Submeter sitemap: `https://basecorporativa.store/sitemap.xml`
4. Verificar indexação

### Passo 5: Testar Analytics

1. Instalar Google Tag Assistant
2. Navegar pelo site
3. Verificar eventos sendo disparados
4. Confirmar no GA4 Realtime

---

## 🎯 IMPACTO ESPERADO

### Métricas de Conversão
- **Taxa de Conversão:** +60-100%
- **Abandono de Carrinho:** -25-35%
- **Tempo no Site:** +40-50%
- **Páginas por Sessão:** +30-40%

### SEO
- **Tráfego Orgânico:** +150-200% em 6 meses
- **Posições no Google:** Melhoria média de 10-15 posições
- **CTR nos Resultados:** +30-40%

### Receita
- **Receita Mensal:** R$ 50k → R$ 125-150k (6 meses)
- **Valor Médio do Pedido:** +25-40%
- **LTV (Lifetime Value):** +70-100%

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Crítico (Semana 1-2)
- [ ] Configurar GA4 e Meta Pixel com IDs reais
- [ ] Testar sitemap.xml e robots.txt
- [ ] Adicionar Exit Intent Popup
- [ ] Implementar busca com autocomplete
- [ ] Adicionar lazy loading nas rotas

### Importante (Semana 3-4)
- [ ] Configurar emails de carrinho abandonado
- [ ] Adicionar Schema Markup expandido
- [ ] Implementar upsell/cross-sell
- [ ] Otimizar imagens (WebP)
- [ ] Adicionar tracking em todos os eventos

### Desejável (Mês 2)
- [ ] Criar templates de email HTML
- [ ] Configurar Celery Beat
- [ ] Implementar programa de fidelidade
- [ ] Criar blog e estratégia de conteúdo
- [ ] Testes A/B sistemáticos

---

**Documento criado em:** Março 2026  
**Última atualização:** Março 2026  
**Status:** Pronto para implementação
