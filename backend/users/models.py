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


class UserConsent(models.Model):
    """
    Modelo para registrar consentimentos do usuário (LGPD Art. 7º e 8º)
    Armazena o histórico de consentimentos dados pelo usuário
    """
    CONSENT_TYPES = (
        ('terms', 'Termos de Uso'),
        ('privacy', 'Política de Privacidade'),
        ('marketing', 'Comunicações de Marketing'),
        ('cookies_functional', 'Cookies Funcionais'),
        ('cookies_analytics', 'Cookies de Análise'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consents')
    consent_type = models.CharField(max_length=50, choices=CONSENT_TYPES)
    consent_given = models.BooleanField(default=False)
    consent_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    version = models.CharField(max_length=20, default='1.0')  # Versão do documento aceito
    revoked_at = models.DateTimeField(null=True, blank=True)
    revoked_ip = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-consent_date']
        indexes = [
            models.Index(fields=['user', 'consent_type']),
            models.Index(fields=['consent_date']),
        ]
    
    def __str__(self):
        status = "Aceito" if self.consent_given else "Recusado"
        revoked = " (Revogado)" if self.revoked_at else ""
        return f"{self.user.username} - {self.get_consent_type_display()} - {status}{revoked}"
    
    def revoke(self, ip_address):
        """Revoga o consentimento"""
        self.revoked_at = timezone.now()
        self.revoked_ip = ip_address
        self.save()
    
    @property
    def is_active(self):
        """Verifica se o consentimento está ativo (não revogado)"""
        return self.consent_given and self.revoked_at is None


class DataDeletionRequest(models.Model):
    """
    Modelo para registrar solicitações de exclusão de dados (LGPD Art. 18, VI)
    Direito ao esquecimento
    """
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('processing', 'Em Processamento'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deletion_requests')
    request_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    processed_date = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='processed_deletions'
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-request_date']
    
    def __str__(self):
        return f"Solicitação de exclusão - {self.user.username} - {self.get_status_display()}"
    
    def complete(self, processed_by=None):
        """Marca a solicitação como concluída"""
        self.status = 'completed'
        self.processed_date = timezone.now()
        self.processed_by = processed_by
        self.save()


class DataExportRequest(models.Model):
    """
    Modelo para registrar solicitações de exportação de dados (LGPD Art. 18, II)
    Direito de portabilidade
    """
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('processing', 'Em Processamento'),
        ('completed', 'Concluído'),
        ('failed', 'Falhou'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='export_requests')
    request_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    completed_date = models.DateTimeField(null=True, blank=True)
    file_path = models.CharField(max_length=500, blank=True)  # Caminho do arquivo gerado
    download_count = models.IntegerField(default=0)
    expires_at = models.DateTimeField()  # Link expira em 7 dias
    
    class Meta:
        ordering = ['-request_date']
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Exportação de dados - {self.user.username} - {self.get_status_display()}"
    
    def is_expired(self):
        """Verifica se o link de download expirou"""
        return timezone.now() > self.expires_at
