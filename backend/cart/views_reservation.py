from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from catalog.models import ProductVariant
from .models_reservation import StockReservation, ReservationLog


@api_view(['POST'])
@permission_classes([AllowAny])
def create_stock_reservation(request):
    """
    Cria ou atualiza uma reserva de estoque
    
    Body:
    {
        "variant_id": 123,
        "quantity": 2,
        "session_key": "abc123" // Opcional se autenticado
    }
    """
    variant_id = request.data.get('variant_id')
    quantity = request.data.get('quantity', 1)
    session_key = request.data.get('session_key') or request.session.session_key
    user = request.user if request.user.is_authenticated else None
    
    if not variant_id:
        return Response({'error': 'variant_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        quantity = int(quantity)
        if quantity <= 0:
            return Response({'error': 'Quantidade deve ser maior que zero'}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({'error': 'Quantidade inválida'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        variant = ProductVariant.objects.get(id=variant_id)
    except ProductVariant.DoesNotExist:
        return Response({'error': 'Variante não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar estoque disponível
    reserved_quantity = StockReservation.get_reserved_quantity(variant)
    available_stock = variant.stock - reserved_quantity
    
    # Considera reserva existente do usuário
    existing_reservation = StockReservation.get_active_reservation(variant, session_key, user)
    if existing_reservation:
        available_stock += existing_reservation.quantity
    
    if quantity > available_stock:
        return Response({
            'error': f'Estoque insuficiente. Disponível: {available_stock}',
            'available': available_stock
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Criar ou atualizar reserva
    with transaction.atomic():
        reservation = StockReservation.create_reservation(
            variant=variant,
            quantity=quantity,
            session_key=session_key,
            user=user,
            minutes=15  # 15 minutos de reserva
        )
        
        # Log
        ReservationLog.objects.create(
            reservation=reservation,
            variant=variant,
            action='created' if not existing_reservation else 'extended',
            quantity=quantity,
            session_key=session_key or '',
            user=user,
            notes=f'Reserva {"criada" if not existing_reservation else "atualizada"} via API'
        )
    
    return Response({
        'reservation_id': reservation.id,
        'expires_at': reservation.expires_at.isoformat(),
        'quantity': reservation.quantity,
        'variant_id': variant.id,
        'available_stock': available_stock - quantity
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def extend_stock_reservation(request, reservation_id):
    """
    Estende o tempo de uma reserva existente
    """
    minutes = request.data.get('minutes', 15)
    
    reservation = StockReservation.extend_reservation(reservation_id, minutes)
    
    if not reservation:
        return Response({'error': 'Reserva não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    # Log
    ReservationLog.objects.create(
        reservation=reservation,
        variant=reservation.variant,
        action='extended',
        quantity=reservation.quantity,
        session_key=reservation.session_key,
        user=reservation.user,
        notes=f'Reserva estendida por {minutes} minutos'
    )
    
    return Response({
        'reservation_id': reservation.id,
        'expires_at': reservation.expires_at.isoformat(),
        'message': f'Reserva estendida por {minutes} minutos'
    })


@api_view(['DELETE'])
@permission_classes([AllowAny])
def cancel_stock_reservation(request, reservation_id):
    """
    Cancela uma reserva de estoque
    """
    try:
        reservation = StockReservation.objects.get(id=reservation_id)
        
        # Log antes de deletar
        ReservationLog.objects.create(
            reservation=None,
            variant=reservation.variant,
            action='cancelled',
            quantity=reservation.quantity,
            session_key=reservation.session_key,
            user=reservation.user,
            notes='Reserva cancelada pelo usuário'
        )
        
        reservation.delete()
        
        return Response({'message': 'Reserva cancelada'}, status=status.HTTP_200_OK)
    except StockReservation.DoesNotExist:
        return Response({'error': 'Reserva não encontrada'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_availability(request):
    """
    Verifica disponibilidade de estoque para uma variante
    
    Query params:
    - variant_id: ID da variante
    - quantity: Quantidade desejada (opcional, default 1)
    """
    variant_id = request.GET.get('variant_id')
    quantity = int(request.GET.get('quantity', 1))
    
    if not variant_id:
        return Response({'error': 'variant_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        variant = ProductVariant.objects.get(id=variant_id)
    except ProductVariant.DoesNotExist:
        return Response({'error': 'Variante não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    reserved_quantity = StockReservation.get_reserved_quantity(variant)
    available_stock = variant.stock - reserved_quantity
    
    return Response({
        'variant_id': variant.id,
        'total_stock': variant.stock,
        'reserved': reserved_quantity,
        'available': available_stock,
        'is_available': quantity <= available_stock,
        'requested_quantity': quantity
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def cleanup_expired_reservations(request):
    """
    Limpa reservas expiradas (para uso em cronjobs)
    Requer autenticação de admin em produção
    """
    # Em produção, adicionar permissão de admin
    # @permission_classes([IsAdminUser])
    
    expired_count = StockReservation.cleanup_expired()
    
    return Response({
        'message': f'{expired_count} reservas expiradas removidas',
        'count': expired_count
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_reservations(request):
    """
    Retorna as reservas ativas do usuário atual
    """
    session_key = request.session.session_key
    user = request.user if request.user.is_authenticated else None
    
    query = StockReservation.objects.filter(
        expires_at__gt=timezone.now(),
        order_id__isnull=True
    )
    
    if user:
        query = query.filter(user=user)
    elif session_key:
        query = query.filter(session_key=session_key)
    else:
        return Response({'reservations': []})
    
    reservations = []
    for res in query:
        reservations.append({
            'id': res.id,
            'variant_id': res.variant.id,
            'product_name': res.variant.product.name,
            'sku': res.variant.sku,
            'size': res.variant.size,
            'color': res.variant.color,
            'quantity': res.quantity,
            'expires_at': res.expires_at.isoformat(),
            'time_left_seconds': (res.expires_at - timezone.now()).total_seconds()
        })
    
    return Response({'reservations': reservations})


from django.utils import timezone
