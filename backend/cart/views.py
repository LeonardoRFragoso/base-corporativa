from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Cart, CartItem
from .serializers import CartSerializer
from catalog.models import ProductVariant


def _get_session_key(request):
    return request.headers.get('X-Session-Key') or request.query_params.get('session_key')


def _get_or_create_cart_for_request(request):
    if request.user.is_authenticated:
        cart = Cart.objects.filter(user=request.user).order_by('id').first()
        if cart is None:
            cart = Cart.objects.create(user=request.user)
        return cart
    session_key = _get_session_key(request)
    if not session_key:
        return None
    cart = Cart.objects.filter(user=None, session_key=session_key).order_by('id').first()
    if cart is None:
        cart = Cart.objects.create(user=None, session_key=session_key)
    return cart


@api_view(['GET'])
@permission_classes([AllowAny])
def get_cart(request):
    cart = _get_or_create_cart_for_request(request)
    if cart is None:
        return Response({"error": "Informe X-Session-Key no header para carrinho de convidado."}, status=status.HTTP_400_BAD_REQUEST)
    return Response(CartSerializer(cart).data)


@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def add_to_cart(request):
    cart = _get_or_create_cart_for_request(request)
    if cart is None:
        return Response({"error": "Informe X-Session-Key no header para carrinho de convidado."}, status=status.HTTP_400_BAD_REQUEST)

    variant_id = request.data.get('variant_id')
    quantity = int(request.data.get('quantity') or 1)
    if not variant_id:
        return Response({"error": "variant_id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
    if quantity < 1:
        quantity = 1

    variant = get_object_or_404(ProductVariant.objects.select_related('product'), id=variant_id)
    unit_price = variant.price or variant.product.base_price
    product_name = variant.product.name

    item, created = CartItem.objects.get_or_create(
        cart=cart, variant=variant,
        defaults={"product_name": product_name, "unit_price": unit_price, "quantity": quantity}
    )
    if not created:
        item.quantity += quantity
        item.save(update_fields=["quantity", "updated_at"])

    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([AllowAny])
@transaction.atomic
def update_item(request, item_id: int):
    cart = _get_or_create_cart_for_request(request)
    if cart is None:
        return Response({"error": "Informe X-Session-Key no header para carrinho de convidado."}, status=status.HTTP_400_BAD_REQUEST)
    item = get_object_or_404(CartItem, id=item_id, cart=cart)
    quantity = int(request.data.get('quantity') or 1)
    if quantity <= 0:
        item.delete()
    else:
        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])
    return Response(CartSerializer(cart).data)


@api_view(['DELETE'])
@permission_classes([AllowAny])
@transaction.atomic
def remove_item(request, item_id: int):
    cart = _get_or_create_cart_for_request(request)
    if cart is None:
        return Response({"error": "Informe X-Session-Key no header para carrinho de convidado."}, status=status.HTTP_400_BAD_REQUEST)
    item = get_object_or_404(CartItem, id=item_id, cart=cart)
    item.delete()
    return Response(CartSerializer(cart).data)


@api_view(['DELETE'])
@permission_classes([AllowAny])
@transaction.atomic
def clear_cart(request):
    cart = _get_or_create_cart_for_request(request)
    if cart is None:
        return Response({"error": "Informe X-Session-Key no header para carrinho de convidado."}, status=status.HTTP_400_BAD_REQUEST)
    cart.items.all().delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def sync_cart(request):
    """
    Sincroniza o carrinho inteiro de uma vez, evitando múltiplas requisições.
    Espera um array de itens: [{"variant_id": 1, "quantity": 2}, ...]
    """
    cart = _get_or_create_cart_for_request(request)
    if cart is None:
        return Response({"error": "Informe X-Session-Key no header para carrinho de convidado."}, status=status.HTTP_400_BAD_REQUEST)
    
    items_data = request.data.get('items', [])
    if not isinstance(items_data, list):
        return Response({"error": "items deve ser um array"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Limpa o carrinho atual
    cart.items.all().delete()
    
    # Adiciona todos os novos itens
    for item_data in items_data:
        variant_id = item_data.get('variant_id')
        quantity = int(item_data.get('quantity', 1))
        
        if not variant_id or quantity < 1:
            continue
            
        try:
            variant = ProductVariant.objects.select_related('product').get(id=variant_id)
            unit_price = variant.price or variant.product.base_price
            product_name = variant.product.name
            
            CartItem.objects.create(
                cart=cart,
                variant=variant,
                product_name=product_name,
                unit_price=unit_price,
                quantity=quantity
            )
        except ProductVariant.DoesNotExist:
            continue
    
    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
