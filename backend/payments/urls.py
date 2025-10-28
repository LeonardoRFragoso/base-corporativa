from django.urls import path
from . import views

urlpatterns = [
    path('test-credentials/', views.test_mercadopago_credentials, name='test_mercadopago_credentials'),
    path('create-preference/', views.create_preference, name='create_preference'),
    path('webhook/', views.mercadopago_webhook, name='mercadopago_webhook'),
    path('create-pix/', views.create_pix_payment, name='create_pix_payment'),
    path('create-card-payment/', views.create_card_payment, name='create_card_payment'),
]
