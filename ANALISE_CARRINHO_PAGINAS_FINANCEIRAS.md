# 🔍 ANÁLISE APROFUNDADA - CARRINHO E PÁGINAS FINANCEIRAS

## 📋 ESCOPO DA ANÁLISE

Análise completa de:
1. Backend: Rotas `/cart/*` e modelos relacionados
2. Frontend: Cart.jsx, CheckoutCard.jsx, CheckoutPix.jsx
3. Integração com pagamentos (Mercado Pago)
4. Fluxo completo de dados do carrinho ao pedido finalizado

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### **1. BACKEND - Cart Models**

#### **Problema: Falta de campos essenciais no CartItem**

**Arquivo:** `backend/cart/models.py`

```python
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)  # ✅ OK
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)  # ✅ OK
    quantity = models.PositiveIntegerField(default=1)  # ✅ OK
    # ❌ FALTANDO: size, color, image_url, sku
```

**Impacto:**
- Frontend precisa buscar dados da variante toda vez
- Inconsistência se produto for deletado
- Não preserva snapshot do momento da compra

**Solução Necessária:**
```python
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    # ADICIONAR:
    size = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=50, blank=True)
    sku = models.CharField(max_length=64, blank=True)
    image_url = models.URLField(blank=True)
    product_id = models.IntegerField(null=True)  # Para rastreamento
```

---

### **2. BACKEND - Cart Serializer Incompleto**

**Arquivo:** `backend/cart/serializers.py`

```python
class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ("id", "variant", "product_name", "unit_price", "quantity")
        # ❌ FALTANDO: Dados expandidos da variante
```

**Problema:**
- Frontend recebe apenas IDs, precisa fazer queries adicionais
- Não retorna imagem, tamanho, cor diretamente

**Solução Necessária:**
```python
class CartItemSerializer(serializers.ModelSerializer):
    # Adicionar campos calculados
    size = serializers.CharField(source='variant.size', read_only=True)
    color = serializers.CharField(source='variant.color', read_only=True)
    sku = serializers.CharField(source='variant.sku', read_only=True)
    stock = serializers.IntegerField(source='variant.stock', read_only=True)
    product_id = serializers.IntegerField(source='variant.product.id', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    def get_image_url(self, obj):
        # Retornar primeira imagem do produto
        image = obj.variant.product.images.filter(is_primary=True).first()
        if not image:
            image = obj.variant.product.images.first()
        return image.image.url if image else None
    
    class Meta:
        model = CartItem
        fields = (
            "id", "variant", "product_id", "product_slug", "product_name", 
            "unit_price", "quantity", "size", "color", "sku", "stock", "image_url"
        )
```

---

### **3. BACKEND - Validação de Estoque Ausente**

**Arquivo:** `backend/cart/views.py` - Função `add_to_cart`

```python
@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def add_to_cart(request):
    # ...
    variant = get_object_or_404(ProductVariant.objects.select_related('product'), id=variant_id)
    # ❌ NÃO VALIDA ESTOQUE ANTES DE ADICIONAR
    
    item, created = CartItem.objects.get_or_create(
        cart=cart, variant=variant,
        defaults={"product_name": product_name, "unit_price": unit_price, "quantity": quantity}
    )
    if not created:
        item.quantity += quantity  # ❌ Pode exceder estoque disponível
        item.save(update_fields=["quantity", "updated_at"])
```

**Solução Necessária:**
```python
@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def add_to_cart(request):
    # ...
    variant = get_object_or_404(ProductVariant.objects.select_related('product'), id=variant_id)
    
    # ADICIONAR VALIDAÇÃO:
    if variant.stock < quantity:
        return Response({
            "error": "Estoque insuficiente",
            "available": variant.stock,
            "requested": quantity
        }, status=status.HTTP_400_BAD_REQUEST)
    
    item, created = CartItem.objects.get_or_create(
        cart=cart, variant=variant,
        defaults={
            "product_name": product_name, 
            "unit_price": unit_price, 
            "quantity": quantity,
            "size": variant.size,
            "color": variant.color,
            "sku": variant.sku
        }
    )
    if not created:
        new_quantity = item.quantity + quantity
        # VALIDAR NOVA QUANTIDADE
        if new_quantity > variant.stock:
            return Response({
                "error": "Estoque insuficiente",
                "available": variant.stock,
                "current_in_cart": item.quantity,
                "requested": quantity
            }, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = new_quantity
        item.save(update_fields=["quantity", "updated_at"])
```

