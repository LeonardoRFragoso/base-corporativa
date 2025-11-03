from django.db.models.signals import post_save
from django.dispatch import receiver
from orders.models import Order
from .models import CustomerLoyalty

@receiver(post_save, sender=Order)
def add_loyalty_points(sender, instance, **kwargs):
    """Adiciona pontos quando pedido é pago"""
    if instance.status == 'paid' and instance.user:
        # Criar ou obter fidelidade do cliente
        loyalty, created = CustomerLoyalty.objects.get_or_create(user=instance.user)
        
        # Adicionar pontos (1 ponto = R$ 1)
        points = int(instance.total_amount)
        loyalty.add_points(points, reason=f'Compra pedido #{instance.id}')
        
        # Calcular cashback
        cashback = loyalty.calculate_cashback(instance.total_amount)
        if cashback > 0:
            loyalty.add_points(int(cashback), reason=f'Cashback pedido #{instance.id}')