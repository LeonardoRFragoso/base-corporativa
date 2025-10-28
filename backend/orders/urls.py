from django.urls import path
from .views import OrderListView, OrderDetailView, OrderCreateView, OrderStatusUpdateView

urlpatterns = [
    path('', OrderListView.as_view(), name='orders_list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='orders_detail'),
    path('<int:pk>/status/', OrderStatusUpdateView.as_view(), name='orders_status_update'),
    path('create/', OrderCreateView.as_view(), name='orders_create'),
]
