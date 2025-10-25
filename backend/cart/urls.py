from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_cart, name='cart_get'),
    path('add/', views.add_to_cart, name='cart_add'),
    path('sync/', views.sync_cart, name='cart_sync'),
    path('update/<int:item_id>/', views.update_item, name='cart_update'),
    path('remove/<int:item_id>/', views.remove_item, name='cart_remove'),
    path('clear/', views.clear_cart, name='cart_clear'),
]