---

### **4. FRONTEND - Cart.jsx - Dados Inconsistentes**

**Arquivo:** `frontend/src/pages/Cart.jsx`

**Problemas Identificados:**

#### **A. Cálculo de Subtotal Incorreto**
```javascript
// Linha 18
const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0)
// ❌ Usa 'i.price' mas deveria ser 'i.unit_price' conforme backend
```

#### **B. Estrutura de Dados Inconsistente**
```javascript
// Frontend espera:
{
  id, name, price, qty, size, color, variant_id, image
}

// Backend retorna:
{
  id, variant, product_name, unit_price, quantity
}

// ❌ INCOMPATIBILIDADE TOTAL
```

#### **C. Dados de Checkout Incompletos**
```javascript
// Linha ~240 - Preparação do checkout
const checkoutData = {
  items: items.map(item => ({
    name: item.name,
    price: item.price,
    qty: item.qty,
    size: item.size,
    color: item.color
  })),
  // ❌ FALTANDO: variant_id, product_id, sku
  // ❌ FALTANDO: Validação de estoque antes de prosseguir
}
```

---

### **5. FRONTEND - CheckoutCard.jsx - Problemas de Integração**

**Arquivo:** `frontend/src/pages/CheckoutCard.jsx`

#### **A. Cálculo de Total com Juros Problemático**
```javascript
// Linhas 27-30
const itemsTotal = parseFloat((checkoutData?.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0).toFixed(2))
const shipping = parseFloat(Number(checkoutData?.shipping_price || 0).toFixed(2))
const discount = parseFloat(Number(checkoutData?.discount_amount || 0).toFixed(2))
const finalTotal = parseFloat((itemsTotal + shipping - discount).toFixed(2))

// ❌ Múltiplos parseFloat e toFixed podem causar erros de arredondamento
// ❌ Não valida se valores são números válidos
```

#### **B. Transaction Amount Inconsistente**
```javascript
// Linha 193
const finalTransactionAmount = parseFloat((transactionAmount > 0 ? transactionAmount : finalTotal).toFixed(2))

// ❌ Lógica confusa: transactionAmount pode ser 0 inicialmente
// ❌ Não garante que o valor enviado ao MP está correto
```

#### **C. Dados Enviados ao Backend Incompletos**
```javascript
// Linha 196-205
const paymentData = {
  ...checkoutData,
  token: tokenId,
  payment_method_id: resolvedPaymentMethodId,
  installments: Number(formData.installments || 1),
  issuer_id: formData.issuerId,
  cpf: formData.identificationNumber,
  transaction_amount: finalTransactionAmount,
}

// ❌ FALTANDO: Validação de campos obrigatórios
// ❌ FALTANDO: variant_id dos itens para deduzir estoque
```

---

### **6. BACKEND - Payments Views - Criação de Pedido Duplicada**

**Arquivo:** `backend/payments/views.py`

**Problema:** Código duplicado em `create_preference` e `create_pix_payment`

```python
# Linhas 108-181 (create_preference)
order = Order.objects.create(...)
# ... processamento ...

# Linhas 576-642 (create_pix_payment)
order = Order.objects.create(...)
# ... MESMO código repetido ...
```

