from django.db import models
from django.conf import settings
from catalog.models import Product

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    rating = models.PositiveIntegerField()  # 1..5
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    approved = models.BooleanField(default=False)
    admin_response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Review de {self.user.email if self.user else 'Anônimo'} para {self.product.name}"
