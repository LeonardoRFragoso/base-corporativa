from django.db import models
from django.contrib.auth.models import AbstractUser
from catalog.models import Product

class User(AbstractUser):
    pass


class WishlistItem(models.Model):
    user = models.ForeignKey('users.User', related_name='wishlist', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
