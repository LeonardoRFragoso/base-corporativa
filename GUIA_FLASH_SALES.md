# 🎁 Sistema de Flash Sales - Guia Completo

## 📋 Visão Geral

Sistema completo de promoções relâmpago (Flash Sales) integrado ao Django Admin e exibido automaticamente no frontend.

## 🔧 Como Funciona

### Backend
- **Modelo**: `FlashSale` em `promotions/models.py`
- **API**: `/api/flash-sales/` e `/api/flash-sales/active/`
- **Admin**: Django Admin em `/admin/promotions/flashsale/`

### Frontend
- **Componente**: `FlashSaleBanner.jsx`
- **Posição**: Acima do Navbar (topo da página)
- **Comportamento**: Exibe automaticamente promoções ativas

## 📝 Como Criar uma Flash Sale

### 1. Acesse o Django Admin
```
http://localhost:8000/admin/promotions/flashsale/
```

### 2. Clique em "Adicionar Oferta Relâmpago"

### 3. Preencha os campos:

**Informações Básicas:**
- **Nome**: Ex: "NATAL 2024", "BLACK FRIDAY", "PÁSCOA 2025"
- **Descrição**: Texto opcional que aparece no banner
- **Banner Image**: Imagem opcional para o banner
- **Ativo**: ✅ Marque para ativar

**Desconto:**
- **Discount Percentage**: Ex: 25 (para 25% OFF)

**Período:**
- **Start Time**: Data/hora de início
- **End Time**: Data/hora de término

**Estoque (opcional):**
- **Max Quantity**: Limite de vendas (deixe vazio para ilimitado)
- **Current Sold**: Contador de vendas (atualizado automaticamente)

**Produtos:**
- Selecione os produtos que participam da promoção

### 4. Salve

O banner aparecerá automaticamente no frontend se:
- ✅ `is_active = True`
- ✅ Data/hora atual entre `start_time` e `end_time`

## 🎨 Aparência do Banner

O banner exibe:
- 🎁 **Nome da promoção** em destaque
- 📊 **Porcentagem de desconto**
- ⏰ **Contador regressivo** (dias:horas:minutos:segundos)
- ❌ **Botão fechar** (salva preferência no localStorage)

## 🔍 Endpoints da API

### Listar todas as Flash Sales ativas
```
GET /api/flash-sales/
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "NATAL 2024",
    "description": "Promoção especial de Natal",
    "discount_percentage": "25.00",
    "start_time": "2024-12-01T00:00:00Z",
    "end_time": "2024-12-25T23:59:59Z",
    "max_quantity": null,
    "current_sold": 0,
    "is_active": true,
    "banner_image": null,
    "is_live": true,
    "time_remaining": 86400
  }
]
```

### Listar apenas promoções AO VIVO
```
GET /api/flash-sales/active/
```

Retorna apenas promoções que estão acontecendo AGORA (entre start_time e end_time).

## 🧪 Como Testar

### 1. Criar uma Flash Sale de Teste

No Django Admin, crie uma promoção com:
- **Nome**: "TESTE 2024"
- **Discount Percentage**: 30
- **Start Time**: Agora (data/hora atual)
- **End Time**: Daqui a 1 hora
- **Is Active**: ✅ Marcado

### 2. Verificar no Frontend

Acesse `http://localhost:5173` e você verá o banner no topo da página.

### 3. Testar Funcionalidades

- ✅ **Contador regressivo** deve atualizar a cada segundo
- ✅ **Botão fechar** deve esconder o banner
- ✅ **localStorage** deve lembrar que você fechou o banner
- ✅ **Banner desaparece** automaticamente quando expira

### 4. Limpar localStorage (para ver o banner novamente)

No console do navegador:
```javascript
localStorage.removeItem('closedFlashSaleBanners')
```

## 🎯 Casos de Uso

### Black Friday
```
Nome: BLACK FRIDAY 2024
Desconto: 50%
Período: 24/11/2024 00:00 - 24/11/2024 23:59
```

### Natal
```
Nome: NATAL 2024
Desconto: 25%
Período: 01/12/2024 00:00 - 25/12/2024 23:59
```

### Flash Sale Relâmpago (6 horas)
```
Nome: FLASH SALE RELÂMPAGO
Desconto: 40%
Período: Hoje 18:00 - Hoje 23:59
Max Quantity: 100
```

## 🔧 Personalização

### Alterar Cores do Banner

Edite `FlashSaleBanner.jsx`:
```jsx
// Linha 88 - Alterar gradiente
className="relative bg-gradient-to-r from-red-600 via-red-500 to-orange-500"

// Exemplos:
// Black Friday: from-black via-neutral-900 to-neutral-800
// Natal: from-green-600 via-green-500 to-red-500
// Páscoa: from-purple-600 via-pink-500 to-yellow-500
```

### Alterar Posição

O banner está em `App.jsx` antes do `<Navbar />`. Para mover:
```jsx
// Antes do Navbar (atual)
<FlashSaleBanner />
<Navbar />

// Depois do Navbar
<Navbar />
<FlashSaleBanner />
```

## 🐛 Troubleshooting

### Banner não aparece

1. ✅ Verifique se a promoção está **ativa** no Admin
2. ✅ Verifique se a data/hora está **dentro do período**
3. ✅ Limpe o localStorage: `localStorage.removeItem('closedFlashSaleBanners')`
4. ✅ Verifique o console do navegador por erros
5. ✅ Teste o endpoint: `http://localhost:8000/api/flash-sales/active/`

### Contador não atualiza

1. ✅ Verifique se `end_time` está no futuro
2. ✅ Recarregue a página (F5)
3. ✅ Limpe o cache do navegador (Ctrl+Shift+R)

### Banner aparece mesmo após fechar

1. ✅ Limpe o localStorage
2. ✅ Verifique se há múltiplas promoções ativas
3. ✅ Cada promoção tem um ID único no localStorage

## 📊 Monitoramento

### Ver vendas da Flash Sale

No Django Admin, a coluna "Vendas" mostra:
- Quantidade vendida / Limite
- Porcentagem de progresso
- Status (AO VIVO, AGENDADO, FINALIZADO)

### Estatísticas

O campo `current_sold` é incrementado automaticamente quando:
- Um pedido é criado com produtos da Flash Sale
- (Implementação futura: integrar com sistema de pedidos)

## 🚀 Próximos Passos

- [ ] Integrar contador de vendas com sistema de pedidos
- [ ] Adicionar notificações push quando Flash Sale começa
- [ ] Criar página dedicada para Flash Sales
- [ ] Adicionar cupons automáticos para Flash Sales
- [ ] Analytics de conversão por Flash Sale

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Logs do Django: `python manage.py runserver`
2. Console do navegador (F12)
3. Endpoint da API: `/api/flash-sales/active/`
