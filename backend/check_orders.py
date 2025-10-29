#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from orders.models import Order

# Verificar pedidos
orders = Order.objects.all().order_by('-created_at')
print(f'Total de pedidos: {orders.count()}')

for order in orders[:10]:  # Mostrar os últimos 10 pedidos
    print(f'Pedido {order.id}:')
    print(f'  Status: {order.status}')
    print(f'  MP Status: {order.mp_status}')
    print(f'  Total: R$ {order.total_amount}')
    print(f'  External Reference: {order.external_reference}')
    print(f'  MP Payment ID: {order.mp_payment_id}')
    print(f'  Email: {order.email}')
    print(f'  Criado em: {order.created_at}')
    print('---')

# Verificar especificamente pedidos pagos
paid_orders = Order.objects.filter(status='paid')
print(f'\nPedidos pagos: {paid_orders.count()}')
total_paid = sum(float(order.total_amount) for order in paid_orders)
print(f'Total em vendas pagas: R$ {total_paid:.2f}')
