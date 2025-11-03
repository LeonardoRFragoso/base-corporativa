from django.db import models
from django.utils import timezone
from catalog.models import Product


class FlashSale(models.Model):
    """Ofertas Relâmpago com tempo limitado"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    max_quantity = models.IntegerField(null=True, blank=True, help_text='Deixe vazio para ilimitado')
    current_sold = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    products = models.ManyToManyField(Product, related_name='flash_sales')
    banner_image = models.ImageField(upload_to='flash_sales/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']
        verbose_name = 'Oferta Relâmpago'
        verbose_name_plural = 'Ofertas Relâmpago'
    
    def __str__(self):
        return f"{self.name} - {self.discount_percentage}% OFF"
    
    def is_live(self):
        """Verifica se a oferta está ativa no momento"""
        now = timezone.now()
        return self.is_active and self.start_time <= now <= self.end_time
    
    def has_stock(self):
        """Verifica se ainda tem estoque disponível"""
        if not self.max_quantity:
            return True
        return self.current_sold < self.max_quantity
    
    def time_remaining(self):
        """Retorna tempo restante em segundos"""
        if not self.is_live():
            return 0
        return int((self.end_time - timezone.now()).total_seconds())
    
    def increment_sold(self):
        """Incrementa contador de vendas"""
        self.current_sold += 1
        self.save(update_fields=['current_sold'])
