from django.urls import path
from .views import ProductReviewListCreateView

urlpatterns = [
    path('<int:product_id>/', ProductReviewListCreateView.as_view(), name='product_reviews'),
]
