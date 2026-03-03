"""
Views aprimoradas para wishlist
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import WishlistItem
from catalog.models import Product


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request, product_id):
    """
    Toggle produto na wishlist (adiciona se não existe, remove se existe)
    """
    user = request.user
    
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Produto não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    wishlist_item = WishlistItem.objects.filter(
        user=user,
        product=product
    ).first()
    
    if wishlist_item:
        # Remove da wishlist
        wishlist_item.delete()
        return Response({
            'in_wishlist': False,
            'message': 'Produto removido da wishlist'
        })
    else:
        # Adiciona à wishlist
        WishlistItem.objects.create(
            user=user,
            product=product
        )
        return Response({
            'in_wishlist': True,
            'message': 'Produto adicionado à wishlist'
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_in_wishlist(request, product_id):
    """
    Verifica se produto está na wishlist do usuário
    """
    user = request.user
    
    in_wishlist = WishlistItem.objects.filter(
        user=user,
        product_id=product_id
    ).exists()
    
    return Response({
        'in_wishlist': in_wishlist
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_count(request):
    """
    Retorna quantidade de itens na wishlist
    """
    user = request.user
    count = WishlistItem.objects.filter(user=user).count()
    
    return Response({
        'count': count
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_wishlist(request):
    """
    Limpa toda a wishlist do usuário
    """
    user = request.user
    deleted_count = WishlistItem.objects.filter(user=user).delete()[0]
    
    return Response({
        'success': True,
        'deleted_count': deleted_count,
        'message': f'{deleted_count} item(s) removido(s) da wishlist'
    })
