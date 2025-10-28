from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from orders.models import Order, OrderItem
from catalog.models import Product, ProductVariant
from users.models import User


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_overview(request):
    """
    Retorna visão geral do dashboard com métricas principais
    """
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    last_7_days = today - timedelta(days=7)
    
    # Vendas totais
    total_sales = Order.objects.filter(status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or Decimal('0.00')
    
    # Vendas últimos 30 dias
    sales_30_days = Order.objects.filter(
        status='paid',
        created_at__date__gte=last_30_days
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    
    # Vendas últimos 7 dias
    sales_7_days = Order.objects.filter(
        status='paid',
        created_at__date__gte=last_7_days
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    
    # Total de pedidos
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    paid_orders = Order.objects.filter(status='paid').count()
    
    # Ticket médio
    avg_order_value = Order.objects.filter(status='paid').aggregate(
        avg=Avg('total_amount')
    )['avg'] or Decimal('0.00')
    
    # Total de produtos e estoque
    total_products = Product.objects.filter(is_active=True).count()
    total_stock = ProductVariant.objects.aggregate(
        total=Sum('stock')
    )['total'] or 0
    
    low_stock_products = ProductVariant.objects.filter(
        stock__lt=5, stock__gt=0
    ).count()
    
    out_of_stock_products = ProductVariant.objects.filter(stock=0).count()
    
    # Total de clientes
    total_customers = User.objects.filter(is_staff=False).count()
    new_customers_30_days = User.objects.filter(
        is_staff=False,
        date_joined__date__gte=last_30_days
    ).count()
    
    return Response({
        'sales': {
            'total': float(total_sales),
            'last_30_days': float(sales_30_days),
            'last_7_days': float(sales_7_days),
            'avg_order_value': float(avg_order_value)
        },
        'orders': {
            'total': total_orders,
            'pending': pending_orders,
            'paid': paid_orders
        },
        'products': {
            'total': total_products,
            'total_stock': total_stock,
            'low_stock': low_stock_products,
            'out_of_stock': out_of_stock_products
        },
        'customers': {
            'total': total_customers,
            'new_last_30_days': new_customers_30_days
        }
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def sales_chart(request):
    """
    Retorna dados para gráfico de vendas (últimos 30 dias)
    """
    period = request.GET.get('period', '30')  # 7, 30, 90 dias
    
    try:
        days = int(period)
    except ValueError:
        days = 30
    
    start_date = timezone.now().date() - timedelta(days=days)
    
    # Vendas por dia
    daily_sales = Order.objects.filter(
        status='paid',
        created_at__date__gte=start_date
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        total=Sum('total_amount'),
        count=Count('id')
    ).order_by('date')
    
    return Response({
        'labels': [item['date'].strftime('%d/%m') for item in daily_sales],
        'sales': [float(item['total']) for item in daily_sales],
        'orders': [item['count'] for item in daily_sales]
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def top_products(request):
    """
    Retorna produtos mais vendidos
    """
    limit = int(request.GET.get('limit', 10))
    
    top_items = OrderItem.objects.filter(
        order__status='paid'
    ).values(
        'product_name'
    ).annotate(
        total_quantity=Sum('quantity'),
        total_revenue=Sum(F('quantity') * F('unit_price'))
    ).order_by('-total_quantity')[:limit]
    
    return Response([{
        'name': item['product_name'],
        'quantity': item['total_quantity'],
        'revenue': float(item['total_revenue'])
    } for item in top_items])


@api_view(['GET'])
@permission_classes([IsAdminUser])
def low_stock_alert(request):
    """
    Retorna produtos com estoque baixo ou zerado
    """
    threshold = int(request.GET.get('threshold', 5))
    
    low_stock = ProductVariant.objects.filter(
        stock__lte=threshold
    ).select_related('product').order_by('stock', 'product__name')
    
    return Response([{
        'id': variant.id,
        'product_id': variant.product.id,
        'product_name': variant.product.name,
        'size': variant.size,
        'color': variant.color,
        'sku': variant.sku,
        'stock': variant.stock,
        'status': 'out_of_stock' if variant.stock == 0 else 'low_stock'
    } for variant in low_stock])


@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_orders(request):
    """
    Retorna pedidos recentes
    """
    try:
        try:
            limit = int(request.GET.get('limit', 10))
        except Exception:
            limit = 10
        orders = Order.objects.select_related('user').prefetch_related('items').order_by('-created_at')[:limit]
        data = []
        for order in orders:
            try:
                customer = ''
                if getattr(order, 'user', None) and getattr(order.user, 'email', None):
                    customer = order.user.email
                elif getattr(order, 'email', None):
                    customer = order.email
                total = float(order.total_amount or 0)
                items_count = getattr(order, 'items', None).count() if hasattr(order, 'items') else 0
                created_iso = order.created_at.isoformat() if getattr(order, 'created_at', None) else ''
                data.append({
                    'id': order.id,
                    'customer': customer,
                    'status': order.status,
                    'total': total,
                    'items_count': items_count,
                    'created_at': created_iso,
                })
            except Exception:
                # Ignora pedidos com dados inválidos, evita 500 no dashboard
                continue
        return Response(data)
    except Exception:
        # Fallback hardening: nunca quebrar o dashboard
        return Response([])


@api_view(['GET'])
@permission_classes([IsAdminUser])
def order_status_distribution(request):
    """
    Retorna distribuição de pedidos por status
    """
    distribution = Order.objects.values('status').annotate(
        count=Count('id'),
        total=Sum('total_amount')
    ).order_by('-count')
    
    return Response([{
        'status': item['status'],
        'count': item['count'],
        'total': float(item['total'] or 0)
    } for item in distribution])


@api_view(['GET'])
@permission_classes([IsAdminUser])
def monthly_revenue(request):
    """
    Retorna receita mensal dos últimos 12 meses
    """
    twelve_months_ago = timezone.now().date() - timedelta(days=365)
    
    monthly_data = Order.objects.filter(
        status='paid',
        created_at__date__gte=twelve_months_ago
    ).annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        revenue=Sum('total_amount'),
        orders=Count('id')
    ).order_by('month')
    
    return Response([{
        'month': item['month'].strftime('%b/%Y'),
        'revenue': float(item['revenue']),
        'orders': item['orders']
    } for item in monthly_data])
