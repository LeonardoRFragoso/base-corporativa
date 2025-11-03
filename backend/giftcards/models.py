from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import random
import string


class GiftCard(models.Model):
    """Vale Presente"""
    STATUS_CHOICES = [
        ('active', 'Ativo'),
        ('used', 'Usado'),
        ('expired', 'Expirado'),
        ('cancelled', 'Cancelado'),
    ]
    
    code = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Valores
    initial_value = models.DecimalField(max_digits=10, decimal_places=2)
    current_balance = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Comprador e destinatário
    purchased_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='purchased_giftcards'
    )
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=200)
    message = models.TextField(blank=True, help_text='Mensagem personalizada')
    
    # Status e validade
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField()
    
    # Rastreamento
    order_id = models.IntegerField(null=True, blank=True)  # Pedido de compra do gift card
    sent_at = models.DateTimeField(null=True, blank=True)
    first_used_at = models.DateTimeField(null=True, blank=True)
    fully_used_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'status']),
            models.Index(fields=['recipient_email']),
        ]
    
    def __str__(self):
        return f"Gift Card {self.code} - R$ {self.current_balance}"
    
    @staticmethod
    def generate_code():
        """Gera código único para gift card"""
        while True:
            code = 'GC' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
            if not GiftCard.objects.filter(code=code).exists():
                return code
    
    def is_valid(self):
        """Verifica se o gift card é válido"""
        now = timezone.now()
        return (
            self.status == 'active' and
            self.current_balance > 0 and
            self.valid_from <= now <= self.valid_until
        )
    
    def apply_to_order(self, amount):
        """Aplica gift card a um pedido"""
        if not self.is_valid():
            raise ValueError('Gift card inválido ou expirado')
        
        if amount > self.current_balance:
            raise ValueError('Saldo insuficiente no gift card')
        
        self.current_balance -= Decimal(str(amount))
        
        if not self.first_used_at:
            self.first_used_at = timezone.now()
        
        if self.current_balance == 0:
            self.status = 'used'
            self.fully_used_at = timezone.now()
        
        self.save()
        
        return amount
    
    def check_balance(self):
        """Retorna saldo atual"""
        if not self.is_valid():
            return Decimal('0')
        return self.current_balance


class GiftCardTransaction(models.Model):
    """Histórico de uso de gift cards"""
    TRANSACTION_TYPES = [
        ('purchase', 'Compra'),
        ('use', 'Uso'),
        ('refund', 'Reembolso'),
        ('cancel', 'Cancelamento'),
    ]
    
    gift_card = models.ForeignKey(GiftCard, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    
    order_id = models.IntegerField(null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.gift_card.code} - {self.get_transaction_type_display()} - R$ {self.amount}"


class GiftCardDesign(models.Model):
    """Designs disponíveis para gift cards"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='giftcard_designs/')
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # Ocasiões
    OCCASION_CHOICES = [
        ('birthday', 'Aniversário'),
        ('christmas', 'Natal'),
        ('mothers_day', 'Dia das Mães'),
        ('fathers_day', 'Dia dos Pais'),
        ('valentines', 'Dia dos Namorados'),
        ('generic', 'Genérico'),
    ]
    occasion = models.CharField(max_length=20, choices=OCCASION_CHOICES, default='generic')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
