from django.db import models
from django.conf import settings
from .models import ProductVariant


class StockMovement(models.Model):
    MOVEMENT_TYPES = (
        ('sale', 'Venda'),
        ('purchase', 'Compra'),
        ('adjustment', 'Ajuste Manual'),
        ('return', 'Devolução'),
        ('damage', 'Avaria'),
        ('transfer', 'Transferência'),
    )
    
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField(help_text='Positivo para entrada, negativo para saída')
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    reason = models.TextField(blank=True)
    reference = models.CharField(max_length=200, blank=True, help_text='Pedido ID, nota fiscal, etc')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['variant', '-created_at']),
            models.Index(fields=['movement_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.variant.sku} - {self.get_movement_type_display()} - {self.quantity}"
    
    @classmethod
    def record_movement(cls, variant, movement_type, quantity, reason='', reference='', user=None):
        """Helper para registrar movimentação de estoque"""
        previous_stock = variant.stock
        new_stock = previous_stock + quantity
        
        # Atualizar estoque da variante
        variant.stock = new_stock
        variant.save(update_fields=['stock'])
        
        # Criar registro de movimentação
        movement = cls.objects.create(
            variant=variant,
            movement_type=movement_type,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=reason,
            reference=reference,
            created_by=user
        )
        
        return movement
