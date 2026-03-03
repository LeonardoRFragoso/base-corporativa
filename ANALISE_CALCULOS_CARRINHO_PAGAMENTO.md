# 🔍 ANÁLISE COMPLETA - CÁLCULOS CARRINHO + FRETE + PAGAMENTO

## 📋 ESCOPO DA ANÁLISE

Verificação completa do fluxo de cálculos financeiros:
1. **Subtotal do carrinho** (soma dos itens)
2. **Frete** (cotação e seleção)
3. **Desconto** (cupons)
4. **Total final** (subtotal + frete - desconto)
5. **Juros de parcelamento** (cartão de crédito)
6. **Consistência** entre frontend e backend

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### **1. FRONTEND - Cálculo de Subtotal Incorreto**

**Arquivo:** `frontend/src/pages/Cart.jsx` - Linha 18

```javascript
const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0)
```

**Problemas:**
1. ❌ **Campo errado:** Usa `i.price` mas o backend retorna `unit_price`
2. ❌ **Sem arredondamento:** Pode gerar valores com muitas casas decimais
3. ❌ **Tipo inconsistente:** Mistura Number() com valores que podem ser strings

**Impacto:**
- Se o CartContext não mapear corretamente, o subtotal será `NaN` ou `0`
- Inconsistência com o backend que usa `unit_price`

**Solução:**
```javascript
const subtotal = items.reduce((sum, i) => {
  const price = parseFloat(i.unit_price || i.price || 0)
  const qty = parseInt(i.quantity || i.qty || 0, 10)
  return sum + (price * qty)
}, 0)
```

---

### **2. FRONTEND - Cálculo de Desconto com Lógica Confusa**

**Arquivo:** `frontend/src/pages/Cart.jsx` - Linhas 69-72

```javascript
const discount = coupon ? Math.min(
  Number(coupon.amount_off || 0) || (subtotal * (Number(coupon.percent_off || 0) / 100)),
  subtotal
) : 0
```

**Problemas:**
1. ❌ **Lógica OR incorreta:** `Number(coupon.amount_off || 0) || (subtotal * ...)` 
   - Se `amount_off` for `0`, vai usar `percent_off` mesmo que `amount_off` exista
2. ❌ **Sem validação:** Não valida se os valores são números válidos
3. ❌ **Pode exceder subtotal:** O `Math.min` ajuda, mas a lógica está errada

**Exemplo do Bug:**
```javascript
// Se coupon = { amount_off: 0, percent_off: 10 }
// Esperado: desconto de R$ 0,00
// Real: desconto de 10% (porque 0 é falsy)
```

**Solução:**
```javascript
const discount = coupon ? (() => {
  let discountValue = 0
  
  // Priorizar amount_off se existir
  if (coupon.amount_off !== null && coupon.amount_off !== undefined) {
    discountValue = parseFloat(coupon.amount_off) || 0
  } else if (coupon.percent_off !== null && coupon.percent_off !== undefined) {
    const percent = parseFloat(coupon.percent_off) || 0
    discountValue = (subtotal * percent) / 100
  }
  
  // Garantir que desconto não exceda subtotal
  return Math.min(Math.max(0, discountValue), subtotal)
})() : 0
```

---

### **3. FRONTEND - buildCheckoutData com Frete Duplicado**

**Arquivo:** `frontend/src/pages/Cart.jsx` - Linhas 379-383

```javascript
// Para PIX, adicionar frete como item (mantém compatibilidade)
// Para cartão, o shipping_price já está sendo enviado separadamente
if (selectedQuote && Number(selectedQuote.price) > 0) {
  checkoutData.items.push({ name: 'Frete', qty: 1, price: parseFloat(Number(selectedQuote.price).toFixed(2)) })
}
```

**Problemas:**
1. ❌ **Frete duplicado:** Adiciona frete como item E envia `shipping_price` separadamente
2. ❌ **Inconsistência:** Backend vai calcular total errado
3. ❌ **Comentário enganoso:** Diz que é "para PIX" mas executa sempre

