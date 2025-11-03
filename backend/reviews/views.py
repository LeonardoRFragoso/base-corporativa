from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes as perm_classes
from .models import Review
from .serializers import ReviewSerializer, ReviewModerationSerializer


class ProductReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        # Apenas reviews aprovados para usuários não-admin
        qs = Review.objects.filter(product_id=product_id).select_related('user', 'product')
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(approved=True)
        return qs

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(product_id=product_id, user=user)


class ReviewListView(generics.ListAPIView):
    """Lista todas as reviews (apenas para admins)"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        qs = Review.objects.all().select_related('user', 'product').order_by('-created_at')
        
        # Filtros opcionais
        approved = self.request.query_params.get('approved')
        if approved is not None:
            qs = qs.filter(approved=approved.lower() == 'true')
        
        rating = self.request.query_params.get('rating')
        if rating:
            qs = qs.filter(rating=int(rating))
        
        return qs


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalhes, atualização e exclusão de review (apenas admins)"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]


@api_view(['PATCH'])
@perm_classes([permissions.IsAdminUser])
def moderate_review(request, pk):
    """Endpoint específico para moderação de reviews"""
    try:
        review = Review.objects.get(pk=pk)
    except Review.DoesNotExist:
        return Response({'error': 'Review não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ReviewModerationSerializer(review, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(ReviewSerializer(review).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@perm_classes([permissions.IsAdminUser])
def bulk_approve_reviews(request):
    """Aprovar múltiplas reviews de uma vez"""
    review_ids = request.data.get('review_ids', [])
    if not review_ids:
        return Response({'error': 'review_ids é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
    
    updated = Review.objects.filter(id__in=review_ids).update(approved=True)
    return Response({'updated': updated, 'message': f'{updated} review(s) aprovada(s)'})


@api_view(['POST'])
@perm_classes([permissions.IsAdminUser])
def bulk_reject_reviews(request):
    """Rejeitar múltiplas reviews de uma vez"""
    review_ids = request.data.get('review_ids', [])
    if not review_ids:
        return Response({'error': 'review_ids é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
    
    updated = Review.objects.filter(id__in=review_ids).update(approved=False)
    return Response({'updated': updated, 'message': f'{updated} review(s) rejeitada(s)'})
