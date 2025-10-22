from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer


class ProductReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return Review.objects.filter(product_id=product_id).select_related('user')

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(product_id=product_id, user=user)
