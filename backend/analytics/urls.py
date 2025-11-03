from django.urls import path
from . import views, exports

urlpatterns = [
    path('dashboard/', views.dashboard_overview, name='dashboard-overview'),
    path('sales-chart/', views.sales_chart, name='sales-chart'),
    path('top-products/', views.top_products, name='top-products'),
    path('low-stock/', views.low_stock_alert, name='low-stock-alert'),
    path('recent-orders/', views.recent_orders, name='recent-orders'),
    path('order-status/', views.order_status_distribution, name='order-status'),
    path('monthly-revenue/', views.monthly_revenue, name='monthly-revenue'),
    # Exports
    path('export/orders/', exports.export_orders_csv, name='export-orders'),
    path('export/products/', exports.export_products_csv, name='export-products'),
    path('export/customers/', exports.export_customers_csv, name='export-customers'),
    path('export/sales/', exports.export_sales_report_csv, name='export-sales'),
    path('export/low-stock/', exports.export_low_stock_csv, name='export-low-stock'),
]
