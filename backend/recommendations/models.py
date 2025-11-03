from django.db import models
from django.conf import settings
from catalog.models import Product
from django.utils import timezone


class ProductView(models.Model):
    """Rastreia visualizações de produtos por usuários"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='product_views')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='views')
    viewed_at = models.DateTimeField(auto_now_add=True)
    session_id = models.CharField(max_length=100, blank=True)  # Para usuários não logados
    
    class Meta:
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['user', '-viewed_at']),
            models.Index(fields=['product', '-viewed_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email if self.user else self.session_id} visualizou {self.product.name}"


class ProductRecommendation(models.Model):
    """Armazena recomendações pré-calculadas para performance"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recommendations')
    recommended_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recommended_for')
    score = models.FloatField(default=0.0)  # Score de relevância
    recommendation_type = models.CharField(max_length=50, choices=[
        ('also_bought', 'Quem comprou também comprou'),
        ('related', 'Produtos relacionados'),
        ('complete_look', 'Complete o look'),
        ('similar', 'Produtos similares'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-score']
        unique_together = ['product', 'recommended_product', 'recommendation_type']
        indexes = [
            models.Index(fields=['product', 'recommendation_type', '-score']),
        ]
    
    def __str__(self):
        return f"{self.product.name} -> {self.recommended_product.name} ({self.score:.2f})"


class UserRecommendation(models.Model):
    """Recomendações personalizadas por usuário"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    reason = models.CharField(max_length=200, blank=True)  # "Baseado no seu histórico", etc
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score', '-created_at']
        unique_together = ['user', 'product']
        indexes = [
            models.Index(fields=['user', '-score']),
        ]
    
    def __str__(self):
        return f"Recomendação para {self.user.email}: {self.product.name}"
