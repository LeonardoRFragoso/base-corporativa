from django.urls import path
from .views import AddressListCreateView, AddressDetailView

urlpatterns = [
    path('', AddressListCreateView.as_view(), name='addresses_list_create'),
    path('<int:pk>/', AddressDetailView.as_view(), name='addresses_detail'),
]
