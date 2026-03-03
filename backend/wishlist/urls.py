from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WishlistViewSet
from . import views_enhanced

router = DefaultRouter()
router.register(r'', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
    
    # Enhanced endpoints
    path('toggle/<int:product_id>/', views_enhanced.toggle_wishlist, name='wishlist_toggle'),
    path('check/<int:product_id>/', views_enhanced.check_in_wishlist, name='wishlist_check'),
    path('count/', views_enhanced.wishlist_count, name='wishlist_count'),
    path('clear/', views_enhanced.clear_wishlist, name='wishlist_clear'),
]
