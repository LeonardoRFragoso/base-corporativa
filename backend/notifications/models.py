from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('new_order', 'Novo Pedido'),
        ('low_stock', 'Estoque Baixo'),
        ('new_review', 'Nova Avaliação'),
        ('order_status', 'Status do Pedido'),
        ('system', 'Sistema'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True)  # URL para redirecionar
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'read', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    @classmethod
    def create_notification(cls, user, notification_type, title, message, link=''):
        """Helper para criar notificações"""
        return cls.objects.create(
            user=user,
            type=notification_type,
            title=title,
            message=message,
            link=link
        )
    
    @classmethod
    def notify_admins(cls, notification_type, title, message, link=''):
        """Notificar todos os admins"""
        from users.models import User
        admins = User.objects.filter(is_staff=True, is_active=True)
        notifications = []
        for admin in admins:
            notifications.append(cls(
                user=admin,
                type=notification_type,
                title=title,
                message=message,
                link=link
            ))
        cls.objects.bulk_create(notifications)
        return len(notifications)
