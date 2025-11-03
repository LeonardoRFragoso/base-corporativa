from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from catalog.models import Product
from .models import WishlistItem, WishlistNotification, WishlistAnalytics
from notifications.models import Notification


@receiver(post_save, sender=WishlistItem)
def create_wishlist_analytics(sender, instance, created, **kwargs):
    """Cria ou atualiza analytics quando item é adicionado"""
    if created:
        analytics, _ = WishlistAnalytics.objects.get_or_create(product=instance.product)
        analytics.update_stats()


@receiver(pre_save, sender=Product)
def check_wishlist_notifications(sender, instance, **kwargs):
    """Verifica se deve notificar usuários sobre mudanças no produto"""
    if not instance.pk:
        return
    
    try:
        old_product = Product.objects.get(pk=instance.pk)
    except Product.DoesNotExist:
        return
    
    # Verificar itens na wishlist deste produto
    wishlist_items = WishlistItem.objects.filter(product=instance)
    
    for item in wishlist_items:
        notifications_to_send = []
        
        # Voltou ao estoque
        if old_product.stock == 0 and instance.stock > 0 and item.notify_on_stock:
            notifications_to_send.append({
                'type': 'back_in_stock',
                'title': f'🎉 {instance.name} voltou ao estoque!',
                'message': f'O produto que você deseja está disponível novamente. Não perca!'
            })
        
        # Queda de preço
        if instance.price < old_product.price and item.notify_on_price_drop:
            discount_percent = ((old_product.price - instance.price) / old_product.price) * 100
            if discount_percent >= 10:  # Notificar apenas se desconto >= 10%
                notifications_to_send.append({
                    'type': 'price_drop',
                    'title': f'💰 Preço caiu! {instance.name}',
                    'message': f'O preço caiu {discount_percent:.0f}%! De R$ {old_product.price} por R$ {instance.price}'
                })
        
        # Atingiu preço alvo
        if item.target_price and instance.price <= item.target_price and item.notify_on_price_drop:
            notifications_to_send.append({
                'type': 'price_drop',
                'title': f'🎯 Preço alvo atingido! {instance.name}',
                'message': f'O produto atingiu seu preço desejado de R$ {item.target_price}!'
            })
        
        # Enviar notificações
        for notif_data in notifications_to_send:
            # Criar notificação na wishlist
            WishlistNotification.objects.create(
                wishlist_item=item,
                notification_type=notif_data['type'],
                message=notif_data['message']
            )
            
            # Criar notificação geral para o usuário
            Notification.create_notification(
                user=item.collection.user,
                notification_type='wishlist',
                title=notif_data['title'],
                message=notif_data['message'],
                link=f'/product/{instance.id}'
            )
