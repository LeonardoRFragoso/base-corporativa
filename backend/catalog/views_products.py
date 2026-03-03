"""
Views adicionais para produtos - endpoints críticos faltantes
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Avg, Q, F
from .models import Product, ProductVariant
from .serializers import ProductSerializer
from orders.models import OrderItem
from django.core.cache import cache


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """
    Retorna produtos em destaque
    """
    cache_key = 'featured_products'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    # Produtos com is_featured=True ou mais vendidos
    products = Product.objects.filter(
        is_active=True
    ).select_related('category').prefetch_related(
        'variants', 'images'
    ).annotate(
        total_sold=Count('variants__orderitem')
    ).order_by('-total_sold')[:12]
    
    serializer = ProductSerializer(products, many=True)
    cache.set(cache_key, serializer.data, 300)  # Cache por 5 minutos
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def bestsellers(request):
    """
    Retorna produtos mais vendidos
    """
    cache_key = 'bestseller_products'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    # Produtos com mais vendas
    products = Product.objects.filter(
        is_active=True
    ).select_related('category').prefetch_related(
        'variants', 'images'
    ).annotate(
        total_sold=Count('variants__orderitem')
    ).filter(
        total_sold__gt=0
    ).order_by('-total_sold')[:12]
    
    serializer = ProductSerializer(products, many=True)
    cache.set(cache_key, serializer.data, 600)  # Cache por 10 minutos
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def new_arrivals(request):
    """
    Retorna produtos mais recentes
    """
    cache_key = 'new_arrivals'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    products = Product.objects.filter(
        is_active=True
    ).select_related('category').prefetch_related(
        'variants', 'images'
    ).order_by('-created_at')[:12]
    
    serializer = ProductSerializer(products, many=True)
    cache.set(cache_key, serializer.data, 300)
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def related_products(request, product_id):
    """
    Retorna produtos relacionados baseado em categoria e tags
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Produto não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    cache_key = f'related_products_{product_id}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    # Produtos da mesma categoria, excluindo o produto atual
    related = Product.objects.filter(
        category=product.category,
        is_active=True
    ).exclude(
        id=product_id
    ).select_related('category').prefetch_related(
        'variants', 'images'
    ).order_by('?')[:6]  # Aleatório
    
    serializer = ProductSerializer(related, many=True)
    cache.set(cache_key, serializer.data, 600)
    
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_product_view(request, product_id):
    """
    Registra visualização de produto para analytics
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Produto não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Incrementar contador de visualizações (pode ser implementado com Redis)
    cache_key = f'product_views_{product_id}'
    views = cache.get(cache_key, 0)
    cache.set(cache_key, views + 1, None)  # Sem expiração
    
    # Log para analytics (pode ser enviado para serviço externo)
    user_id = request.user.id if request.user.is_authenticated else None
    session_key = request.session.session_key
    
    # Aqui você pode salvar em um modelo de Analytics ou enviar para serviço externo
    
    return Response({
        'success': True,
        'views': views + 1
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def personalized_recommendations(request):
    """
    Retorna recomendações personalizadas baseadas no histórico do usuário
    """
    user = request.user
    
    # Buscar categorias dos produtos já comprados
    purchased_categories = OrderItem.objects.filter(
        order__user=user
    ).values_list('variant__product__category', flat=True).distinct()
    
    if not purchased_categories:
        # Se não tem compras, retorna bestsellers
        return bestsellers(request)
    
    # Produtos das categorias que o usuário já comprou
    recommendations = Product.objects.filter(
        category__in=purchased_categories,
        is_active=True
    ).select_related('category').prefetch_related(
        'variants', 'images'
    ).exclude(
        # Excluir produtos já comprados
        variants__orderitem__order__user=user
    ).annotate(
        avg_rating=Avg('reviews__rating')
    ).order_by('-avg_rating', '-created_at')[:12]
    
    serializer = ProductSerializer(recommendations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_stock_availability(request, product_id):
    """
    Verifica disponibilidade de estoque para um produto
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Produto não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    variants = product.variants.all()
    
    availability = {
        'product_id': product_id,
        'in_stock': any(v.stock > 0 for v in variants),
        'total_stock': sum(v.stock for v in variants),
        'variants': [
            {
                'id': v.id,
                'size': v.size,
                'color': v.color,
                'stock': v.stock,
                'available': v.stock > 0
            }
            for v in variants
        ]
    }
    
    return Response(availability)
