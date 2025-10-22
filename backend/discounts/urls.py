from django.urls import path
from .views import DiscountValidateView, DiscountListCreateView, DiscountDetailView

urlpatterns = [
    path('validate/', DiscountValidateView.as_view(), name='discount_validate'),
    path('', DiscountListCreateView.as_view(), name='discounts_list_create'),
    path('<int:pk>/', DiscountDetailView.as_view(), name='discounts_detail'),
]
