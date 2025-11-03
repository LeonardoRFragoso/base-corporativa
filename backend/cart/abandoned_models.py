from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class AbandonedCart(models.Model):
    STATUS_CHOICES = (
        ('active', 'Ativo'),
        ('recovered', 'Recuperado'),
        ('expired', 'Expirado'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    cart_data = models.JSONField()  # Snapshot do carrinho
    total_value = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Recovery tracking
    recovery_email_sent_1h = models.BooleanField(default=False)
    recovery_email_sent_24h = models.BooleanField(default=False)
    recovery_email_sent_72h = models.BooleanField(default=False)
    recovery_token = models.CharField(max_length=100, unique=True)
    
    # Discount incentives
    discount_code_1h = models.CharField(max_length=50, blank=True)  # 5%
    discount_code_24h = models.CharField(max_length=50, blank=True)  # 10%
    discount_code_72h = models.CharField(max_length=50, blank=True)  # 15%
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    recovered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['recovery_token']),
        ]
    
    def __str__(self):
        return f"Carrinho Abandonado - {self.email or self.user} - R$ {self.total_value}"
    
    def is_expired(self):
        """Carrinho expira após 7 dias"""
        return timezone.now() > self.created_at + timedelta(days=7)
    
    def mark_as_recovered(self):
        """Marca carrinho como recuperado"""
        self.status = 'recovered'
        self.recovered_at = timezone.now()
        self.save(update_fields=['status', 'recovered_at'])
    
    @classmethod
    def create_from_cart(cls, user, cart_items, email=''):
        """Cria registro de carrinho abandonado"""
        import secrets
        
        # Calcular total
        total = sum(item.variant.price * item.quantity for item in cart_items)
        
        # Serializar itens do carrinho
        cart_data = [{
            'product_name': item.variant.product.name,
            'variant_id': item.variant.id,
            'sku': item.variant.sku,
            'size': item.variant.size,
            'color': item.variant.color,
            'quantity': item.quantity,
            'price': float(item.variant.price),
        } for item in cart_items]
        
        return cls.objects.create(
            user=user if user.is_authenticated else None,
            email=email or (user.email if user.is_authenticated else ''),
            cart_data=cart_data,
            total_value=total,
            recovery_token=secrets.token_urlsafe(32)
        )


class CartRecoveryMetrics(models.Model):
    """Métricas de recuperação de carrinho"""
    date = models.DateField(unique=True)
    total_abandoned = models.IntegerField(default=0)
    total_recovered = models.IntegerField(default=0)
    recovery_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    revenue_recovered = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Métricas {self.date} - Taxa: {self.recovery_rate}%"
