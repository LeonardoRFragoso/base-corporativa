from django.urls import path
from .views import (
    RegisterView, ProfileView, LogoutView,
    PasswordResetRequestView, PasswordResetConfirmView,
    EmailVerificationView, ResendVerificationEmailView,
    WishlistListCreateView, WishlistDeleteView,
    EmailOrUsernameTokenObtainPairView, UserListView,
)

urlpatterns = [
    path('auth/login/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='auth_password_reset_request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='auth_password_reset_confirm'),
    path('auth/verify-email/', EmailVerificationView.as_view(), name='auth_verify_email'),
    path('auth/resend-verification/', ResendVerificationEmailView.as_view(), name='auth_resend_verification'),
    path('user/profile/', ProfileView.as_view(), name='user_profile'),
    path('user/wishlist/', WishlistListCreateView.as_view(), name='user_wishlist_list_create'),
    path('user/wishlist/<int:product_id>/', WishlistDeleteView.as_view(), name='user_wishlist_delete'),
    path('users/', UserListView.as_view(), name='user_list'),
]
