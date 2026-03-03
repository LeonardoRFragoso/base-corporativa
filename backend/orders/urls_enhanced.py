"""
URLs adicionais para pedidos
"""
from django.urls import path
from . import views_enhanced

urlpatterns = [
    path('<int:order_id>/cancel/', views_enhanced.cancel_order, name='order_cancel'),
    path('<int:order_id>/track/', views_enhanced.track_order, name='order_track'),
    path('summary/', views_enhanced.order_summary, name='order_summary'),
    path('bulk-update-status/', views_enhanced.bulk_update_order_status, name='bulk_update_status'),
]
