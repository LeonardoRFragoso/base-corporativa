from django.db import models
from django.contrib.auth.models import AbstractUser
from catalog.models import Product
import uuid
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    email_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username


# DEPRECATED: Migrado para wishlist.WishlistItem (sistema avançado)
# Mantido temporariamente para compatibilidade com migrações existentes
class WishlistItem(models.Model):
    user = models.ForeignKey('users.User', related_name='old_wishlist', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='old_wishlist_items')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')


class EmailVerificationToken(models.Model):
    """Token para verificação de email no cadastro"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)
    
    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at
    
    def __str__(self):
        return f"Email verification for {self.user.email}"


class PasswordResetToken(models.Model):
    """Token para reset de senha"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)
    
    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at
    
    def __str__(self):
        return f"Password reset for {self.user.email}"
