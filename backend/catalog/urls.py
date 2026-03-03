from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import CategoryViewSet, ProductViewSet
from .debug_views import debug_product_update, debug_product_delete, debug_storage_info
from . import views_search
from . import views_products

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = router.urls + [
    # Debug endpoints
    path('debug/product-update/<int:pk>/', debug_product_update, name='debug-product-update'),
    path('debug/product-update/', debug_product_update, name='debug-product-create'),
    path('debug/product-delete/<int:pk>/', debug_product_delete, name='debug-product-delete'),
    path('debug/storage/', debug_storage_info, name='debug-storage'),
    
    # Advanced Search endpoints
    path('advanced-search/', views_search.advanced_search, name='advanced-search'),
    path('autocomplete/', views_search.autocomplete_search, name='autocomplete'),
    path('filter-options/', views_search.get_filter_options, name='filter-options'),
    path('trending-searches/', views_search.trending_searches, name='trending-searches'),
    path('log-search/', views_search.log_search, name='log-search'),
    
    # Enhanced Product endpoints
    path('products/featured/', views_products.featured_products, name='featured-products'),
    path('products/bestsellers/', views_products.bestsellers, name='bestsellers'),
    path('products/new-arrivals/', views_products.new_arrivals, name='new-arrivals'),
    path('products/<int:product_id>/related/', views_products.related_products, name='related-products'),
    path('products/<int:product_id>/view/', views_products.track_product_view, name='track-view'),
    path('products/<int:product_id>/stock/', views_products.check_stock_availability, name='check-stock'),
    path('products/recommendations/', views_products.personalized_recommendations, name='recommendations'),
]
