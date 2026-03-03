"""
Helper functions para payments
Centraliza lógica duplicada de criação de pedidos
"""
from orders.models import Order, OrderItem
from decimal import Decimal, ROUND_HALF_UP
import logging

logger = logging.getLogger(__name__)


def round_currency(value):
    """
    Arredonda valor para 2 casas decimais (padrão BRL)
    Usa ROUND_HALF_UP para arredondamento bancário
    """
    try:
        return Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    except (ValueError, TypeError):
        return Decimal('0.00')


def create_order_from_checkout_data(request_data, user=None):
    """
    Cria um pedido a partir dos dados de checkout
    Centraliza lógica que estava duplicada em create_preference, create_pix_payment e create_card_payment
    
    Args:
        request_data: Dados do request (request.data)
        user: Usuário autenticado ou None para guests
    
    Returns:
        Order: Pedido criado
    """
    # Obter shipping_price dos dados (NÃO dos itens)
    cart_items = request_data.get('items', [])
    shipping_price = round_currency(request_data.get('shipping_price', 0))
    
    # Log dados de entrega
    shipping_data = {
        'destination_zip': request_data.get('destination_zip', ''),
        'shipping_service_name': request_data.get('shipping_service_name', ''),
        'shipping_carrier': request_data.get('shipping_carrier', ''),
        'shipping_first_name': request_data.get('shipping_first_name', ''),
        'shipping_last_name': request_data.get('shipping_last_name', ''),
        'shipping_phone': request_data.get('shipping_phone', ''),
        'shipping_street': request_data.get('shipping_street', ''),
        'shipping_number': request_data.get('shipping_number', ''),
        'shipping_complement': request_data.get('shipping_complement', ''),
        'shipping_neighborhood': request_data.get('shipping_neighborhood', ''),
        'shipping_city': request_data.get('shipping_city', ''),
        'shipping_state': request_data.get('shipping_state', ''),
        'shipping_zip': request_data.get('shipping_zip', ''),
    }
    
    logger.info(f"🚚 CHECKOUT - Dados de entrega: {shipping_data}")
    
    # Criar Order
    order = Order.objects.create(
        user=user,
        email=request_data.get('email', ''),
        first_name=request_data.get('first_name', ''),
        last_name=request_data.get('last_name', ''),
        destination_zip=request_data.get('destination_zip', ''),
        shipping_service_name=request_data.get('shipping_service_name', ''),
        shipping_carrier=request_data.get('shipping_carrier', ''),
        shipping_price=shipping_price,
        # Guest shipping address
        shipping_first_name=request_data.get('shipping_first_name', ''),
        shipping_last_name=request_data.get('shipping_last_name', ''),
        shipping_phone=request_data.get('shipping_phone', ''),
        shipping_street=request_data.get('shipping_street', ''),
        shipping_number=request_data.get('shipping_number', ''),
        shipping_complement=request_data.get('shipping_complement', ''),
        shipping_neighborhood=request_data.get('shipping_neighborhood', ''),
        shipping_city=request_data.get('shipping_city', ''),
        shipping_state=request_data.get('shipping_state', ''),
        shipping_zip=request_data.get('shipping_zip', '') or request_data.get('destination_zip', ''),
    )
    
    logger.info(f"✅ CHECKOUT - Pedido #{order.id} criado")
    
    # Vincular endereço salvo se fornecido
    try:
        address_id = request_data.get('address_id')
        if address_id and user and user.is_authenticated:
            from addresses.models import Address
            addr = Address.objects.filter(id=address_id, user=user).first()
            if addr:
                order.shipping_address = addr
                # Copiar dados do endereço para os campos do pedido (snapshot)
                order.shipping_first_name = addr.first_name or order.shipping_first_name
                order.shipping_last_name = addr.last_name or order.shipping_last_name
                order.shipping_phone = addr.phone or order.shipping_phone
                order.shipping_street = addr.street or order.shipping_street
                order.shipping_number = addr.number or order.shipping_number
                order.shipping_complement = addr.complement or order.shipping_complement
                order.shipping_neighborhood = addr.neighborhood or order.shipping_neighborhood
                order.shipping_city = addr.city or order.shipping_city
                order.shipping_state = addr.state or order.shipping_state
                order.shipping_zip = addr.zip_code or order.shipping_zip
                order.save()
                logger.info(f"✅ CHECKOUT - Address #{addr.id} vinculado e copiado para pedido #{order.id}")
    except Exception as e:
        logger.warning(f"⚠️ CHECKOUT - Erro ao vincular address: {e}")
    
    # Criar OrderItems (ignorar item "Frete" se existir por compatibilidade)
    total_items = Decimal('0')
    for item in cart_items:
        title = item.get('name', 'Produto')
        qty = int(item.get('qty', 1))
        price = round_currency(item.get('price', 0))
        
        # Ignorar item "Frete" - shipping_price já está sendo usado
        if str(title).lower() != 'frete':
            OrderItem.objects.create(
                order=order,
                product_name=title,
                unit_price=float(price),
                quantity=qty,
            )
            total_items += price * qty
    
    # Aplicar cupom/desconto
    try:
        coupon_code = (request_data.get('coupon_code') or '').strip()
        discount_amount = round_currency(request_data.get('discount_amount', 0))
    except Exception:
        coupon_code = ''
        discount_amount = Decimal('0')
    
    # Calcular total com Decimal para precisão
    order.external_reference = f"ORDER-{order.id}"
    order.coupon_code = coupon_code
    order.discount_amount = float(discount_amount)
    
    # Para pagamento com cartão, usar transaction_amount se fornecido (inclui juros)
    if request_data.get('transaction_amount'):
        computed_total = round_currency(request_data.get('transaction_amount'))
    else:
        computed_total = total_items + shipping_price - discount_amount
        computed_total = round_currency(computed_total)
    
    # Garantir que total não seja negativo
    order.total_amount = float(max(Decimal('0'), computed_total))
    order.shipping_price = float(shipping_price)
    
    order.save(update_fields=["external_reference", "coupon_code", "discount_amount", "total_amount", "shipping_price"])
    
    logger.info(f"💰 CHECKOUT - Pedido #{order.id}: Itens=R${float(total_items):.2f} + Frete=R${float(shipping_price):.2f} - Desconto=R${float(discount_amount):.2f} = Total=R${order.total_amount:.2f}")
    
    return order
