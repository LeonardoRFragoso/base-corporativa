from django.db import models
from django.utils import timezone
from datetime import timedelta
from catalog.models import ProductVariant


class StockReservation(models.Model):
    """
    Reserva temporária de estoque durante o checkout
    Previne overselling (venda além do estoque disponível)
    """
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='reservations')
    quantity = models.PositiveIntegerField()
    session_key = models.CharField(max_length=255, db_index=True)  # Para usuários não autenticados
    user = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.CASCADE)  # Para autenticados
    expires_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    order_id = models.CharField(max_length=100, blank=True, null=True)  # Se convertido em pedido
    
    class Meta:
        verbose_name = 'Reserva de Estoque'
        verbose_name_plural = 'Reservas de Estoque'
        indexes = [
            models.Index(fields=['expires_at']),
            models.Index(fields=['session_key']),
        ]
    
    def __str__(self):
        return f"Reserva {self.quantity}x {self.variant.sku} - Expira: {self.expires_at}"
    
    @classmethod
    def create_reservation(cls, variant, quantity, session_key=None, user=None, minutes=15):
        """
        Cria uma reserva de estoque com tempo de expiração
        """
        expires_at = timezone.now() + timedelta(minutes=minutes)
        
        # Verificar se já existe uma reserva ativa para esta sessão/usuário
        existing = cls.get_active_reservation(variant, session_key, user)
        if existing:
            # Atualizar a reserva existente
            existing.quantity = quantity
            existing.expires_at = expires_at
            existing.save()
            return existing
        
        # Criar nova reserva
        reservation = cls.objects.create(
            variant=variant,
            quantity=quantity,
            session_key=session_key or '',
            user=user,
            expires_at=expires_at
        )
        return reservation
    
    @classmethod
    def get_active_reservation(cls, variant, session_key=None, user=None):
        """
        Retorna a reserva ativa para esta variante e sessão/usuário
        """
        now = timezone.now()
        query = cls.objects.filter(
            variant=variant,
            expires_at__gt=now,
            order_id__isnull=True  # Não convertida em pedido
        )
        
        if user and user.is_authenticated:
            query = query.filter(user=user)
        elif session_key:
            query = query.filter(session_key=session_key)
        else:
            return None
        
        return query.first()
    
    @classmethod
    def get_reserved_quantity(cls, variant):
        """
        Retorna a quantidade total reservada para uma variante
        """
        now = timezone.now()
        reserved = cls.objects.filter(
            variant=variant,
            expires_at__gt=now,
            order_id__isnull=True
        ).aggregate(models.Sum('quantity'))['quantity__sum'] or 0
        return reserved
    
    @classmethod
    def cleanup_expired(cls):
        """
        Remove reservas expiradas (executar via cronjob)
        """
        now = timezone.now()
        expired_count = cls.objects.filter(
            expires_at__lte=now,
            order_id__isnull=True
        ).delete()[0]
        return expired_count
    
    @classmethod
    def extend_reservation(cls, reservation_id, minutes=15):
        """
        Estende o tempo de uma reserva existente
        """
        try:
            reservation = cls.objects.get(id=reservation_id)
            reservation.expires_at = timezone.now() + timedelta(minutes=minutes)
            reservation.save()
            return reservation
        except cls.DoesNotExist:
            return None
    
    def convert_to_order(self, order_id):
        """
        Marca a reserva como convertida em pedido
        """
        self.order_id = str(order_id)
        self.save()
    
    def is_expired(self):
        """
        Verifica se a reserva está expirada
        """
        return timezone.now() > self.expires_at
    
    def get_available_stock(self):
        """
        Retorna o estoque disponível considerando esta reserva
        """
        reserved = self.__class__.get_reserved_quantity(self.variant)
        return self.variant.stock - reserved


class ReservationLog(models.Model):
    """
    Log de ações de reserva para auditoria
    """
    ACTION_CHOICES = [
        ('created', 'Criada'),
        ('extended', 'Estendida'),
        ('expired', 'Expirada'),
        ('converted', 'Convertida em Pedido'),
        ('cancelled', 'Cancelada'),
    ]
    
    reservation = models.ForeignKey(StockReservation, on_delete=models.CASCADE, related_name='logs', null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    quantity = models.PositiveIntegerField()
    session_key = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Log de Reserva'
        verbose_name_plural = 'Logs de Reservas'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action} - {self.variant.sku} - {self.timestamp}"
