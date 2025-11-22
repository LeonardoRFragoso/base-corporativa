from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Min, Max, Count, Avg
from .models import Product, ProductVariant, Category
from .serializers import ProductSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def advanced_search(request):
    """
    Busca avançada de produtos com múltiplos filtros
    
    Query params:
    - q: termo de busca (nome, descrição, categoria)
    - category: ID da categoria
    - min_price: preço mínimo
    - max_price: preço máximo
    - size: tamanhos (pode ser múltiplo, separado por vírgula)
    - color: cores (pode ser múltiplo, separado por vírgula)
    - in_stock: apenas produtos em estoque (true/false)
    - sort_by: ordenação (price_asc, price_desc, name, newest, popular)
    - limit: limite de resultados (default: 20)
    - offset: offset para paginação (default: 0)
    """
    
    # Base queryset
    products = Product.objects.filter(is_active=True).prefetch_related('variants', 'images', 'category')
    
    # 1. Busca por texto
    search_query = request.GET.get('q', '').strip()
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(category__name__icontains=search_query) |
            Q(fabric_type__icontains=search_query)
        )
    
    # 2. Filtro por categoria
    category_id = request.GET.get('category')
    if category_id:
        try:
            products = products.filter(category_id=int(category_id))
        except ValueError:
            pass
    
    # 3. Filtro por faixa de preço
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    
    if min_price:
        try:
            products = products.filter(base_price__gte=float(min_price))
        except ValueError:
            pass
    
    if max_price:
        try:
            products = products.filter(base_price__lte=float(max_price))
        except ValueError:
            pass
    
    # 4. Filtro por tamanho
    sizes = request.GET.get('size', '').strip()
    if sizes:
        size_list = [s.strip() for s in sizes.split(',') if s.strip()]
        if size_list:
            products = products.filter(variants__size__in=size_list).distinct()
    
    # 5. Filtro por cor
    colors = request.GET.get('color', '').strip()
    if colors:
        color_list = [c.strip() for c in colors.split(',') if c.strip()]
        if color_list:
            products = products.filter(variants__color__in=color_list).distinct()
    
    # 6. Filtro por disponibilidade em estoque
    in_stock = request.GET.get('in_stock', '').lower()
    if in_stock == 'true':
        products = products.filter(variants__stock__gt=0).distinct()
    
    # 7. Ordenação
    sort_by = request.GET.get('sort_by', 'newest')
    
    if sort_by == 'price_asc':
        products = products.order_by('base_price')
    elif sort_by == 'price_desc':
        products = products.order_by('-base_price')
    elif sort_by == 'name':
        products = products.order_by('name')
    elif sort_by == 'newest':
        products = products.order_by('-created_at')
    elif sort_by == 'popular':
        # Ordenar por número de vendas (requer join com OrderItem)
        from orders.models import OrderItem
        products = products.annotate(
            sales_count=Count('variants__orderitem', filter=Q(variants__orderitem__order__status='paid'))
        ).order_by('-sales_count')
    
    # Total antes da paginação
    total_count = products.count()
    
    # 8. Paginação
    try:
        limit = int(request.GET.get('limit', 20))
        offset = int(request.GET.get('offset', 0))
    except ValueError:
        limit = 20
        offset = 0
    
    # Limitar resultados
    limit = min(limit, 100)  # Máximo 100 por requisição
    paginated_products = products[offset:offset + limit]
    
    # Serializar
    serializer = ProductSerializer(paginated_products, many=True)
    
    return Response({
        'count': total_count,
        'next': offset + limit if offset + limit < total_count else None,
        'previous': offset - limit if offset > 0 else None,
        'results': serializer.data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def autocomplete_search(request):
    """
    Autocomplete para busca - retorna sugestões rápidas
    
    Query param:
    - q: termo de busca (mínimo 2 caracteres)
    - limit: limite de sugestões (default: 10)
    """
    search_query = request.GET.get('q', '').strip()
    
    if len(search_query) < 2:
        return Response({'suggestions': []})
    
    limit = min(int(request.GET.get('limit', 10)), 20)
    
    # Buscar produtos
    products = Product.objects.filter(
        is_active=True
    ).filter(
        Q(name__icontains=search_query) |
        Q(category__name__icontains=search_query)
    )[:limit]
    
    suggestions = []
    for product in products:
        suggestions.append({
            'id': product.id,
            'name': product.name,
            'category': product.category.name if product.category else '',
            'price': float(product.base_price),
            'image': product.images.first().image.url if product.images.exists() else None
        })
    
    return Response({'suggestions': suggestions})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_filter_options(request):
    """
    Retorna todas as opções disponíveis para filtros
    Útil para popular dropdowns e checkboxes no frontend
    """
    # Categorias
    categories = Category.objects.all().values('id', 'name')
    
    # Faixa de preços (min e max)
    price_range = Product.objects.filter(is_active=True).aggregate(
        min_price=Min('base_price'),
        max_price=Max('base_price')
    )
    
    # Tamanhos disponíveis
    sizes = ProductVariant.objects.filter(
        product__is_active=True,
        stock__gt=0
    ).values_list('size', flat=True).distinct().order_by('size')
    
    # Cores disponíveis
    colors = ProductVariant.objects.filter(
        product__is_active=True,
        stock__gt=0
    ).values_list('color', flat=True).distinct().order_by('color')
    
    # Tipos de tecido
    fabric_types = Product.objects.filter(
        is_active=True,
        fabric_type__isnull=False
    ).exclude(fabric_type='').values_list('fabric_type', flat=True).distinct()
    
    return Response({
        'categories': list(categories),
        'price_range': {
            'min': float(price_range['min_price'] or 0),
            'max': float(price_range['max_price'] or 0)
        },
        'sizes': list(filter(None, sizes)),
        'colors': list(filter(None, colors)),
        'fabric_types': list(fabric_types),
        'sort_options': [
            {'value': 'newest', 'label': 'Mais Recentes'},
            {'value': 'popular', 'label': 'Mais Populares'},
            {'value': 'price_asc', 'label': 'Menor Preço'},
            {'value': 'price_desc', 'label': 'Maior Preço'},
            {'value': 'name', 'label': 'Nome A-Z'},
        ]
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def trending_searches(request):
    """
    Retorna termos de busca populares
    (Simulado - em produção, armazenar em cache/banco)
    """
    # TODO: Implementar analytics de busca real
    trending = [
        'Camisa Polo',
        'Calça Social',
        'Blazer',
        'Camisa Social',
        'Terno',
    ]
    
    return Response({'trending': trending})


@api_view(['POST'])
@permission_classes([AllowAny])
def log_search(request):
    """
    Registra uma busca para analytics
    
    Body:
    {
        "query": "camisa polo",
        "results_count": 15,
        "user_id": 123 // opcional
    }
    """
    query = request.data.get('query', '').strip()
    results_count = request.data.get('results_count', 0)
    user_id = request.data.get('user_id')
    
    if query:
        # TODO: Salvar em modelo SearchLog para analytics
        logger.info(f"Search logged: '{query}' ({results_count} results) - User: {user_id}")
    
    return Response({'status': 'logged'})
