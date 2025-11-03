from django.db import models
from django.utils.text import slugify
import os


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey('Category', related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    fabric_type = models.CharField(max_length=100, blank=True)
    composition = models.TextField(blank=True)
    care_instructions = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    catalog_pdf = models.FileField(upload_to='product_pdfs/', blank=True, null=True)

    def __str__(self):
        return self.name
    
    def delete(self, *args, **kwargs):
        """
        Override delete to handle protected references gracefully.
        Remove all related objects before deleting the product.
        """
        # 1. Remove product from all carts (CartItem.variant -> ProductVariant.product)
        from cart.models import CartItem
        CartItem.objects.filter(variant__product=self).delete()
        
        # 2. Remove from wishlists
        from users.models import WishlistItem
        WishlistItem.objects.filter(product=self).delete()
        
        # 3. Handle OrderItems with PROTECT constraint
        # Set variant to NULL instead of deleting orders
        from orders.models import OrderItem
        OrderItem.objects.filter(variant__product=self).update(variant=None)
        
        # 4. Delete product images and their files
        for image in self.images.all():
            if image.image:
                try:
                    image.image.delete(save=False)
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Failed to delete image file {image.image.name}: {e}")
            image.delete()
        
        # 5. Delete catalog PDF if exists
        if self.catalog_pdf:
            try:
                self.catalog_pdf.delete(save=False)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to delete PDF file {self.catalog_pdf.name}: {e}")
        
        # Now delete the product (variants and reviews cascade automatically)
        super().delete(*args, **kwargs)


class ProductVariant(models.Model):
    SIZE_CHOICES = [
        ("XS", "XS"),
        ("S", "S"),
        ("M", "M"),
        ("L", "L"),
        ("XL", "XL"),
        ("XXL", "XXL"),
    ]

    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    size = models.CharField(max_length=8, choices=SIZE_CHOICES, blank=True)
    color = models.CharField(max_length=50, blank=True)
    sku = models.CharField(max_length=64, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_default = models.BooleanField(default=False)

    class Meta:
        unique_together = ('product', 'size', 'color')

    def __str__(self):
        label = f"{self.product.name}"
        if self.color:
            label += f" - {self.color}"
        if self.size:
            label += f" {self.size}"
        return label


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, related_name='images', on_delete=models.CASCADE, blank=True, null=True)
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"Image for {self.product.name}"
    
    def delete(self, *args, **kwargs):
        """
        Override delete to handle storage errors gracefully.
        If file deletion fails (e.g., file doesn't exist in R2), 
        still delete the database record.
        """
        if self.image:
            try:
                self.image.delete(save=False)
            except Exception as e:
                # Log the error but don't fail the deletion
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to delete image file {self.image.name}: {e}")
        
        super().delete(*args, **kwargs)
