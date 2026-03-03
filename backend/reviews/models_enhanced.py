"""
Modelos adicionais para reviews
"""
from django.db import models
from django.conf import settings
from .models import Review


class ReviewVote(models.Model):
    """
    Votos de utilidade em reviews
    """
    review = models.ForeignKey(Review, related_name='votes', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_helpful = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('review', 'user')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['review', 'is_helpful']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {'Útil' if self.is_helpful else 'Não útil'} - Review {self.review.id}"


class ReviewReport(models.Model):
    """
    Reports de reviews inapropriados
    """
    REASON_CHOICES = [
        ('spam', 'Spam'),
        ('offensive', 'Ofensivo'),
        ('fake', 'Falso'),
        ('inappropriate', 'Inapropriado'),
        ('other', 'Outro'),
    ]
    
    review = models.ForeignKey(Review, related_name='reports', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['review', 'resolved']),
        ]
    
    def __str__(self):
        return f"Report de {self.user.email} - Review {self.review.id}"
