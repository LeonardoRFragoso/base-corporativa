from django.urls import path
from .views import (
    ProductReviewListCreateView,
    ReviewListView,
    ReviewDetailView,
    moderate_review,
    bulk_approve_reviews,
    bulk_reject_reviews
)
from . import views_enhanced

urlpatterns = [
    path('', ReviewListView.as_view(), name='review_list'),  # Admin: lista todas
    path('<int:pk>/', ReviewDetailView.as_view(), name='review_detail'),  # Admin: detalhes
    path('<int:pk>/moderate/', moderate_review, name='review_moderate'),  # Admin: moderar
    path('bulk-approve/', bulk_approve_reviews, name='bulk_approve'),  # Admin: aprovar em massa
    path('bulk-reject/', bulk_reject_reviews, name='bulk_reject'),  # Admin: rejeitar em massa
    path('product/<int:product_id>/', ProductReviewListCreateView.as_view(), name='product_reviews'),  # Público
    
    # Enhanced endpoints
    path('<int:review_id>/helpful/', views_enhanced.mark_review_helpful, name='review_helpful'),
    path('<int:review_id>/report/', views_enhanced.report_review, name='review_report'),
    path('product/<int:product_id>/stats/', views_enhanced.review_stats, name='review_stats'),
    path('user/reviews/', views_enhanced.user_reviews, name='user_reviews'),
    path('product/<int:product_id>/can-review/', views_enhanced.can_review_product, name='can_review'),
]
