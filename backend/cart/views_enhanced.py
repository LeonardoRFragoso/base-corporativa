"""
Views aprimoradas para carrinho
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Cart, CartItem
from catalog.models import ProductVariant


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merge_cart(request):
    """
    Mescla carrinho de guest com carrinho do usuário após login
    """
    user = request.user
    guest_session_key = request.data.get('session_key')
    
    if not guest_session_key:
        return Response(
            {'error': 'session_key é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            # Buscar carrinho guest
            guest_cart = Cart.objects.filter(
                session_key=guest_session_key,
                user__isnull=True
            ).first()
            
            if not guest_cart:
                return Response({
                    'success': True,
                    'message': 'Nenhum carrinho guest encontrado'
                })
            
            # Buscar ou criar carrinho do usuário
            user_cart, created = Cart.objects.get_or_create(user=user)
            
            # Mesclar itens
            merged_count = 0
            for guest_item in guest_cart.items.all():
                # Verificar se item já existe no carrinho do usuário
                user_item = user_cart.items.filter(
                    variant=guest_item.variant
                ).first()
                
                if user_item:
                    # Somar quantidades
                    user_item.quantity += guest_item.quantity
                    user_item.save()
                else:
                    # Mover item para carrinho do usuário
                    guest_item.cart = user_cart
                    guest_item.save()
                
                merged_count += 1
            
            # Deletar carrinho guest
            guest_cart.delete()
            
            return Response({
                'success': True,
                'merged_count': merged_count,
                'message': f'{merged_count} item(s) mesclado(s)'
            })
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def cart_count(request):
    """
    Retorna quantidade de itens no carrinho
    """
    user = request.user if request.user.is_authenticated else None
    session_key = request.headers.get('X-Session-Key')
    
    if user:
        cart = Cart.objects.filter(user=user).first()
    elif session_key:
        cart = Cart.objects.filter(session_key=session_key, user__isnull=True).first()
    else:
        return Response({'count': 0})
    
    if not cart:
        return Response({'count': 0})
    
    count = sum(item.quantity for item in cart.items.all())
    
    return Response({'count': count})


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_cart_stock(request):
    """
    Valida se todos os itens do carrinho têm estoque disponível
    """
    user = request.user if request.user.is_authenticated else None
    session_key = request.headers.get('X-Session-Key')
    
    if user:
        cart = Cart.objects.filter(user=user).first()
    elif session_key:
        cart = Cart.objects.filter(session_key=session_key, user__isnull=True).first()
    else:
        return Response(
            {'error': 'Carrinho não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not cart:
        return Response(
            {'error': 'Carrinho não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    out_of_stock = []
    insufficient_stock = []
    
    for item in cart.items.all():
        variant = item.variant
        
        if variant.stock == 0:
            out_of_stock.append({
                'item_id': item.id,
                'product_name': item.product_name,
                'size': variant.size,
                'color': variant.color
            })
        elif variant.stock < item.quantity:
            insufficient_stock.append({
                'item_id': item.id,
                'product_name': item.product_name,
                'requested': item.quantity,
                'available': variant.stock,
                'size': variant.size,
                'color': variant.color
            })
    
    is_valid = len(out_of_stock) == 0 and len(insufficient_stock) == 0
    
    return Response({
        'valid': is_valid,
        'out_of_stock': out_of_stock,
        'insufficient_stock': insufficient_stock
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_cart_with_validation(request):
    """
    Adiciona item ao carrinho com validação de estoque
    """
    variant_id = request.data.get('variant_id')
    quantity = request.data.get('quantity', 1)
    
    if not variant_id:
        return Response(
            {'error': 'variant_id é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        variant = ProductVariant.objects.select_related('product').get(id=variant_id)
    except ProductVariant.DoesNotExist:
        return Response(
            {'error': 'Variante não encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Validar estoque
    if variant.stock == 0:
        return Response(
            {'error': 'Produto sem estoque'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if variant.stock < quantity:
        return Response(
            {
                'error': 'Estoque insuficiente',
                'available': variant.stock,
                'requested': quantity
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Buscar ou criar carrinho
    user = request.user if request.user.is_authenticated else None
    session_key = request.headers.get('X-Session-Key')
    
    if user:
        cart, created = Cart.objects.get_or_create(user=user)
    elif session_key:
        cart, created = Cart.objects.get_or_create(
            session_key=session_key,
            user__isnull=True
        )
    else:
        return Response(
            {'error': 'Session key é obrigatório para guests'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Adicionar ou atualizar item
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        variant=variant,
        defaults={
            'product_name': variant.product.name,
            'unit_price': variant.price or variant.product.base_price,
            'quantity': quantity
        }
    )
    
    if not created:
        # Verificar se a nova quantidade não excede o estoque
        new_quantity = cart_item.quantity + quantity
        if new_quantity > variant.stock:
            return Response(
                {
                    'error': 'Estoque insuficiente',
                    'available': variant.stock,
                    'current_in_cart': cart_item.quantity,
                    'requested': quantity
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_item.quantity = new_quantity
        cart_item.save()
    
    from .serializers import CartSerializer
    return Response(
        CartSerializer(cart).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )
