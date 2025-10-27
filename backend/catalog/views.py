from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductImage, ProductVariant
from .serializers import CategorySerializer, ProductSerializer, ProductWriteSerializer, ProductImageSerializer
from django.shortcuts import get_object_or_404


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]

    def get_authentication_classes(self):
        """
        Remove authentication for public actions (list, retrieve)
        to prevent 401 errors when invalid tokens are sent
        """
        if self.action in ['list', 'retrieve']:
            return []
        return super().get_authentication_classes()

    def get_queryset(self):
        qs = Product.objects.all().select_related('category').prefetch_related('variants', 'images')
        if self.action in ['list', 'retrieve'] and not (self.request and self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'upload_image', 'delete_image']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

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

    @action(detail=True, methods=['post'], url_path='upload-image', parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        product = self.get_object()
        image = request.data.get('image')
        if not image:
            return Response({'error': 'image é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        variant_id = request.data.get('variant')
        variant = None
        if variant_id:
            try:
                variant = ProductVariant.objects.get(id=variant_id, product=product)
            except ProductVariant.DoesNotExist:
                return Response({'error': 'variant inválido'}, status=status.HTTP_400_BAD_REQUEST)
        alt_text = request.data.get('alt_text') or ''
        is_primary = str(request.data.get('is_primary', '')).lower() in ['1', 'true', 't', 'yes', 'y']
        try:
            sort_order = int(request.data.get('sort_order', '0'))
        except ValueError:
            sort_order = 0
        obj = ProductImage.objects.create(
            product=product,
            variant=variant,
            image=image,
            alt_text=alt_text,
            is_primary=is_primary,
            sort_order=sort_order,
        )
        return Response(ProductImageSerializer(obj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path=r'images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        product = self.get_object()
        img = get_object_or_404(ProductImage, id=image_id, product=product)
        if img.image:
            try:
                img.image.delete(save=False)
            except Exception as e:
                # Log error but continue with deletion
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to delete image file {img.image.name}: {e}")
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
