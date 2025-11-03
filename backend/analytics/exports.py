import csv
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from orders.models import Order, OrderItem
from catalog.models import Product, ProductVariant
from users.models import User


@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_orders_csv(request):
    """Exporta pedidos em CSV"""
    # Filtros opcionais
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    status = request.GET.get('status')
    
    orders = Order.objects.all().select_related('user').order_by('-created_at')
    
    if start_date:
        orders = orders.filter(created_at__date__gte=start_date)
    if end_date:
        orders = orders.filter(created_at__date__lte=end_date)
    if status:
        orders = orders.filter(status=status)
    
    # Criar resposta CSV
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="pedidos_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    # BOM para Excel reconhecer UTF-8
    response.write('\ufeff')
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Data', 'Cliente', 'Email', 'Status', 'Total', 
        'Frete', 'Desconto', 'Cupom', 'MP Payment ID', 'CEP'
    ])
    
    for order in orders:
        writer.writerow([
            order.id,
            order.created_at.strftime('%d/%m/%Y %H:%M'),
            f"{order.first_name} {order.last_name}",
            order.email,
            order.status,
            f"{order.total_amount:.2f}",
            f"{order.shipping_price:.2f}",
            f"{order.discount_amount:.2f}",
            order.coupon_code,
            order.mp_payment_id,
            order.destination_zip
        ])
    
    return response


@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_products_csv(request):
    """Exporta produtos e estoque em CSV"""
    products = Product.objects.all().prefetch_related('variants').order_by('name')
    
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="produtos_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    response.write('\ufeff')
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Nome', 'Categoria', 'Preço Base', 'Ativo', 
        'SKU', 'Tamanho', 'Cor', 'Preço Variante', 'Estoque'
    ])
    
    for product in products:
        for variant in product.variants.all():
            writer.writerow([
                product.id,
                product.name,
                product.category.name if product.category else '',
                f"{product.base_price:.2f}",
                'Sim' if product.is_active else 'Não',
                variant.sku,
                variant.size,
                variant.color,
                f"{variant.price or product.base_price:.2f}",
                variant.stock
            ])
    
    return response


@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_customers_csv(request):
    """Exporta clientes em CSV"""
    customers = User.objects.filter(is_staff=False).order_by('-date_joined')
    
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="clientes_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    response.write('\ufeff')
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Nome', 'Email', 'Username', 'Ativo', 
        'Email Verificado', 'Data Cadastro', 'Total Pedidos'
    ])
    
    for customer in customers:
        total_orders = Order.objects.filter(user=customer).count()
        writer.writerow([
            customer.id,
            f"{customer.first_name} {customer.last_name}",
            customer.email,
            customer.username,
            'Sim' if customer.is_active else 'Não',
            'Sim' if customer.email_verified else 'Não',
            customer.date_joined.strftime('%d/%m/%Y'),
            total_orders
        ])
    
    return response


@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_sales_report_csv(request):
    """Exporta relatório de vendas detalhado"""
    days = int(request.GET.get('days', 30))
    start_date = timezone.now().date() - timedelta(days=days)
    
    orders = Order.objects.filter(
        status='paid',
        created_at__date__gte=start_date
    ).prefetch_related('items').order_by('-created_at')
    
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="vendas_{days}dias_{timezone.now().strftime("%Y%m%d")}.csv"'
    response.write('\ufeff')
    
    writer = csv.writer(response)
    writer.writerow([
        'Data', 'Pedido ID', 'Cliente', 'Produto', 'Quantidade', 
        'Preço Unitário', 'Subtotal', 'Frete', 'Desconto', 'Total Pedido'
    ])
    
    for order in orders:
        for item in order.items.all():
            writer.writerow([
                order.created_at.strftime('%d/%m/%Y'),
                order.id,
                order.email,
                item.product_name,
                item.quantity,
                f"{item.unit_price:.2f}",
                f"{item.unit_price * item.quantity:.2f}",
                f"{order.shipping_price:.2f}",
                f"{order.discount_amount:.2f}",
                f"{order.total_amount:.2f}"
            ])
    
    return response


@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_low_stock_csv(request):
    """Exporta produtos com estoque baixo"""
    threshold = int(request.GET.get('threshold', 5))
    
    variants = ProductVariant.objects.filter(
        stock__lte=threshold
    ).select_related('product').order_by('stock', 'product__name')
    
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="estoque_baixo_{timezone.now().strftime("%Y%m%d")}.csv"'
    response.write('\ufeff')
    
    writer = csv.writer(response)
    writer.writerow([
        'Produto', 'SKU', 'Tamanho', 'Cor', 'Estoque', 'Status'
    ])
    
    for variant in variants:
        status = 'SEM ESTOQUE' if variant.stock == 0 else 'ESTOQUE BAIXO'
        writer.writerow([
            variant.product.name,
            variant.sku,
            variant.size,
            variant.color,
            variant.stock,
            status
        ])
    
    return response
