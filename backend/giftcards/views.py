from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import GiftCard, GiftCardDesign, GiftCardTransaction
from .serializers import (
    GiftCardSerializer, GiftCardDesignSerializer,
    GiftCardPurchaseSerializer, GiftCardBalanceSerializer,
    GiftCardApplySerializer, GiftCardTransactionSerializer
)


class GiftCardViewSet(viewsets.ModelViewSet):
    """API de Gift Cards"""
    queryset = GiftCard.objects.all()
    serializer_class = GiftCardSerializer
    
    def get_permissions(self):
        if self.action in ['check_balance', 'designs']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def designs(self, request):
        """Lista designs disponíveis"""
        designs = GiftCardDesign.objects.filter(is_active=True)
        serializer = GiftCardDesignSerializer(designs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def purchase(self, request):
        """Compra um gift card"""
        serializer = GiftCardPurchaseSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        # Criar gift card
        gift_card = GiftCard.objects.create(
            code=GiftCard.generate_code(),
            initial_value=data['amount'],
            current_balance=data['amount'],
            purchased_by=request.user,
            recipient_email=data['recipient_email'],
            recipient_name=data['recipient_name'],
            message=data.get('message', ''),
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=365)  # Válido por 1 ano
        )
        
        # Registrar transação
        GiftCardTransaction.objects.create(
            gift_card=gift_card,
            transaction_type='purchase',
            amount=data['amount'],
            balance_after=data['amount'],
            user=request.user,
            notes='Compra de gift card'
        )
        
        # Enviar email para destinatário
        self._send_gift_card_email(gift_card)
        
        gift_card.sent_at = timezone.now()
        gift_card.save()
        
        return Response({
            'message': 'Gift card criado com sucesso!',
            'gift_card': GiftCardSerializer(gift_card).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def check_balance(self, request):
        """Consulta saldo de um gift card"""
        serializer = GiftCardBalanceSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        code = serializer.validated_data['code']
        
        try:
            gift_card = GiftCard.objects.get(code=code)
            
            return Response({
                'code': gift_card.code,
                'balance': gift_card.check_balance(),
                'is_valid': gift_card.is_valid(),
                'valid_until': gift_card.valid_until,
                'status': gift_card.get_status_display()
            })
        except GiftCard.DoesNotExist:
            return Response(
                {'error': 'Gift card não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request):
        """Aplica gift card a um pedido"""
        serializer = GiftCardApplySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        code = serializer.validated_data['code']
        order_total = serializer.validated_data['order_total']
        
        try:
            gift_card = GiftCard.objects.get(code=code)
            
            if not gift_card.is_valid():
                return Response(
                    {'error': 'Gift card inválido ou expirado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calcular quanto pode ser aplicado
            applicable_amount = min(gift_card.current_balance, order_total)
            
            return Response({
                'applicable_amount': applicable_amount,
                'remaining_balance': gift_card.current_balance - applicable_amount,
                'message': f'Gift card de R$ {applicable_amount} será aplicado ao pedido'
            })
            
        except GiftCard.DoesNotExist:
            return Response(
                {'error': 'Gift card não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def transactions(self, request, pk=None):
        """Lista transações de um gift card"""
        gift_card = self.get_object()
        
        # Verificar se o usuário tem permissão
        if gift_card.purchased_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Sem permissão'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transactions = gift_card.transactions.all()
        serializer = GiftCardTransactionSerializer(transactions, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_giftcards(self, request):
        """Lista gift cards do usuário"""
        # Gift cards comprados
        purchased = GiftCard.objects.filter(purchased_by=request.user)
        
        # Gift cards recebidos (por email)
        received = GiftCard.objects.filter(recipient_email=request.user.email)
        
        return Response({
            'purchased': GiftCardSerializer(purchased, many=True).data,
            'received': GiftCardSerializer(received, many=True).data
        })
    
    def _send_gift_card_email(self, gift_card):
        """Envia email com gift card para destinatário"""
        subject = f"🎁 Você recebeu um Vale Presente!"
        
        context = {
            'gift_card': gift_card,
            'sender_name': gift_card.purchased_by.get_full_name() or gift_card.purchased_by.email,
            'redeem_link': f"{settings.FRONTEND_BASE_URL}/giftcard/{gift_card.code}"
        }
        
        html_message = render_to_string('giftcards/email_giftcard.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [gift_card.recipient_email],
            html_message=html_message,
            fail_silently=True
        )
