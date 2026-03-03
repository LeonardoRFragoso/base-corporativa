"""
URLs adicionais para carrinho
"""
from django.urls import path
from . import views_enhanced

urlpatterns = [
    path('merge/', views_enhanced.merge_cart, name='cart_merge'),
    path('count/', views_enhanced.cart_count, name='cart_count'),
    path('validate/', views_enhanced.validate_cart_stock, name='cart_validate'),
    path('add-validated/', views_enhanced.add_to_cart_with_validation, name='cart_add_validated'),
]
