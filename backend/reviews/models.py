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
    
    # Compra verificada
    is_verified_purchase = models.BooleanField(default=False)
    order_id = models.IntegerField(null=True, blank=True)
    
    # Votos úteis
    helpful_count = models.IntegerField(default=0)
    not_helpful_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', '-created_at']),
            models.Index(fields=['product', 'rating']),
            models.Index(fields=['is_verified_purchase']),
        ]
    
    def __str__(self):
        return f"Review de {self.user.email if self.user else 'Anônimo'} para {self.product.name}"
    
    @property
    def helpfulness_score(self):
        """Calcula score de utilidade"""
        total = self.helpful_count + self.not_helpful_count
        if total == 0:
            return 0
        return (self.helpful_count / total) * 100


class ReviewImage(models.Model):
    """Fotos anexadas a reviews"""
    review = models.ForeignKey(Review, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='review_images/')
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Imagem de review {self.review.id}"


class ReviewVote(models.Model):
    """Votos de utilidade em reviews"""
    VOTE_CHOICES = [
        ('helpful', 'Útil'),
        ('not_helpful', 'Não útil'),
    ]
    
    review = models.ForeignKey(Review, related_name='votes', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=20, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['review', 'user']
        indexes = [
            models.Index(fields=['review', 'vote_type']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.get_vote_type_display()} - Review {self.review.id}"


class ProductQuestion(models.Model):
    """Perguntas sobre produtos"""
    product = models.ForeignKey(Product, related_name='questions', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.TextField()
    is_answered = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', '-created_at']),
            models.Index(fields=['is_answered']),
        ]
    
    def __str__(self):
        return f"Pergunta de {self.user.email} sobre {self.product.name}"


class ProductAnswer(models.Model):
    """Respostas a perguntas sobre produtos"""
    question = models.ForeignKey(ProductQuestion, related_name='answers', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    answer = models.TextField()
    is_from_seller = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_from_seller', '-helpful_count', '-created_at']
    
    def __str__(self):
        return f"Resposta de {self.user.email} para pergunta {self.question.id}"
