"""
Views aprimoradas para pedidos
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Order


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    """
    Cancelar pedido (apenas se ainda não foi enviado)
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Pedido não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verificar se é o dono do pedido ou admin
    if order.user != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Você não tem permissão para cancelar este pedido'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Verificar se pode cancelar
    if order.status in ['shipped', 'delivered']:
        return Response(
            {'error': 'Não é possível cancelar pedidos já enviados'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if order.status == 'canceled':
        return Response(
            {'error': 'Pedido já está cancelado'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Cancelar pedido
    order.status = 'canceled'
    order.save()
    
    # Aqui você pode adicionar lógica para:
    # - Devolver estoque
    # - Processar reembolso
    # - Enviar email de confirmação
    
    return Response({
        'success': True,
        'message': 'Pedido cancelado com sucesso',
        'order_id': order.id,
        'status': order.status
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_order(request, order_id):
    """
    Rastrear pedido
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Pedido não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verificar permissão
    if order.user != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Você não tem permissão para rastrear este pedido'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Timeline do pedido
    timeline = [
        {
            'status': 'pending',
            'label': 'Pedido Recebido',
            'completed': True,
            'date': order.created_at.strftime('%d/%m/%Y %H:%M')
        },
        {
            'status': 'paid',
            'label': 'Pagamento Confirmado',
            'completed': order.status in ['paid', 'shipped', 'delivered'],
            'date': order.updated_at.strftime('%d/%m/%Y %H:%M') if order.status != 'pending' else None
        },
        {
            'status': 'shipped',
            'label': 'Pedido Enviado',
            'completed': order.status in ['shipped', 'delivered'],
            'date': order.updated_at.strftime('%d/%m/%Y %H:%M') if order.status in ['shipped', 'delivered'] else None
        },
        {
            'status': 'delivered',
            'label': 'Pedido Entregue',
            'completed': order.status == 'delivered',
            'date': order.updated_at.strftime('%d/%m/%Y %H:%M') if order.status == 'delivered' else None
        }
    ]
    
    tracking_info = {
        'order_id': order.id,
        'status': order.status,
        'tracking_code': order.tracking_code,
        'carrier': order.shipping_carrier,
        'timeline': timeline,
        'estimated_delivery': None,  # Pode ser calculado baseado no método de envio
        'can_cancel': order.status not in ['shipped', 'delivered', 'canceled']
    }
    
    return Response(tracking_info)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_summary(request):
    """
    Resumo de pedidos do usuário
    """
    user = request.user
    
    orders = Order.objects.filter(user=user)
    
    summary = {
        'total_orders': orders.count(),
        'pending': orders.filter(status='pending').count(),
        'paid': orders.filter(status='paid').count(),
        'shipped': orders.filter(status='shipped').count(),
        'delivered': orders.filter(status='delivered').count(),
        'canceled': orders.filter(status='canceled').count(),
        'failed': orders.filter(status='failed').count(),
        'total_spent': sum(
            order.total_amount 
            for order in orders.filter(status__in=['paid', 'shipped', 'delivered'])
        ),
        'recent_orders': [
            {
                'id': order.id,
                'status': order.status,
                'total': float(order.total_amount),
                'date': order.created_at.strftime('%d/%m/%Y')
            }
            for order in orders.order_by('-created_at')[:5]
        ]
    }
    
    return Response(summary)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_update_order_status(request):
    """
    Atualizar status de múltiplos pedidos (admin)
    """
    order_ids = request.data.get('order_ids', [])
    new_status = request.data.get('status')
    
    if not order_ids or not new_status:
        return Response(
            {'error': 'order_ids e status são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    valid_statuses = ['pending', 'paid', 'shipped', 'delivered', 'failed', 'canceled']
    if new_status not in valid_statuses:
        return Response(
            {'error': f'Status inválido. Use: {", ".join(valid_statuses)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    updated = Order.objects.filter(id__in=order_ids).update(
        status=new_status,
        updated_at=timezone.now()
    )
    
    return Response({
        'success': True,
        'updated': updated,
        'message': f'{updated} pedido(s) atualizado(s) para {new_status}'
    })
