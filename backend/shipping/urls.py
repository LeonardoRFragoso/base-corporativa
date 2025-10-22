from django.urls import path
from . import views

urlpatterns = [
    path('quote/', views.quote, name='shipping_quote'),
    path('oauth/start/', views.oauth_start, name='shipping_oauth_start'),
    path('oauth/callback/', views.oauth_callback, name='shipping_oauth_callback'),
]
