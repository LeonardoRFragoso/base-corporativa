from django.db import models
from django.conf import settings
from catalog.models import Product
import uuid


class WishlistCollection(models.Model):
    """Coleções de wishlist (múltiplas listas por usuário)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_collections')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
        unique_together = ['user', 'name']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['share_token']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"
    
    def save(self, *args, **kwargs):
        # Se for a primeira wishlist do usuário, torná-la padrão
        if not self.pk and not WishlistCollection.objects.filter(user=self.user).exists():
            self.is_default = True
        
        # Se marcada como padrão, desmarcar outras
        if self.is_default:
            WishlistCollection.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        
        super().save(*args, **kwargs)


class WishlistItem(models.Model):
    """Item na wishlist"""
    collection = models.ForeignKey(WishlistCollection, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    # Notificações
    notify_on_sale = models.BooleanField(default=True)
    notify_on_stock = models.BooleanField(default=True)
    notify_on_price_drop = models.BooleanField(default=True)
    target_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Rastreamento
    price_when_added = models.DecimalField(max_digits=10, decimal_places=2)
    stock_when_added = models.IntegerField()
    
    # Prioridade
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
    ]
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['collection', 'product']
        indexes = [
            models.Index(fields=['collection', '-created_at']),
            models.Index(fields=['product']),
        ]
    
    def __str__(self):
        return f"{self.collection.name} - {self.product.name}"
    
    def check_price_drop(self):
        """Verifica se o preço caiu"""
        current_price = self.product.price
        if self.target_price and current_price <= self.target_price:
            return True
        # Queda de pelo menos 10%
        if current_price < self.price_when_added * 0.9:
            return True
        return False
    
    def check_back_in_stock(self):
        """Verifica se voltou ao estoque"""
        return self.stock_when_added == 0 and self.product.stock > 0


class WishlistNotification(models.Model):
    """Notificações enviadas sobre itens da wishlist"""
    NOTIFICATION_TYPES = [
        ('price_drop', 'Queda de Preço'),
        ('back_in_stock', 'Voltou ao Estoque'),
        ('on_sale', 'Em Promoção'),
        ('low_stock', 'Estoque Baixo'),
    ]
    
    wishlist_item = models.ForeignKey(WishlistItem, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    was_clicked = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['wishlist_item', '-sent_at']),
        ]
    
    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.wishlist_item.product.name}"


class WishlistAnalytics(models.Model):
    """Analytics de produtos mais desejados"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='wishlist_analytics')
    
    total_wishlists = models.IntegerField(default=0)
    total_conversions = models.IntegerField(default=0)  # Quantos compraram após adicionar
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    last_30_days_additions = models.IntegerField(default=0)
    trending_score = models.FloatField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-total_wishlists']
        verbose_name = 'Wishlist Analytics'
        verbose_name_plural = 'Wishlist Analytics'
    
    def __str__(self):
        return f"{self.product.name} - {self.total_wishlists} wishlists"
    
    def update_stats(self):
        """Atualiza estatísticas"""
        from django.utils import timezone
        from datetime import timedelta
        
        # Total em wishlists
        self.total_wishlists = WishlistItem.objects.filter(product=self.product).count()
        
        # Adições nos últimos 30 dias
        thirty_days_ago = timezone.now() - timedelta(days=30)
        self.last_30_days_additions = WishlistItem.objects.filter(
            product=self.product,
            created_at__gte=thirty_days_ago
        ).count()
        
        # Trending score (mais adições recentes = maior score)
        if self.total_wishlists > 0:
            self.trending_score = (self.last_30_days_additions / self.total_wishlists) * 100
        
        # Taxa de conversão (se houver dados de pedidos)
        if self.total_conversions > 0 and self.total_wishlists > 0:
            self.conversion_rate = (self.total_conversions / self.total_wishlists) * 100
        
        self.save()
