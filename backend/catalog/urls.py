from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import CategoryViewSet, ProductViewSet
from .debug_views import debug_product_update, debug_storage_info

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = router.urls + [
    path('debug/product-update/<int:pk>/', debug_product_update, name='debug-product-update'),
    path('debug/product-update/', debug_product_update, name='debug-product-create'),
    path('debug/storage/', debug_storage_info, name='debug-storage'),
]
