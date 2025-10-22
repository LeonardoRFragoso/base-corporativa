import mercadopago
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import uuid
import time

# Configurar SDK do Mercado Pago com credenciais reais
sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_preference(request):
    """
    Cria uma preferência de pagamento no Mercado Pago
    """
    try:
        cart_items = request.data.get('items', [])
        
        if not cart_items:
            return Response(
                {'error': 'Carrinho vazio'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Preparar itens para o Mercado Pago
        items = []
        for item in cart_items:
            items.append({
                "title": item.get('name', 'Produto'),
                "quantity": int(item.get('qty', 1)),
                "unit_price": float(item.get('price', 0)),
                "currency_id": "BRL",
                "description": f"Tamanho: {item.get('size', 'N/A')}, Cor: {item.get('color', 'N/A')}"
            })
        
        # Configurar preferência
        preference_data = {
            "items": items,
            "payer": {
                "name": "Cliente BASE CORPORATIVA",
                "email": "cliente@basecorporativa.com"
            },
            "back_urls": {
                "success": "http://localhost:5173/checkout/success",
                "failure": "http://localhost:5173/checkout/failure", 
                "pending": "http://localhost:5173/checkout/pending"
            },
            "payment_methods": {
                "excluded_payment_methods": [],
                "excluded_payment_types": [],
                "installments": 12
            },
            "notification_url": "http://localhost:8000/api/payments/webhook/",
            "statement_descriptor": "BASE CORPORATIVA",
            "external_reference": f"BC-{int(time.time())}-{len(cart_items)}",
        }
        
        # Criar preferência no Mercado Pago
        preference_response = sdk.preference().create(preference_data)
        
        if preference_response["status"] == 201:
            return Response({
                'preference_id': preference_response["response"]["id"],
                'init_point': preference_response["response"]["init_point"]
            })
        else:
            return Response(
                {'error': 'Erro ao criar preferência de pagamento', 'details': preference_response}, 
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
        # Log da notificação
        print("Webhook recebido:", request.data)
        
        # Aqui você processaria a notificação
        # Por exemplo, atualizar status do pedido no banco de dados
        
        return Response({'status': 'ok'})
        
    except Exception as e:
        print(f"Erro no webhook: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
