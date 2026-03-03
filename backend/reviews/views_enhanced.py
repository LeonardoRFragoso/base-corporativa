"""
Views aprimoradas para reviews - funcionalidades adicionais
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Avg, Q
from .models import Review, ReviewVote
from django.core.cache import cache


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_review_helpful(request, review_id):
    """
    Marcar review como útil
    """
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response(
            {'error': 'Review não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    user = request.user
    is_helpful = request.data.get('helpful', True)
    
    # Verificar se já votou
    vote, created = ReviewVote.objects.get_or_create(
        review=review,
        user=user,
        defaults={'is_helpful': is_helpful}
    )
    
    if not created:
        # Atualizar voto existente
        vote.is_helpful = is_helpful
        vote.save()
    
    # Contar votos
    helpful_count = ReviewVote.objects.filter(
        review=review, 
        is_helpful=True
    ).count()
    
    not_helpful_count = ReviewVote.objects.filter(
        review=review, 
        is_helpful=False
    ).count()
    
    return Response({
        'success': True,
        'helpful_count': helpful_count,
        'not_helpful_count': not_helpful_count
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_review(request, review_id):
    """
    Reportar review inapropriado
    """
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response(
            {'error': 'Review não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    reason = request.data.get('reason', '')
    
    if not reason:
        return Response(
            {'error': 'Motivo é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Criar report (pode ser um modelo separado)
    # Por enquanto, vamos apenas marcar para moderação
    review.approved = False
    review.save()
    
    # Aqui você pode criar um modelo ReviewReport para rastrear reports
    
    return Response({
        'success': True,
        'message': 'Review reportado com sucesso'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def review_stats(request, product_id):
    """
    Estatísticas de reviews de um produto
    """
    cache_key = f'review_stats_{product_id}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response(cached_data)
    
    reviews = Review.objects.filter(
        product_id=product_id,
        approved=True
    )
    
    # Calcular estatísticas
    total_reviews = reviews.count()
    
    if total_reviews == 0:
        stats = {
            'total_reviews': 0,
            'average_rating': 0,
            'rating_distribution': {
                '5': 0, '4': 0, '3': 0, '2': 0, '1': 0
            },
            'percentage_distribution': {
                '5': 0, '4': 0, '3': 0, '2': 0, '1': 0
            }
        }
    else:
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        
        # Distribuição por estrelas
        rating_counts = reviews.values('rating').annotate(
            count=Count('rating')
        ).order_by('-rating')
        
        distribution = {str(i): 0 for i in range(1, 6)}
        for item in rating_counts:
            distribution[str(item['rating'])] = item['count']
        
        # Calcular percentuais
        percentage_dist = {
            star: (count / total_reviews * 100) 
            for star, count in distribution.items()
        }
        
        stats = {
            'total_reviews': total_reviews,
            'average_rating': round(avg_rating, 2),
            'rating_distribution': distribution,
            'percentage_distribution': {
                k: round(v, 1) for k, v in percentage_dist.items()
            }
        }
    
    cache.set(cache_key, stats, 300)  # Cache por 5 minutos
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews(request):
    """
    Retorna todas as reviews do usuário
    """
    user = request.user
    reviews = Review.objects.filter(
        user=user
    ).select_related('product').order_by('-created_at')
    
    from .serializers import ReviewSerializer
    serializer = ReviewSerializer(reviews, many=True)
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def can_review_product(request, product_id):
    """
    Verifica se o usuário pode avaliar o produto
    (precisa ter comprado e não ter avaliado ainda)
    """
    user = request.user
    
    # Verificar se já avaliou
    already_reviewed = Review.objects.filter(
        user=user,
        product_id=product_id
    ).exists()
    
    if already_reviewed:
        return Response({
            'can_review': False,
            'reason': 'Você já avaliou este produto'
        })
    
    # Verificar se comprou
    from orders.models import OrderItem
    has_purchased = OrderItem.objects.filter(
        order__user=user,
        variant__product_id=product_id,
        order__status='paid'
    ).exists()
    
    if not has_purchased:
        return Response({
            'can_review': False,
            'reason': 'Você precisa comprar o produto para avaliá-lo'
        })
    
    return Response({
        'can_review': True
    })
