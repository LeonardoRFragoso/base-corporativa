from django.urls import path
from . import views

urlpatterns = [
    path('create-preference/', views.create_preference, name='create_preference'),
    path('webhook/', views.webhook, name='webhook'),
    path('test-credentials/', views.test_mercadopago_credentials, name='test_credentials'),
]
