from django.urls import path
from .views import ContactMessageCreateView, NewsletterSubscribeView

urlpatterns = [
    path('contact/', ContactMessageCreateView.as_view(), name='contact_create'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter_subscribe'),
]
