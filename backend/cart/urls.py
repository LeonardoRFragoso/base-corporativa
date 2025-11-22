from django.urls import path
from . import views
from . import views_reservation

urlpatterns = [
    # Cart endpoints
    path('', views.get_cart, name='cart_get'),
    path('add/', views.add_to_cart, name='cart_add'),
    path('sync/', views.sync_cart, name='cart_sync'),
    path('update/<int:item_id>/', views.update_item, name='cart_update'),
    path('remove/<int:item_id>/', views.remove_item, name='cart_remove'),
    path('clear/', views.clear_cart, name='cart_clear'),
    
    # Stock Reservation endpoints
    path('reservation/', views_reservation.create_stock_reservation, name='reservation_create'),
    path('reservation/<int:reservation_id>/extend/', views_reservation.extend_stock_reservation, name='reservation_extend'),
    path('reservation/<int:reservation_id>/', views_reservation.cancel_stock_reservation, name='reservation_cancel'),
    path('check-availability/', views_reservation.check_availability, name='check_availability'),
    path('my-reservations/', views_reservation.get_user_reservations, name='my_reservations'),
    path('cleanup-reservations/', views_reservation.cleanup_expired_reservations, name='cleanup_reservations'),
]