**Impacto:**
```javascript
// Dados enviados:
{
  items: [
    { name: "Produto A", qty: 1, price: 100 },
    { name: "Frete", qty: 1, price: 15 }  // ❌ DUPLICADO
  ],
  shipping_price: 15  // ❌ DUPLICADO
}

// Backend vai calcular:
// total_items = 100 + 15 = 115
// total = 115 + 15 = 130  // ❌ ERRADO! Deveria ser 115
```

**Solução:**
```javascript
// REMOVER essa linha completamente
// O shipping_price já está sendo enviado corretamente
// Backend deve usar shipping_price, não adicionar como item
```

---

### **4. FRONTEND - CheckoutCard.jsx - Múltiplos parseFloat**

**Arquivo:** `frontend/src/pages/CheckoutCard.jsx` - Linhas 27-30

```javascript
const itemsTotal = parseFloat((checkoutData?.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0).toFixed(2))
const shipping = parseFloat(Number(checkoutData?.shipping_price || 0).toFixed(2))
const discount = parseFloat(Number(checkoutData?.discount_amount || 0).toFixed(2))
const finalTotal = parseFloat((itemsTotal + shipping - discount).toFixed(2))
```

**Problemas:**
1. ❌ **Excesso de conversões:** `parseFloat(Number(...).toFixed(2))`
2. ❌ **Perda de precisão:** Múltiplos arredondamentos
3. ❌ **Código confuso:** Difícil de manter

**Solução:**
```javascript
// Função helper para arredondar corretamente
const roundToTwo = (num) => Math.round((parseFloat(num) || 0) * 100) / 100

const itemsTotal = roundToTwo(
  checkoutData?.items?.reduce((sum, item) => 
    sum + (parseFloat(item.price || 0) * parseInt(item.qty || 0, 10)), 0
  ) || 0
)
const shipping = roundToTwo(checkoutData?.shipping_price || 0)
const discount = roundToTwo(checkoutData?.discount_amount || 0)
const finalTotal = roundToTwo(itemsTotal + shipping - discount)
```

---

### **5. BACKEND - Order Total Calculation**

**Arquivo:** `backend/payments/helpers.py` - Linhas criadas

Verificando se o helper está calculando corretamente:

```python
# Criar OrderItems
total_items = 0.0
for item in cart_items:
    title = item.get('name', 'Produto')
    qty = int(item.get('qty', 1))
    price = float(item.get('price', 0))
    
    if str(title).lower() != 'frete':  # ✅ BOM: Ignora item "Frete"
        OrderItem.objects.create(...)
        total_items += price * qty

# Calcular total
computed_total = total_items + float(shipping_price) - float(discount_amount)
order.total_amount = max(0.0, computed_total)
```

**Análise:**
- ✅ **Correto:** Ignora item "Frete" para não duplicar
- ⚠️ **Problema:** Depende de string "frete" (case-insensitive)
- ❌ **Melhor:** Não adicionar frete como item no frontend

---

### **6. BACKEND - Arredondamento Inconsistente**

**Problema:** Backend usa `float` sem arredondamento consistente

```python
# Pode gerar valores como: 123.456789
computed_total = total_items + float(shipping_price) - float(discount_amount)
```

**Solução:**
```python
from decimal import Decimal, ROUND_HALF_UP

def round_currency(value):
    """Arredonda para 2 casas decimais (padrão BRL)"""
    return Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

# Usar:
computed_total = round_currency(total_items + shipping_price - discount_amount)
order.total_amount = float(max(Decimal('0'), computed_total))
```

---

### **7. FRONTEND - Juros de Parcelamento Não Somados Corretamente**

**Arquivo:** `frontend/src/pages/CheckoutCard.jsx` - Linha 193

```javascript
const finalTransactionAmount = parseFloat((transactionAmount > 0 ? transactionAmount : finalTotal).toFixed(2))
```

**Problema:**
- ⚠️ **Lógica confusa:** `transactionAmount > 0` pode ser verdadeiro mesmo sem juros
- ❌ **Não valida:** Se transactionAmount for inválido, usa finalTotal

