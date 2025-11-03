from django.db import models
from django.conf import settings
from decimal import Decimal


class LoyaltyTier(models.Model):
    """Níveis do programa de fidelidade"""
    name = models.CharField(max_length=50)  # Bronze, Prata, Ouro, Platinum
    min_points = models.IntegerField()
    cashback_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # 3%, 5%, 7%, 10%
    color = models.CharField(max_length=20, default='gray')  # Para UI
    icon = models.CharField(max_length=50, blank=True)
    benefits = models.TextField(blank=True)
    
    class Meta:
        ordering = ['min_points']
    
    def __str__(self):
        return f"{self.name} - {self.cashback_percentage}% cashback"


class CustomerLoyalty(models.Model):
    """Pontos e nível de fidelidade do cliente"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loyalty')
    current_tier = models.ForeignKey(LoyaltyTier, on_delete=models.SET_NULL, null=True, blank=True)
    total_points = models.IntegerField(default=0)
    available_points = models.IntegerField(default=0)  # Pontos não usados
    lifetime_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.available_points} pontos"
    
    def add_points(self, amount, reason=''):
        """Adiciona pontos"""
        points = int(amount)  # 1 ponto = R$ 1
        self.total_points += points
        self.available_points += points
        self.update_tier()
        self.save()
        
        # Registrar transação
        PointsTransaction.objects.create(
            customer=self,
            points=points,
            transaction_type='earn',
            reason=reason
        )
    
    def redeem_points(self, points, reason=''):
        """Resgata pontos"""
        if points > self.available_points:
            raise ValueError('Pontos insuficientes')
        
        self.available_points -= points
        self.save()
        
        # Registrar transação
        PointsTransaction.objects.create(
            customer=self,
            points=-points,
            transaction_type='redeem',
            reason=reason
        )
        
        return Decimal(points)  # 1 ponto = R$ 1
    
    def update_tier(self):
        """Atualiza nível baseado em pontos totais"""
        tier = LoyaltyTier.objects.filter(min_points__lte=self.total_points).order_by('-min_points').first()
        if tier and tier != self.current_tier:
            self.current_tier = tier
            # Notificar upgrade de nível
            from notifications.models import Notification
            Notification.create_notification(
                user=self.user,
                notification_type='system',
                title=f'🎉 Parabéns! Você subiu para {tier.name}!',
                message=f'Agora você tem {tier.cashback_percentage}% de cashback em todas as compras!',
                link='/profile/loyalty'
            )
    
    def calculate_cashback(self, order_amount):
        """Calcula cashback da compra"""
        if not self.current_tier:
            return Decimal('0')
        percentage = self.current_tier.cashback_percentage / 100
        return order_amount * Decimal(str(percentage))


class PointsTransaction(models.Model):
    """Histórico de transações de pontos"""
    TRANSACTION_TYPES = (
        ('earn', 'Ganhou'),
        ('redeem', 'Resgatou'),
        ('expired', 'Expirou'),
        ('bonus', 'Bônus'),
    )
    
    customer = models.ForeignKey(CustomerLoyalty, on_delete=models.CASCADE, related_name='transactions')
    points = models.IntegerField()  # Positivo para ganho, negativo para resgate
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    reason = models.CharField(max_length=200, blank=True)
    order_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.user.email} - {self.points} pontos - {self.get_transaction_type_display()}"
