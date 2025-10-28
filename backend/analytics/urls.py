from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_overview, name='dashboard-overview'),
    path('sales-chart/', views.sales_chart, name='sales-chart'),
    path('top-products/', views.top_products, name='top-products'),
    path('low-stock/', views.low_stock_alert, name='low-stock-alert'),
    path('recent-orders/', views.recent_orders, name='recent-orders'),
    path('order-status/', views.order_status_distribution, name='order-status'),
    path('monthly-revenue/', views.monthly_revenue, name='monthly-revenue'),
]
