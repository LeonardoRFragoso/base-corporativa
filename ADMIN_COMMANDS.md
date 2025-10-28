# Comandos Úteis - Sistema Administrativo

## 🚀 Instalação Rápida

```powershell
# Execute o script de setup
.\setup-admin.ps1
```

## 👤 Gerenciamento de Usuários

### Criar Superusuário
```bash
cd backend
python manage.py createsuperuser
```

### Tornar Usuário Existente Admin (via Shell)
```bash
python manage.py shell
```
```python
from users.models import User
user = User.objects.get(email='usuario@email.com')
user.is_staff = True
user.is_superuser = True
user.save()
print(f"✅ {user.email} agora é admin!")
```

### Listar Todos os Admins
```python
from users.models import User
admins = User.objects.filter(is_staff=True)
for admin in admins:
    print(f"- {admin.email} (superuser: {admin.is_superuser})")
```

### Remover Privilégios de Admin
```python
from users.models import User
user = User.objects.get(email='usuario@email.com')
user.is_staff = False
user.is_superuser = False
user.save()
```

## 📊 Consultas Úteis

### Ver Total de Vendas
```python
from orders.models import Order
from django.db.models import Sum

total = Order.objects.filter(status='paid').aggregate(
    total=Sum('total_amount')
)
print(f"Total de vendas: R$ {total['total']}")
```

### Produtos com Estoque Baixo
```python
from catalog.models import ProductVariant

low_stock = ProductVariant.objects.filter(stock__lt=5, stock__gt=0)
for variant in low_stock:
    print(f"⚠️  {variant.product.name} - {variant.sku}: {variant.stock} unidades")
```

### Produtos Sem Estoque
```python
from catalog.models import ProductVariant

out_of_stock = ProductVariant.objects.filter(stock=0)
print(f"❌ {out_of_stock.count()} variantes sem estoque")
```

### Pedidos Pendentes
```python
from orders.models import Order

pending = Order.objects.filter(status='pending')
print(f"⏳ {pending.count()} pedidos pendentes")
for order in pending:
    print(f"  - Pedido #{order.id}: R$ {order.total_amount}")
```

### Top 10 Produtos Mais Vendidos
```python
from orders.models import OrderItem
from django.db.models import Sum, Count

top_products = OrderItem.objects.filter(
    order__status='paid'
).values(
    'product_name'
).annotate(
    total_qty=Sum('quantity'),
    total_orders=Count('order', distinct=True)
).order_by('-total_qty')[:10]

for i, product in enumerate(top_products, 1):
    print(f"{i}. {product['product_name']}: {product['total_qty']} vendidos em {product['total_orders']} pedidos")
```

### Clientes que Mais Compraram
```python
from orders.models import Order
from django.db.models import Count, Sum

top_customers = Order.objects.filter(
    status='paid'
).values(
    'user__email', 'user__first_name', 'user__last_name'
).annotate(
    total_orders=Count('id'),
    total_spent=Sum('total_amount')
).order_by('-total_spent')[:10]

for i, customer in enumerate(top_customers, 1):
    print(f"{i}. {customer['user__first_name']} {customer['user__last_name']}")
    print(f"   Email: {customer['user__email']}")
    print(f"   Pedidos: {customer['total_orders']}")
    print(f"   Total gasto: R$ {customer['total_spent']}")
    print()
```

## 📦 Gestão de Produtos

### Adicionar Estoque em Massa
```python
from catalog.models import ProductVariant

# Adicionar 10 unidades a todas as variantes de um produto
product_id = 1
variants = ProductVariant.objects.filter(product_id=product_id)
for variant in variants:
    variant.stock += 10
    variant.save()
print(f"✅ Estoque atualizado para {variants.count()} variantes")
```

### Ativar/Desativar Produto
```python
from catalog.models import Product

product = Product.objects.get(id=1)
product.is_active = False  # ou True para ativar
product.save()
print(f"✅ Produto {product.name} {'ativado' if product.is_active else 'desativado'}")
```

