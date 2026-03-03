from django.db import models
from django.conf import settings
from catalog.models import ProductVariant


class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=64, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['session_key', '-updated_at']),
        ]


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    # Snapshot fields - preservar dados mesmo se produto mudar
    size = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=50, blank=True)
    sku = models.CharField(max_length=64, blank=True)
    image_url = models.URLField(blank=True, max_length=500)
    product_id = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['cart', 'variant']),
        ]
