from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlashSaleViewSet

router = DefaultRouter()
router.register(r'flash-sales', FlashSaleViewSet, basename='flashsale')

urlpatterns = [
    path('', include(router.urls)),
]
