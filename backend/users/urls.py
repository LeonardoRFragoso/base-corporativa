from django.urls import path
from .views import (
    RegisterView, ProfileView, LogoutView, PasswordResetView,
    WishlistListCreateView, WishlistDeleteView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/password-reset/', PasswordResetView.as_view(), name='auth_password_reset'),
    path('user/profile/', ProfileView.as_view(), name='user_profile'),
    path('user/wishlist/', WishlistListCreateView.as_view(), name='user_wishlist_list_create'),
    path('user/wishlist/<int:product_id>/', WishlistDeleteView.as_view(), name='user_wishlist_delete'),
]
