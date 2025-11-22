# ⚡ GUIA DE ATIVAÇÃO RÁPIDA - 30 MINUTOS

## 🎯 OBJETIVO
Ativar as melhorias mais críticas em 30 minutos para impacto imediato nas vendas.

---

## ✅ PASSO 1: CORRIGIR SEO (JÁ FEITO)
**Tempo:** ✅ Concluído
**Arquivo:** `frontend/src/components/SEO.jsx`
**Status:** URL corrigida para basecorporativa.store

---

## ⚡ PASSO 2: ATIVAR GOOGLE ANALYTICS (5 MIN)

### 2.1. Criar Propriedade no Google Analytics
1. Acesse [Google Analytics](https://analytics.google.com/)
2. Crie uma propriedade GA4
3. Copie o ID de medição (formato: G-XXXXXXXXXX)

### 2.2. Atualizar o código
Edite: `frontend/index.html`

Procure por `G-XXXXXXXXXX` (aparece 2x) e substitua pelo seu ID real.

```html
<!-- ANTES -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<!-- DEPOIS (exemplo) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC1234567"></script>
```

**Testar:**
```bash
# Rebuild do frontend
cd frontend
npm run build

# Verificar no navegador:
# 1. Abra o site
# 2. F12 → Console
# 3. Digite: gtag
# Deve aparecer: function gtag()...
```

---

## ⚡ PASSO 3: ATIVAR META PIXEL (3 MIN)

### 3.1. Obter Pixel ID
1. Acesse [Meta Business Suite](https://business.facebook.com/)
2. Configurações de Eventos → Pixels
3. Copie o ID do Pixel

### 3.2. Atualizar o código
Edite: `frontend/index.html`

Procure por `YOUR_PIXEL_ID` (aparece 2x) e substitua.

---

## ⚡ PASSO 4: ATIVAR RESERVA DE ESTOQUE (10 MIN)

### 4.1. Migrar banco de dados
```bash
cd backend

# Criar migrations
python manage.py makemigrations

# Aplicar
python manage.py migrate
```

### 4.2. Adicionar URLs
Edite: `backend/cart/urls.py`

Se o arquivo não existir, crie:
```python
from django.urls import path
from . import views_reservation

urlpatterns = [
    path('reservation/', views_reservation.create_stock_reservation),
    path('reservation/<int:reservation_id>/extend/', views_reservation.extend_stock_reservation),
    path('reservation/<int:reservation_id>/', views_reservation.cancel_stock_reservation),
    path('check-availability/', views_reservation.check_availability),
    path('my-reservations/', views_reservation.get_user_reservations),
]
```

Adicione ao `backend/core/urls.py`:
```python
path('api/cart/', include('cart.urls')),
```

### 4.3. Testar
```bash
# Teste rápido via curl
curl -X POST http://localhost:8000/api/cart/check-availability/?variant_id=1&quantity=2
```

---

## ⚡ PASSO 5: ATIVAR E-MAILS DE CARRINHO (7 MIN)

### 5.1. Configurar SMTP
Edite: `backend/.env`

Adicione (ou atualize):
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_HOST_USER=noreply@basecorporativa.store
EMAIL_HOST_PASSWORD=SUA_SENHA_AQUI
DEFAULT_FROM_EMAIL=BASE CORPORATIVA <noreply@basecorporativa.store>
```

### 5.2. Testar (Dry Run)
```bash
cd backend
python manage.py send_abandoned_cart_emails --dry-run
```

Se funcionar, verá:
```
[DRY RUN] E-mail seria enviado para carrinho X
Total de e-mails simulados: Y
```

### 5.3. Agendar execução automática
**Railway (Produção):**
1. Dashboard Railway → seu app → Cron Jobs
2. Adicionar job:
```
*/30 * * * * python manage.py send_abandoned_cart_emails
```

**Desenvolvimento local (apenas teste):**
Execute manualmente quando necessário.

---

## ⚡ PASSO 6: ATIVAR BUSCA AVANÇADA (5 MIN)

### 6.1. Adicionar URLs
Edite: `backend/catalog/urls.py`

Adicione no topo:
```python
from . import views_search
```

Adicione nas urlpatterns:
```python
urlpatterns = [
    # ... urls existentes
    path('advanced-search/', views_search.advanced_search),
    path('autocomplete/', views_search.autocomplete_search),
    path('filter-options/', views_search.get_filter_options),
    path('trending-searches/', views_search.trending_searches),
    path('log-search/', views_search.log_search),
]
```

### 6.2. Adicionar componente ao Navbar
Edite: `frontend/src/components/Navbar.jsx`

Adicione no topo:
```jsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import AdvancedSearch from './AdvancedSearch.jsx';
```

Dentro do componente:
```jsx
const [showSearch, setShowSearch] = useState(false);

// No JSX, adicione botão de busca:
<button 
  onClick={() => setShowSearch(true)}
  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
  aria-label="Buscar"
>
  <Search className="w-5 h-5" />
</button>

// Antes do </div> final, adicione:
{showSearch && <AdvancedSearch onClose={() => setShowSearch(false)} />}
```

---

## ✅ VERIFICAÇÃO FINAL (2 MIN)

### Checklist Rápido
```bash
# 1. Frontend - Rebuild
cd frontend
npm run build

# 2. Backend - Restart
# Se local:
python manage.py runserver

# Se Railway:
git add .
git commit -m "feat: implementar melhorias críticas"
git push origin main
```

### Testes Essenciais
1. ✅ Abrir o site → F12 → Console → Ver `gtag` e `fbq` funcionando
2. ✅ Buscar um produto → Ver autocomplete
3. ✅ Adicionar ao carrinho → Ver tracking no console
4. ✅ Verificar e-mail de teste (dry-run do abandoned cart)

---

## 📊 MONITORAMENTO (DIA 1)

### No Google Analytics (24h depois)
1. Tempo Real → Ver usuários ativos ✅
2. Aquisição → Ver fontes de tráfego ✅
3. Engajamento → Ver páginas mais vistas ✅
4. Monetização → Ver transações (se houver vendas) ✅

### No Meta Events Manager (24h depois)
1. Visão Geral → Ver eventos do pixel ✅
2. PageView, ViewContent, AddToCart ✅

---

## 🚨 TROUBLESHOOTING

### Analytics não aparece
```javascript
// Abra Console (F12) e digite:
console.log(typeof gtag); // Deve retornar "function"
console.log(typeof fbq);  // Deve retornar "function"
```

Se retornar "undefined":
- Verificar se os IDs estão corretos
- Verificar se o build do frontend foi feito
- Limpar cache do navegador (Ctrl+Shift+R)

### E-mails não enviam
```bash
# Testar conexão SMTP
python manage.py shell

from django.core.mail import send_mail
send_mail(
    'Teste',
    'Mensagem teste',
    'noreply@basecorporativa.store',
    ['seu_email@gmail.com'],
    fail_silently=False,
)
```

Se der erro:
- Verificar credenciais SMTP no .env
- Verificar se porta 465 não está bloqueada
- Tentar porta 587 com TLS

### Busca não funciona
```bash
# Testar endpoint
curl http://localhost:8000/api/catalog/filter-options/

# Deve retornar JSON com categorias, preços, etc.
```

---

## 📈 PRÓXIMOS 7 DIAS

### Dia 2-3: Conteúdo
- [ ] Criar primeiro post no blog (800-1200 palavras)
- [ ] Otimizar descrições de produtos (adicionar keywords)
- [ ] Configurar Google Search Console

### Dia 4-5: Otimização
- [ ] Analisar dados do GA4
- [ ] Ajustar filtros baseado em uso real
- [ ] Testar velocidade com PageSpeed Insights

### Dia 6-7: Marketing
- [ ] Criar campanha no Meta Ads (retargeting)
- [ ] Configurar Google Shopping Feed
- [ ] Otimizar e-mails de carrinho abandonado

---

## 💰 IMPACTO ESPERADO (30 DIAS)

| Métrica | Antes | Meta | ROI |
|---------|-------|------|-----|
| Tráfego Orgânico | Baseline | +20% | Blog + SEO |
| Conversão | 1-2% | 2.5-3% | +40% |
| Carrinho Recuperado | 0% | 12-15% | +R$ 2-5k |
| Ticket Médio | Baseline | +15% | Upsell |

**Receita adicional estimada:** +R$ 8-15k/mês

---

## ✅ CONCLUSÃO

Se você seguiu todos os passos, agora tem:
- ✅ Analytics profissional instalado
- ✅ Reserva de estoque funcionando
- ✅ E-mails de carrinho abandonado
- ✅ Busca avançada com filtros
- ✅ Prova social implementada
- ✅ SEO corrigido

**Próximo milestone:** 7 dias
**Revisão:** Analisar métricas e ajustar

---

**Tempo total:** ~30 minutos
**Dificuldade:** ⭐⭐☆☆☆ (Média)
**Impacto:** ⭐⭐⭐⭐⭐ (Altíssimo)

Boa sorte! 🚀
