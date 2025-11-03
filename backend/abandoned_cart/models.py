from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal


class AbandonedCart(models.Model):
    """Rastreia carrinhos abandonados para recovery"""
    STATUS_CHOICES = [
        ('active', 'Ativo'),
        ('recovered', 'Recuperado'),
        ('expired', 'Expirado'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='abandoned_carts')
    cart_data = models.JSONField()  # Snapshot do carrinho
    total_value = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Tracking de emails enviados
    first_email_sent = models.DateTimeField(null=True, blank=True)
    second_email_sent = models.DateTimeField(null=True, blank=True)
    third_email_sent = models.DateTimeField(null=True, blank=True)
    
    # Cupons de recuperação
    recovery_coupon_1h = models.CharField(max_length=50, blank=True)  # 5% desconto
    recovery_coupon_24h = models.CharField(max_length=50, blank=True)  # 10% desconto
    recovery_coupon_72h = models.CharField(max_length=50, blank=True)  # 15% desconto
    
    # Métricas
    recovery_link_clicks = models.IntegerField(default=0)
    recovered_at = models.DateTimeField(null=True, blank=True)
    recovered_order_id = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status', '-created_at']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Carrinho abandonado de {self.user.email} - R$ {self.total_value}"
    
    def should_send_first_email(self):
        """Verifica se deve enviar primeiro email (após 1 hora)"""
        if self.first_email_sent or self.status != 'active':
            return False
        return timezone.now() >= self.created_at + timezone.timedelta(hours=1)
    
    def should_send_second_email(self):
        """Verifica se deve enviar segundo email (após 24 horas)"""
        if self.second_email_sent or self.status != 'active':
            return False
        return timezone.now() >= self.created_at + timezone.timedelta(hours=24)
    
    def should_send_third_email(self):
        """Verifica se deve enviar terceiro email (após 72 horas)"""
        if self.third_email_sent or self.status != 'active':
            return False
        return timezone.now() >= self.created_at + timezone.timedelta(hours=72)
    
    def mark_recovered(self, order_id):
        """Marca carrinho como recuperado"""
        self.status = 'recovered'
        self.recovered_at = timezone.now()
        self.recovered_order_id = order_id
        self.save()
    
    def increment_clicks(self):
        """Incrementa contador de cliques no link de recuperação"""
        self.recovery_link_clicks += 1
        self.save(update_fields=['recovery_link_clicks'])


class AbandonedCartMetrics(models.Model):
    """Métricas agregadas de carrinhos abandonados"""
    date = models.DateField(unique=True)
    
    total_abandoned = models.IntegerField(default=0)
    total_value_abandoned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    emails_sent_1h = models.IntegerField(default=0)
    emails_sent_24h = models.IntegerField(default=0)
    emails_sent_72h = models.IntegerField(default=0)
    
    total_recovered = models.IntegerField(default=0)
    total_value_recovered = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    recovery_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Percentual
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name = 'Métrica de Carrinho Abandonado'
        verbose_name_plural = 'Métricas de Carrinhos Abandonados'
    
    def __str__(self):
        return f"Métricas {self.date} - {self.total_abandoned} abandonados, {self.total_recovered} recuperados"
