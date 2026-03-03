"""
URLs adicionais para perfil de usuário
"""
from django.urls import path
from . import views_profile

urlpatterns = [
    path('profile/', views_profile.user_profile, name='user_profile'),
    path('profile/change-password/', views_profile.change_password, name='change_password'),
    path('profile/delete/', views_profile.delete_account, name='delete_account'),
    path('profile/stats/', views_profile.user_stats, name='user_stats'),
]