### Atualizar Preços em Massa (Aumento de 10%)
```python
from catalog.models import Product
from decimal import Decimal

products = Product.objects.all()
for product in products:
    product.base_price = product.base_price * Decimal('1.10')
    product.save()
print(f"✅ Preços atualizados para {products.count()} produtos")
```

## 🗄️ Banco de Dados

### Backup do Banco (SQLite)
```bash
# Fazer backup
python manage.py dumpdata > backup.json

# Restaurar backup
python manage.py loaddata backup.json
```

### Limpar Pedidos de Teste
```python
from orders.models import Order

# CUIDADO: Isso apaga pedidos permanentemente!
test_orders = Order.objects.filter(status='pending', email__contains='test')
count = test_orders.count()
test_orders.delete()
print(f"🗑️  {count} pedidos de teste removidos")
```

### Resetar Sequência de IDs (PostgreSQL)
```sql
-- No psql ou pgAdmin
SELECT setval('orders_order_id_seq', (SELECT MAX(id) FROM orders_order));
```

## 🔧 Manutenção

### Limpar Sessões Expiradas
```bash
python manage.py clearsessions
```

### Verificar Integridade do Banco
```bash
python manage.py check
```

### Criar Migrações
```bash
python manage.py makemigrations
python manage.py migrate
```

### Ver SQL de uma Migração
```bash
python manage.py sqlmigrate app_name migration_number
```

## 📊 Relatórios Personalizados

### Vendas por Mês (Último Ano)
```python
from orders.models import Order
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta

one_year_ago = datetime.now() - timedelta(days=365)

monthly_sales = Order.objects.filter(
    status='paid',
    created_at__gte=one_year_ago
).annotate(
    month=TruncMonth('created_at')
).values('month').annotate(
    total=Sum('total_amount'),
    count=Count('id')
).order_by('month')

for sale in monthly_sales:
    print(f"{sale['month'].strftime('%B/%Y')}: R$ {sale['total']} ({sale['count']} pedidos)")
```

### Taxa de Conversão de Pedidos
```python
from orders.models import Order

total = Order.objects.count()
paid = Order.objects.filter(status='paid').count()
pending = Order.objects.filter(status='pending').count()
failed = Order.objects.filter(status='failed').count()

conversion_rate = (paid / total * 100) if total > 0 else 0

print(f"📊 Estatísticas de Pedidos:")
print(f"   Total: {total}")
print(f"   Pagos: {paid} ({paid/total*100:.1f}%)")
print(f"   Pendentes: {pending} ({pending/total*100:.1f}%)")
print(f"   Falhos: {failed} ({failed/total*100:.1f}%)")
print(f"   Taxa de Conversão: {conversion_rate:.1f}%")
```

### Ticket Médio
```python
from orders.models import Order
from django.db.models import Avg

avg_ticket = Order.objects.filter(status='paid').aggregate(
    avg=Avg('total_amount')
)
print(f"🎫 Ticket Médio: R$ {avg_ticket['avg']:.2f}")
```

## 🚨 Troubleshooting

### Resetar Senha de Admin
```python
from users.models import User
admin = User.objects.get(email='admin@email.com')
admin.set_password('nova_senha_segura')
admin.save()
print("✅ Senha resetada!")
```

### Verificar Permissões de Usuário
```python
from users.models import User
user = User.objects.get(email='usuario@email.com')
print(f"is_staff: {user.is_staff}")
print(f"is_superuser: {user.is_superuser}")
print(f"is_active: {user.is_active}")
```

### Reindexar Banco (PostgreSQL)
```sql
REINDEX DATABASE nome_do_banco;
```

## 📝 Logs e Debug

### Ver Últimos Erros
```bash
# Ver logs do servidor
python manage.py runserver --verbosity 2
```

### Habilitar Debug SQL
```python
# Em settings.py (apenas desenvolvimento!)
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## 🔐 Segurança

### Gerar Nova SECRET_KEY
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Verificar Configurações de Segurança
```bash
python manage.py check --deploy
```

---

**💡 Dica:** Sempre faça backup antes de executar comandos que modificam dados em produção!
