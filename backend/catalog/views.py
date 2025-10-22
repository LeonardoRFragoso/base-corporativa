from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    queryset = (
        Product.objects.filter(is_active=True)
        .select_related('category')
        .prefetch_related('variants', 'images')
    )

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'category__slug': ['exact'],
        'category': ['exact'],
        'fabric_type': ['exact'],
        'variants__size': ['exact'],
        'variants__color': ['exact'],
        'base_price': ['gte', 'lte'],
        'is_active': ['exact'],
    }
    search_fields = ['name', 'description', 'fabric_type']
    ordering_fields = ['created_at', 'base_price', 'name']
    ordering = ['-created_at']