**Impacto:**
- Manutenção difícil
- Risco de inconsistências
- Violação DRY (Don't Repeat Yourself)

**Solução:** Criar função helper
```python
def create_order_from_checkout_data(request_data, user=None):
    """
    Função helper para criar pedido a partir dos dados de checkout
    """
    # ... lógica centralizada ...
    return order
```

---

### **7. BACKEND - Order Model - Campos Redundantes**

**Arquivo:** `backend/orders/models.py`

```python
class Order(models.Model):
    shipping_address = models.ForeignKey(Address, ...)  # ✅ Referência
    
    # ❌ REDUNDANTE: Campos duplicados do endereço
    shipping_first_name = models.CharField(...)
    shipping_last_name = models.CharField(...)
    shipping_phone = models.CharField(...)
    shipping_street = models.CharField(...)
    shipping_number = models.CharField(...)
    shipping_complement = models.CharField(...)
    shipping_neighborhood = models.CharField(...)
    shipping_city = models.CharField(...)
    shipping_state = models.CharField(...)
    shipping_zip = models.CharField(...)
```

**Análise:**
- ✅ **Correto para guests** (sem conta)
- ✅ **Correto para snapshot** (preservar dados mesmo se endereço mudar)
- ⚠️ **Problema:** Não há lógica para copiar dados do Address para esses campos

**Solução:**
```python
# Em payments/views.py, após criar order:
if order.shipping_address:
    # Copiar dados do endereço para os campos do pedido
    order.shipping_first_name = order.shipping_address.first_name
    order.shipping_last_name = order.shipping_address.last_name
    order.shipping_phone = order.shipping_address.phone
    order.shipping_street = order.shipping_address.street
    # ... etc
    order.save()
```

---

## 🟡 PROBLEMAS MÉDIOS IDENTIFICADOS

### **8. Falta de Método para Calcular Total do Carrinho**

**Backend:** Não há método `get_total()` no modelo Cart

```python
# Deveria existir:
class Cart(models.Model):
    # ...
    
    def get_subtotal(self):
        return sum(item.unit_price * item.quantity for item in self.items.all())
    
    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    def get_total_with_shipping(self, shipping_price=0):
        return self.get_subtotal() + Decimal(str(shipping_price))
```

---

### **9. Falta de Validação de CPF**

**Frontend:** Cart.jsx valida CPF apenas por tamanho

```javascript
// Linha 187-190
function validateCPF(cpf) {
  const cleanCpf = onlyNumbers(cpf)
  return cleanCpf.length === 11  // ❌ Não valida dígitos verificadores
}
```

**Solução:** Implementar validação completa de CPF

---

### **10. Falta de Timeout no Carrinho**

**Backend:** Carrinhos abandonados não expiram

**Solução:** Adicionar campo `expires_at` e job para limpar carrinhos antigos

```python
class Cart(models.Model):
    # ...
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def extend_expiration(self):
        from datetime import timedelta
        from django.utils import timezone
        self.expires_at = timezone.now() + timedelta(hours=24)
        self.save()
```

---

### **11. CheckoutPix.jsx - Verificação de Status Não Implementada**

**Arquivo:** `frontend/src/pages/CheckoutPix.jsx`

```javascript
// Linha 36-52
const checkPaymentStatus = async () => {
  if (!pixData?.payment_id) return
  
  setChecking(true)
  try {
    // ❌ SIMULAÇÃO - Não faz chamada real
    setTimeout(() => {
      setChecking(false)
    }, 2000)
  } catch (err) {
    console.error('Erro ao verificar status:', err)
    setChecking(false)
  }
}
```

**Solução:** Implementar endpoint e integração real
```javascript
const checkPaymentStatus = async () => {
  if (!pixData?.payment_id) return
  
  setChecking(true)
  try {
    const res = await api.get(`/api/payments/status/${pixData.payment_id}`)
    if (res.data.status === 'approved') {
      handlePaymentConfirmed()
    } else {
      toast.info('Pagamento ainda não confirmado')
    }
  } catch (err) {
    toast.error('Erro ao verificar status')
  } finally {
    setChecking(false)
  }
}
```

---

## 🟢 GAPS DE FUNCIONALIDADE

### **12. Falta de Endpoint para Limpar Itens Expirados**

**Necessário:** Endpoint admin para limpar carrinhos abandonados

```python
@api_view(['POST'])
@permission_classes([IsAdminUser])
def cleanup_abandoned_carts(request):
    from datetime import timedelta
    from django.utils import timezone
    
    cutoff = timezone.now() - timedelta(days=7)
    deleted = Cart.objects.filter(
        updated_at__lt=cutoff,
        user__isnull=True  # Apenas guests
    ).delete()
    
    return Response({
        'deleted': deleted[0],
        'message': f'{deleted[0]} carrinho(s) removido(s)'
    })
```

---

### **13. Falta de Endpoint para Mesclar Carrinhos**

**Cenário:** Usuário adiciona itens como guest, depois faz login

**Solução:** Já implementado em `cart/views_enhanced.py` mas não integrado no frontend

---

### **14. Falta de Histórico de Preços**

**Problema:** Se preço do produto mudar, carrinho não reflete

**Solução:** Adicionar método para atualizar preços
```python
class Cart(models.Model):
    def refresh_prices(self):
        for item in self.items.all():
            current_price = item.variant.price or item.variant.product.base_price
            if item.unit_price != current_price:
                item.unit_price = current_price
                item.save()
```

---

## 📊 MAPEAMENTO DE CAMPOS - BACKEND ↔ FRONTEND

### **CartItem (Backend) → Item (Frontend)**

| Backend | Frontend | Status |
|---------|----------|--------|
| `id` | `id` | ✅ OK |
| `variant` (FK) | `variant_id` | ⚠️ Inconsistente |
| `product_name` | `name` | ⚠️ Nome diferente |
| `unit_price` | `price` | ⚠️ Nome diferente |
| `quantity` | `qty` | ⚠️ Nome diferente |
| - | `size` | ❌ Falta no backend |
| - | `color` | ❌ Falta no backend |
| - | `image` | ❌ Falta no backend |
| - | `sku` | ❌ Falta no backend |

---

### **Order (Backend) → CheckoutData (Frontend)**

| Backend | Frontend | Status |
|---------|----------|--------|
| `email` | `email` | ✅ OK |
| `first_name` | `first_name` | ✅ OK |
| `last_name` | `last_name` | ✅ OK |
| `shipping_price` | `shipping_price` | ✅ OK |
| `discount_amount` | `discount_amount` | ✅ OK |
| `coupon_code` | `coupon_code` | ✅ OK |
| `total_amount` | `total` | ⚠️ Calculado no frontend |
| `shipping_zip` | `shipping_zip` | ✅ OK |
| `shipping_street` | `shipping_street` | ✅ OK |
| `items` (OrderItem[]) | `items` | ⚠️ Estrutura diferente |

---

## 🔧 CORREÇÕES NECESSÁRIAS - PRIORIDADE ALTA

### **1. Atualizar CartItem Model**
```python
# backend/cart/models.py
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    # ADICIONAR:
    size = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=50, blank=True)
    sku = models.CharField(max_length=64, blank=True)
    image_url = models.URLField(blank=True, max_length=500)
    product_id = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### **2. Atualizar CartItemSerializer**
```python
# backend/cart/serializers.py
from catalog.serializers import ProductImageSerializer

class CartItemSerializer(serializers.ModelSerializer):
    size = serializers.CharField(source='variant.size', read_only=True)
    color = serializers.CharField(source='variant.color', read_only=True)
    sku = serializers.CharField(source='variant.sku', read_only=True)
    stock = serializers.IntegerField(source='variant.stock', read_only=True)
    product_id = serializers.IntegerField(source='variant.product.id', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    image = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        primary_image = obj.variant.product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.variant.product.images.first()
        if primary_image:
            return {
                'url': primary_image.image.url,
                'alt': primary_image.alt_text
            }
        return None
    
    class Meta:
        model = CartItem
        fields = (
            'id', 'variant', 'product_id', 'product_slug', 'product_name',
            'unit_price', 'quantity', 'size', 'color', 'sku', 'stock', 'image'
        )
```

### **3. Adicionar Validação de Estoque em add_to_cart**
```python
# backend/cart/views.py
@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def add_to_cart(request):
    cart = _get_or_create_cart_for_request(request)
    if cart is None:
        return Response({"error": "Informe X-Session-Key no header"}, status=400)

    variant_id = request.data.get('variant_id')
    quantity = int(request.data.get('quantity') or 1)
    
    if not variant_id:
        return Response({"error": "variant_id é obrigatório"}, status=400)
    if quantity < 1:
        quantity = 1

    variant = get_object_or_404(
        ProductVariant.objects.select_related('product').prefetch_related('product__images'),
        id=variant_id
    )
    
    # VALIDAR ESTOQUE
    if variant.stock < quantity:
        return Response({
            "error": "Estoque insuficiente",
            "available": variant.stock,
            "requested": quantity
        }, status=400)
    
    unit_price = variant.price or variant.product.base_price
    product_name = variant.product.name
    
    # Obter imagem
    primary_image = variant.product.images.filter(is_primary=True).first()
    if not primary_image:
        primary_image = variant.product.images.first()
    image_url = primary_image.image.url if primary_image else ''

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        variant=variant,
        defaults={
            "product_name": product_name,
            "unit_price": unit_price,
            "quantity": quantity,
            "size": variant.size,
            "color": variant.color,
            "sku": variant.sku,
            "image_url": image_url,
            "product_id": variant.product.id
        }
    )
    
    if not created:
        new_quantity = item.quantity + quantity
        # VALIDAR NOVA QUANTIDADE
        if new_quantity > variant.stock:
            return Response({
                "error": "Estoque insuficiente",
                "available": variant.stock,
                "current_in_cart": item.quantity,
                "requested": quantity
            }, status=400)
        item.quantity = new_quantity
        item.save(update_fields=["quantity", "updated_at"])

    cart_data = CartSerializer(cart).data
    return Response(cart_data, status=200)
```

### **4. Criar Migração**
```bash
cd backend
python manage.py makemigrations cart
python manage.py migrate
```

---

## 📝 RESUMO EXECUTIVO

### **Problemas Críticos: 7**
1. ❌ CartItem sem campos essenciais (size, color, image)
2. ❌ Serializer não retorna dados completos
3. ❌ Sem validação de estoque ao adicionar
4. ❌ Incompatibilidade de estrutura backend ↔ frontend
5. ❌ Cálculo de total inconsistente
6. ❌ Código duplicado em payments
7. ❌ Dados de endereço não copiados para Order

### **Problemas Médios: 4**
8. ⚠️ Falta método get_total() no Cart
9. ⚠️ Validação de CPF incompleta
10. ⚠️ Carrinhos não expiram
11. ⚠️ Verificação de status PIX não implementada

### **Gaps de Funcionalidade: 3**
12. 🔵 Falta endpoint cleanup de carrinhos
13. 🔵 Merge de carrinhos não integrado
14. 🔵 Preços não atualizam automaticamente

---

## ✅ PLANO DE AÇÃO

### **Fase 1: Correções Críticas (Imediato)**
1. Atualizar modelo CartItem
2. Atualizar serializer CartItemSerializer
3. Adicionar validação de estoque
4. Criar migração e aplicar

### **Fase 2: Refatoração (Curto Prazo)**
5. Refatorar código duplicado em payments
6. Implementar cópia de dados de endereço
7. Padronizar nomes de campos

### **Fase 3: Melhorias (Médio Prazo)**
8. Adicionar métodos helper no Cart
9. Implementar validação completa de CPF
10. Sistema de expiração de carrinhos
11. Verificação real de status PIX

---

**Status:** 🔴 **AÇÃO URGENTE NECESSÁRIA**

Total de problemas identificados: **14**
- Críticos: **7**
- Médios: **4**
- Gaps: **3**
