from django.db.models.signals import post_save
from django.dispatch import receiver
from orders.models import Order
from reviews.models import Review
from catalog.models import ProductVariant
from .models import Notification


@receiver(post_save, sender=Order)
def notify_new_order(sender, instance, created, **kwargs):
    """Notificar admins sobre novos pedidos"""
    if created:
        Notification.notify_admins(
            notification_type='new_order',
            title='Novo Pedido Recebido',
            message=f'Pedido #{instance.id} de {instance.email} - Total: R$ {instance.total_amount:.2f}',
            link=f'/admin/orders'
        )


@receiver(post_save, sender=Review)
def notify_new_review(sender, instance, created, **kwargs):
    """Notificar admins sobre novas avaliações"""
    if created:
        Notification.notify_admins(
            notification_type='new_review',
            title='Nova Avaliação Pendente',
            message=f'Nova avaliação de {instance.user.email if instance.user else "Anônimo"} para {instance.product.name}',
            link=f'/admin/reviews'
        )


@receiver(post_save, sender=ProductVariant)
def notify_low_stock(sender, instance, **kwargs):
    """Notificar admins sobre estoque baixo"""
    if instance.stock <= 2 and instance.stock > 0:
        Notification.notify_admins(
            notification_type='low_stock',
            title='Alerta de Estoque Baixo',
            message=f'{instance.product.name} ({instance.sku}) - Apenas {instance.stock} unidade(s) restante(s)',
            link=f'/admin/products'
        )
    elif instance.stock == 0:
        Notification.notify_admins(
            notification_type='low_stock',
            title='Produto Sem Estoque',
            message=f'{instance.product.name} ({instance.sku}) está SEM ESTOQUE!',
            link=f'/admin/products'
        )
