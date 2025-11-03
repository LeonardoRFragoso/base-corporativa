from django.urls import path
from .views import (
    ProductReviewListCreateView,
    ReviewListView,
    ReviewDetailView,
    moderate_review,
    bulk_approve_reviews,
    bulk_reject_reviews
)

urlpatterns = [
    path('', ReviewListView.as_view(), name='review_list'),  # Admin: lista todas
    path('<int:pk>/', ReviewDetailView.as_view(), name='review_detail'),  # Admin: detalhes
    path('<int:pk>/moderate/', moderate_review, name='review_moderate'),  # Admin: moderar
    path('bulk-approve/', bulk_approve_reviews, name='bulk_approve'),  # Admin: aprovar em massa
    path('bulk-reject/', bulk_reject_reviews, name='bulk_reject'),  # Admin: rejeitar em massa
    path('product/<int:product_id>/', ProductReviewListCreateView.as_view(), name='product_reviews'),  # Público
]
