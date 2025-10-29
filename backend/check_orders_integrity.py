#!/usr/bin/env python3
"""
Script para verificar a integridade dos pedidos no banco de dados
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from orders.models import Order, OrderItem
from django.contrib.auth import get_user_model

User = get_user_model()

def check_orders_integrity():
    print("🔍 Verificando integridade dos pedidos...")
    print("=" * 50)
    
    # Estatísticas gerais
    total_orders = Order.objects.count()
    print(f"📊 Total de pedidos: {total_orders}")
    
    # Verificar pedidos por status
    statuses = Order.objects.values_list('status', flat=True).distinct()
    print(f"📋 Status encontrados: {list(statuses)}")
    
    for status in statuses:
        count = Order.objects.filter(status=status).count()
        print(f"   - {status}: {count} pedidos")
    
    print("\n" + "=" * 50)
    
    # Verificar pedidos sem usuário
    orders_without_user = Order.objects.filter(user__isnull=True)
    print(f"⚠️  Pedidos sem usuário: {orders_without_user.count()}")
    
    if orders_without_user.exists():
        print("   IDs dos pedidos sem usuário:")
        for order in orders_without_user[:10]:  # Mostrar apenas os primeiros 10
            print(f"   - Pedido #{order.id} - {order.email or 'Sem email'}")
    
    # Verificar pedidos sem itens
    orders_without_items = Order.objects.filter(items__isnull=True)
    print(f"⚠️  Pedidos sem itens: {orders_without_items.count()}")
    
    if orders_without_items.exists():
        print("   IDs dos pedidos sem itens:")
        for order in orders_without_items[:10]:
            print(f"   - Pedido #{order.id}")
    
    # Verificar pedidos recentes
    print(f"\n📅 Últimos 10 pedidos:")
    recent_orders = Order.objects.order_by('-created_at')[:10]
    for order in recent_orders:
        user_info = f"User: {order.user.email}" if order.user else f"Email: {order.email or 'N/A'}"
        items_count = order.items.count() if hasattr(order, 'items') else 0
        print(f"   - Pedido #{order.id} | {order.status} | R$ {order.total_amount} | {user_info} | {items_count} itens")
    
    # Verificar pedido específico #25
    print(f"\n🔍 Verificando pedido #25 especificamente:")
    try:
        order_25 = Order.objects.get(id=25)
        print(f"   ✅ Pedido #25 encontrado!")
        print(f"   - Status: {order_25.status}")
        print(f"   - Total: R$ {order_25.total_amount}")
        print(f"   - Usuário: {order_25.user.email if order_25.user else order_25.email or 'N/A'}")
        print(f"   - Criado em: {order_25.created_at}")
        print(f"   - Itens: {order_25.items.count()}")
    except Order.DoesNotExist:
        print(f"   ❌ Pedido #25 NÃO encontrado no banco de dados!")
    
    print("\n" + "=" * 50)
    print("✅ Verificação concluída!")

if __name__ == '__main__':
    check_orders_integrity()