**Solução:**
```javascript
// Usar transactionAmount se foi atualizado pelo listener de parcelas
// Caso contrário, usar finalTotal
const finalTransactionAmount = roundToTwo(
  transactionAmount && transactionAmount !== finalTotal 
    ? transactionAmount 
    : finalTotal
)
```

---

## 🟡 PROBLEMAS MÉDIOS

### **8. Falta de Validação de Valores Negativos**

Frontend não valida se subtotal, shipping ou discount são negativos.

```javascript
// Adicionar validações:
const subtotal = Math.max(0, items.reduce(...))
const shipping = Math.max(0, selectedQuote ? Number(selectedQuote.price) : 0)
const discount = Math.max(0, Math.min(coupon ? ... : 0, subtotal))
const total = Math.max(0, subtotal + shipping - discount)
```

---

### **9. Inconsistência de Nomes de Campos**

**Frontend usa:**
- `price`, `qty`, `name`

**Backend retorna:**
- `unit_price`, `quantity`, `product_name`

**Solução:** Padronizar no CartContext ou criar adapter.

---

## ✅ FLUXO CORRETO ESPERADO

### **Cálculo no Frontend (Cart.jsx):**

```javascript
// 1. Subtotal dos itens
const subtotal = items.reduce((sum, item) => {
  const price = parseFloat(item.unit_price || item.price || 0)
  const qty = parseInt(item.quantity || item.qty || 0, 10)
  return sum + (price * qty)
}, 0)

// 2. Frete selecionado
const shipping = selectedQuote ? parseFloat(selectedQuote.price || 0) : 0

// 3. Desconto do cupom
const discount = coupon ? (() => {
  let discountValue = 0
  if (coupon.amount_off != null) {
    discountValue = parseFloat(coupon.amount_off)
  } else if (coupon.percent_off != null) {
    discountValue = (subtotal * parseFloat(coupon.percent_off)) / 100
  }
  return Math.min(Math.max(0, discountValue), subtotal)
})() : 0

// 4. Total final
const total = Math.max(0, subtotal + shipping - discount)
```

### **Dados Enviados ao Backend:**

```javascript
const checkoutData = {
  // Itens SEM frete
  items: items.map(item => ({
    name: item.name || item.product_name,
    qty: item.qty || item.quantity,
    price: parseFloat(item.price || item.unit_price || 0)
  })),
  
  // Frete separado
  shipping_price: parseFloat(shipping.toFixed(2)),
  
  // Desconto separado
  discount_amount: parseFloat(discount.toFixed(2)),
  coupon_code: coupon?.code || '',
  
  // Outros dados...
}

// ❌ NÃO ADICIONAR: checkoutData.items.push({ name: 'Frete', ... })
```

### **Cálculo no Backend (payments/helpers.py):**

```python
# 1. Calcular total dos itens (ignorando "Frete" se existir)
total_items = Decimal('0')
for item in cart_items:
    if str(item.get('name', '')).lower() != 'frete':
        price = Decimal(str(item.get('price', 0)))
        qty = int(item.get('qty', 1))
        total_items += price * qty

# 2. Obter frete e desconto
shipping_price = Decimal(str(request_data.get('shipping_price', 0)))
discount_amount = Decimal(str(request_data.get('discount_amount', 0)))

# 3. Calcular total
computed_total = total_items + shipping_price - discount_amount
order.total_amount = float(max(Decimal('0'), computed_total.quantize(Decimal('0.01'))))
```

---

## 🔧 CORREÇÕES A IMPLEMENTAR

### **Prioridade CRÍTICA:**

1. ✅ **Remover frete duplicado** em `buildCheckoutData()`
2. ✅ **Corrigir cálculo de desconto** (lógica OR)
3. ✅ **Padronizar campos** (unit_price vs price)
4. ✅ **Adicionar arredondamento** consistente

### **Prioridade ALTA:**

5. ✅ **Criar função helper** para arredondamento
6. ✅ **Validar valores negativos**
7. ✅ **Melhorar cálculo de juros** no CheckoutCard

### **Prioridade MÉDIA:**

