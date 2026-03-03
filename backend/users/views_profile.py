"""
Views para gerenciamento de perfil de usuário
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import update_session_auth_hash
from .models import User
from .serializers import ProfileSerializer


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    GET: Retorna perfil do usuário
    PATCH: Atualiza perfil do usuário
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = ProfileSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = ProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            # Validar email único se estiver sendo alterado
            email = request.data.get('email')
            if email and email != user.email:
                if User.objects.filter(email=email).exists():
                    return Response(
                        {'error': 'Este e-mail já está em uso'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Trocar senha do usuário
    """
    user = request.user
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    # Validações
    if not all([old_password, new_password, confirm_password]):
        return Response(
            {'error': 'Todos os campos são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(old_password):
        return Response(
            {'error': 'Senha atual incorreta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_password != confirm_password:
        return Response(
            {'error': 'As senhas não coincidem'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'error': 'A senha deve ter no mínimo 8 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Atualizar senha
    user.set_password(new_password)
    user.save()
    
    # Manter usuário logado após trocar senha
    update_session_auth_hash(request, user)
    
    return Response({
        'success': True,
        'message': 'Senha alterada com sucesso'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Deletar conta do usuário (soft delete)
    """
    user = request.user
    password = request.data.get('password')
    
    if not password:
        return Response(
            {'error': 'Senha é obrigatória para deletar a conta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(password):
        return Response(
            {'error': 'Senha incorreta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Soft delete - desativar usuário ao invés de deletar
    user.is_active = False
    user.email = f"deleted_{user.id}_{user.email}"  # Liberar email
    user.save()
    
    return Response({
        'success': True,
        'message': 'Conta deletada com sucesso'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """
    Estatísticas do usuário
    """
    user = request.user
    
    from orders.models import Order
    from reviews.models import Review
    from wishlist.models import WishlistItem
    
    stats = {
        'total_orders': Order.objects.filter(user=user).count(),
        'total_spent': sum(
            order.total_amount 
            for order in Order.objects.filter(user=user, status='paid')
        ),
        'total_reviews': Review.objects.filter(user=user).count(),
        'wishlist_items': WishlistItem.objects.filter(user=user).count(),
        'member_since': user.date_joined.strftime('%Y-%m-%d'),
    }
    
    return Response(stats)
