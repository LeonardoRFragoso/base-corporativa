from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey('Category', related_name='products', on_delete=models.PROTECT)
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