8. ✅ **Usar Decimal** no backend
9. ✅ **Adicionar testes** de cálculo
10. ✅ **Documentar** fluxo completo

---

## 📊 TABELA DE COMPATIBILIDADE

| Operação | Frontend (Atual) | Frontend (Correto) | Backend | Status |
|----------|------------------|-------------------|---------|--------|
| Subtotal | `sum(price * qty)` | `sum(unit_price * quantity)` | `sum(unit_price * quantity)` | ⚠️ Inconsistente |
| Frete | `selectedQuote.price` | `selectedQuote.price` | `shipping_price` | ✅ OK |
| Desconto | `amount_off \|\| percent` | `amount_off ?? percent` | `discount_amount` | ❌ Bug lógico |
| Total | `sub + ship - disc` | `sub + ship - disc` | `total_items + ship - disc` | ⚠️ Frete duplicado |
| Arredondamento | `toFixed(2)` | `Math.round(x*100)/100` | `float` | ❌ Inconsistente |

---

## 🎯 EXEMPLO PRÁTICO

### **Cenário:**
- Produto A: R$ 100,00 x 2 = R$ 200,00
- Produto B: R$ 50,50 x 1 = R$ 50,50
- **Subtotal:** R$ 250,50
- **Frete:** R$ 15,00
- **Cupom:** 10% de desconto
- **Desconto:** R$ 25,05
- **Total Esperado:** R$ 240,45

### **Frontend (ATUAL - COM BUGS):**
```javascript
// Bug 1: Pode usar i.price ao invés de i.unit_price
const subtotal = 250.50  // ✅ OK (se campos corretos)

// Bug 2: Lógica OR incorreta
const discount = 25.05  // ✅ OK (neste caso funciona)

// Bug 3: Frete duplicado
checkoutData.items = [
  { name: "Produto A", qty: 2, price: 100 },
  { name: "Produto B", qty: 1, price: 50.50 },
  { name: "Frete", qty: 1, price: 15 }  // ❌ DUPLICADO
]
checkoutData.shipping_price = 15  // ❌ DUPLICADO

// Total enviado ao backend: 250.50 + 15 (item) + 15 (shipping_price) - 25.05 = 255.45
// ❌ ERRADO! Deveria ser 240.45
```

### **Frontend (CORRIGIDO):**
```javascript
const subtotal = 250.50  // ✅
const shipping = 15.00   // ✅
const discount = 25.05   // ✅
const total = 240.45     // ✅

checkoutData.items = [
  { name: "Produto A", qty: 2, price: 100 },
  { name: "Produto B", qty: 1, price: 50.50 }
  // ✅ SEM frete como item
]
checkoutData.shipping_price = 15.00
checkoutData.discount_amount = 25.05
```

### **Backend (CORRIGIDO):**
```python
total_items = 250.50  # Soma dos itens (sem frete)
shipping_price = 15.00
discount_amount = 25.05
computed_total = 250.50 + 15.00 - 25.05 = 240.45  # ✅ CORRETO
```

---

## 📝 RESUMO EXECUTIVO

### **Problemas Encontrados: 9**

**Críticos (4):**
1. ❌ Subtotal usa campo errado (`price` vs `unit_price`)
2. ❌ Desconto com lógica OR incorreta
3. ❌ Frete duplicado (item + shipping_price)
4. ❌ Múltiplos parseFloat causando perda de precisão

**Médios (3):**
5. ⚠️ Sem validação de valores negativos
6. ⚠️ Inconsistência de nomes de campos
7. ⚠️ Arredondamento inconsistente

**Baixos (2):**
8. 🔵 Backend usa float ao invés de Decimal
9. 🔵 Falta de testes automatizados

---

## ✅ PRÓXIMOS PASSOS

1. Implementar correções no `Cart.jsx`
2. Implementar correções no `CheckoutCard.jsx`
3. Atualizar backend para usar Decimal
4. Criar testes de cálculo
5. Documentar fluxo correto

**Status:** 🔴 **CORREÇÕES URGENTES NECESSÁRIAS**
