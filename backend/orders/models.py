from django.db import models
from django.conf import settings
from catalog.models import ProductVariant
from addresses.models import Address

class Order(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("canceled", "Canceled"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    shipping_address = models.ForeignKey(Address, null=True, blank=True, on_delete=models.SET_NULL)
    email = models.EmailField(blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    currency = models.CharField(max_length=10, default="BRL")
    shipping_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    external_reference = models.CharField(max_length=100, blank=True)
    mp_payment_id = models.CharField(max_length=100, blank=True)
    mp_status = models.CharField(max_length=50, blank=True)
    shipping_service_name = models.CharField(max_length=120, blank=True)
    shipping_carrier = models.CharField(max_length=120, blank=True)
    destination_zip = models.CharField(max_length=20, blank=True)
    # Guest shipping address fields (for non-authenticated checkout)
    shipping_first_name = models.CharField(max_length=100, blank=True)
    shipping_last_name = models.CharField(max_length=100, blank=True)
    shipping_phone = models.CharField(max_length=30, blank=True)
    shipping_street = models.CharField(max_length=200, blank=True)
    shipping_number = models.CharField(max_length=20, blank=True)
    shipping_complement = models.CharField(max_length=200, blank=True)
    shipping_neighborhood = models.CharField(max_length=120, blank=True)
    shipping_city = models.CharField(max_length=120, blank=True)
    shipping_state = models.CharField(max_length=50, blank=True)
    shipping_zip = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, null=True, blank=True)
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
