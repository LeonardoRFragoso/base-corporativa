import mercadopago
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import uuid
import time
from orders.models import Order, OrderItem
from discounts.models import DiscountCode

# Configurar SDK do Mercado Pago com credenciais reais
sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def test_mercadopago_credentials(request):
    """
    Endpoint de teste para verificar se as credenciais do Mercado Pago estão configuradas
    """
    try:
        has_token = bool(settings.MERCADOPAGO_ACCESS_TOKEN)
        has_public_key = bool(settings.MERCADOPAGO_PUBLIC_KEY)
        
        if not has_token:
            return Response({
                'status': 'error',
                'message': 'MERCADOPAGO_ACCESS_TOKEN não configurado',
                'has_token': has_token,
                'has_public_key': has_public_key
            })
        
        # Tentar fazer uma requisição simples ao MP
        try:
            test_response = sdk.payment_methods().list_all()
            mp_working = test_response.get('status') in [200, 201]
        except Exception as e:
            mp_working = False
            error_detail = str(e)
            
        return Response({
            'status': 'ok' if mp_working else 'error',
            'has_token': has_token,
            'has_public_key': has_public_key,
            'mp_api_working': mp_working,
            'error_detail': error_detail if not mp_working else None
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_preference(request):
    """
    Cria uma preferência de pagamento no Mercado Pago
    """
    try:
        # Validar credenciais do Mercado Pago
        if not settings.MERCADOPAGO_ACCESS_TOKEN:
            return Response(
                {'error': 'Credenciais do Mercado Pago não configuradas'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        cart_items = request.data.get('items', [])
        
        if not cart_items:
            return Response(
                {'error': 'Carrinho vazio'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Criar Pedido local e preparar itens para MP
        shipping_price = 0.0
        for it in cart_items:
            if str(it.get('name', '')).lower() == 'frete':
                try:
                    shipping_price = float(it.get('price', 0))
                except Exception:
                    shipping_price = 0.0

        order = Order.objects.create(
            user=request.user if getattr(request, 'user', None) and request.user.is_authenticated else None,
            email=request.data.get('email', ''),
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            destination_zip=request.data.get('destination_zip', ''),
            shipping_service_name=request.data.get('shipping_service_name', ''),
            shipping_carrier=request.data.get('shipping_carrier', ''),
            shipping_price=shipping_price,
            # Guest shipping address (for non-authenticated checkout)
            shipping_first_name=request.data.get('shipping_first_name', ''),
            shipping_last_name=request.data.get('shipping_last_name', ''),
            shipping_phone=request.data.get('shipping_phone', ''),
            shipping_street=request.data.get('shipping_street', ''),
            shipping_number=request.data.get('shipping_number', ''),
            shipping_complement=request.data.get('shipping_complement', ''),
            shipping_neighborhood=request.data.get('shipping_neighborhood', ''),
            shipping_city=request.data.get('shipping_city', ''),
            shipping_state=request.data.get('shipping_state', ''),
            shipping_zip=request.data.get('shipping_zip', '') or request.data.get('destination_zip', ''),
        )

        # Optionally attach a saved address
        try:
            address_id = request.data.get('address_id')
            if address_id and getattr(request, 'user', None) and request.user.is_authenticated:
                from addresses.models import Address
                addr = Address.objects.filter(id=address_id, user=request.user).first()
                if addr:
                    order.shipping_address = addr
                    order.save(update_fields=["shipping_address"])
        except Exception:
            pass

        items = []
        total_items = 0.0
        for item in cart_items:
            title = item.get('name', 'Produto')
            qty = int(item.get('qty', 1))
            price = float(item.get('price', 0))
            items.append({
                "title": title,
                "quantity": qty,
                "unit_price": price,
                "currency_id": "BRL",
                "description": f"Tamanho: {item.get('size', 'N/A')}, Cor: {item.get('color', 'N/A')}"
            })
            if str(title).lower() != 'frete':
                OrderItem.objects.create(
                    order=order,
                    product_name=title,
                    unit_price=price,
                    quantity=qty,
                )
                total_items += price * qty

        # Apply coupon/discount if present
        try:
            coupon_code = (request.data.get('coupon_code') or '').strip()
            discount_amount = float(request.data.get('discount_amount') or 0)
        except Exception:
            coupon_code = ''
            discount_amount = 0.0

        order.external_reference = f"ORDER-{order.id}"
        order.coupon_code = coupon_code
        order.discount_amount = discount_amount
        computed_total = total_items + float(shipping_price) - float(discount_amount)
        if computed_total < 0:
            computed_total = 0.0
        order.total_amount = computed_total
        order.save(update_fields=["external_reference", "coupon_code", "discount_amount", "total_amount"])

        # Configurar preferência
        payer_email = request.data.get('email') or (request.user.email if getattr(request, 'user', None) and request.user.is_authenticated else 'cliente@basecorporativa.store')
        payer_name = (request.data.get('first_name') or '') + ' ' + (request.data.get('last_name') or '')
        
        preference_data = {
            "items": items,
            "payer": {
                "name": payer_name.strip() or "Cliente",
                "email": payer_email,
                "phone": {
                    "area_code": "",
                    "number": ""
                },
                "address": {
                    "zip_code": request.data.get('destination_zip', '').replace('-', ''),
                    "street_name": request.data.get('shipping_street', ''),
                    "street_number": request.data.get('shipping_number', '')
                }
            },
            "back_urls": {
                "success": settings.FRONTEND_BASE_URL.rstrip('/') + "/checkout/success",
                "failure": settings.FRONTEND_BASE_URL.rstrip('/') + "/checkout/failure", 
                "pending": settings.FRONTEND_BASE_URL.rstrip('/') + "/checkout/pending"
            },
            "auto_return": "approved",
            "payment_methods": {
                "excluded_payment_methods": [],
                "excluded_payment_types": [],
                "installments": 12,
                "default_payment_method_id": None,
                "default_installments": None
            },
            "notification_url": settings.MERCADOPAGO_NOTIFICATION_URL,
            "statement_descriptor": "BASE CORPORATIVA",
            "external_reference": order.external_reference,
            "expires": False,
            "binary_mode": False
        }
        
        # Criar preferência no Mercado Pago
        try:
            preference_response = sdk.preference().create(preference_data)
        except Exception as mp_error:
            return Response(
                {'error': 'Erro ao comunicar com Mercado Pago', 'details': str(mp_error)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        if preference_response.get("status") == 201:
            return Response({
                'preference_id': preference_response["response"]["id"],
                'init_point': preference_response["response"]["init_point"],
                'order_id': order.id,
                'external_reference': order.external_reference,
            })
        else:
            error_msg = preference_response.get("response", {}).get("message", "Erro desconhecido")
            return Response(
                {'error': 'Erro ao criar preferência de pagamento', 'details': error_msg}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        return Response(
            {'error': f'Erro interno: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def create_pix_payment(request):
    """
    Cria um pagamento PIX direto e retorna o QR Code e código copia-e-cola
    """
    try:
        # Validar credenciais do Mercado Pago
        if not settings.MERCADOPAGO_ACCESS_TOKEN:
            return Response(
                {'error': 'Credenciais do Mercado Pago não configuradas'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        cart_items = request.data.get('items', [])
        
        if not cart_items:
            return Response(
                {'error': 'Carrinho vazio'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Criar Pedido local
        shipping_price = 0.0
        for it in cart_items:
            if str(it.get('name', '')).lower() == 'frete':
                try:
                    shipping_price = float(it.get('price', 0))
                except Exception:
                    shipping_price = 0.0

        order = Order.objects.create(
            user=request.user if getattr(request, 'user', None) and request.user.is_authenticated else None,
            email=request.data.get('email', ''),
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            destination_zip=request.data.get('destination_zip', ''),
            shipping_service_name=request.data.get('shipping_service_name', ''),
            shipping_carrier=request.data.get('shipping_carrier', ''),
            shipping_price=shipping_price,
            # Guest shipping address
            shipping_first_name=request.data.get('shipping_first_name', ''),
            shipping_last_name=request.data.get('shipping_last_name', ''),
            shipping_phone=request.data.get('shipping_phone', ''),
            shipping_street=request.data.get('shipping_street', ''),
            shipping_number=request.data.get('shipping_number', ''),
            shipping_complement=request.data.get('shipping_complement', ''),
            shipping_neighborhood=request.data.get('shipping_neighborhood', ''),
            shipping_city=request.data.get('shipping_city', ''),
            shipping_state=request.data.get('shipping_state', ''),
            shipping_zip=request.data.get('shipping_zip', '') or request.data.get('destination_zip', ''),
        )

        # Attach saved address if provided
        try:
            address_id = request.data.get('address_id')
            if address_id and getattr(request, 'user', None) and request.user.is_authenticated:
                from addresses.models import Address
                addr = Address.objects.filter(id=address_id, user=request.user).first()
                if addr:
                    order.shipping_address = addr
                    order.save(update_fields=["shipping_address"])
        except Exception:
            pass

        # Calculate total
        total_items = 0.0
        for item in cart_items:
            title = item.get('name', 'Produto')
            qty = int(item.get('qty', 1))
            price = float(item.get('price', 0))
            if str(title).lower() != 'frete':
                OrderItem.objects.create(
                    order=order,
                    product_name=title,
                    unit_price=price,
                    quantity=qty,
                )
                total_items += price * qty

        # Apply coupon/discount if present
        try:
            coupon_code = (request.data.get('coupon_code') or '').strip()
            discount_amount = float(request.data.get('discount_amount') or 0)
        except Exception:
            coupon_code = ''
            discount_amount = 0.0

        order.external_reference = f"ORDER-{order.id}"
        order.coupon_code = coupon_code
        order.discount_amount = discount_amount
        computed_total = total_items + float(shipping_price) - float(discount_amount)
        if computed_total < 0:
            computed_total = 0.0
        order.total_amount = computed_total
        order.save(update_fields=["external_reference", "coupon_code", "discount_amount", "total_amount"])

        # Criar pagamento PIX no Mercado Pago
        payment_data = {
            "transaction_amount": float(computed_total),
            "description": f"Pedido #{order.id} - BASE CORPORATIVA",
            "payment_method_id": "pix",
            "payer": {
                "email": request.data.get('email') or (request.user.email if getattr(request, 'user', None) and request.user.is_authenticated else 'cliente@basecorporativa.store'),
                "first_name": request.data.get('first_name', ''),
                "last_name": request.data.get('last_name', '')
            },
            "external_reference": order.external_reference,
            "notification_url": settings.MERCADOPAGO_NOTIFICATION_URL,
        }
        
        try:
            payment_response = sdk.payment().create(payment_data)
        except Exception as mp_error:
            return Response(
                {'error': 'Erro ao comunicar com Mercado Pago', 'details': str(mp_error)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        if payment_response.get("status") in [200, 201]:
            payment_info = payment_response["response"]
            
            # Salvar informações do pagamento no pedido
            order.mp_payment_id = str(payment_info.get('id'))
            order.mp_status = payment_info.get('status')
            order.status = 'pending'
            order.save(update_fields=['mp_payment_id', 'mp_status', 'status'])
            
            # Extrair informações do PIX
            pix_data = payment_info.get('point_of_interaction', {}).get('transaction_data', {})
            
            return Response({
                'order_id': order.id,
                'payment_id': payment_info.get('id'),
                'status': payment_info.get('status'),
                'qr_code': pix_data.get('qr_code'),  # Código copia-e-cola
                'qr_code_base64': pix_data.get('qr_code_base64'),  # Imagem QR Code em base64
                'ticket_url': pix_data.get('ticket_url'),  # URL alternativa
                'external_reference': order.external_reference,
                'amount': computed_total,
            })
        else:
            error_msg = payment_response.get("response", {}).get("message", "Erro desconhecido")
            return Response(
                {'error': 'Erro ao criar pagamento PIX', 'details': error_msg}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        return Response(
            {'error': f'Erro interno: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def webhook(request):
    """
    Webhook para receber notificações do Mercado Pago
    """
    try:
        # Tentar obter o ID do pagamento da notificação
        payload = request.data or {}
        payment_id = None
        if isinstance(payload, dict):
            payment_id = (
                (payload.get('data') or {}).get('id') or
                payload.get('id') or
                request.query_params.get('id')
            )

        if not payment_id:
            return Response({'status': 'ignored', 'reason': 'no payment id'}, status=status.HTTP_200_OK)

        # Buscar detalhes do pagamento no MP
        try:
            pay_resp = sdk.payment().get(payment_id)
        except Exception as e:
            return Response({'status': 'error', 'detail': str(e)}, status=status.HTTP_200_OK)

        if not isinstance(pay_resp, dict) or pay_resp.get('status') not in (200, 201):
            return Response({'status': 'ignored', 'reason': 'mp api status'}, status=status.HTTP_200_OK)

        pay_data = pay_resp.get('response') or {}
        mp_status = (pay_data.get('status') or '').lower()
        external_reference = pay_data.get('external_reference')

        if not external_reference:
            return Response({'status': 'ignored', 'reason': 'no external_reference'}, status=status.HTTP_200_OK)

        # Reconciliar com pedido local
        try:
            order = Order.objects.get(external_reference=external_reference)
        except Order.DoesNotExist:
            return Response({'status': 'ignored', 'reason': 'order not found'}, status=status.HTTP_200_OK)

        order.mp_payment_id = str(payment_id)
        order.mp_status = mp_status
        if mp_status == 'approved':
            order.status = 'paid'
            # increment discount usage
            try:
                if order.coupon_code:
                    d = DiscountCode.objects.filter(code__iexact=order.coupon_code).first()
                    if d:
                        d.times_used = (d.times_used or 0) + 1
                        d.save(update_fields=["times_used"])
            except Exception:
                pass
        elif mp_status in ('rejected', 'cancelled', 'charged_back'):  # ajustar conforme necessidade
            order.status = 'failed'
        elif mp_status in ('in_process', 'in_mediation', 'pending'):
            order.status = 'pending'
        order.save()

        return Response({'status': 'ok'})
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
