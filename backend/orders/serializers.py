from rest_framework import serializers
from .models import Order, OrderItem
from catalog.models import ProductVariant


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "variant", "product_name", "unit_price", "quantity")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "status", "currency", "shipping_price", "total_amount",
            "email", "first_name", "last_name",
            "shipping_service_name", "shipping_carrier", "destination_zip", "tracking_code",
            "shipping_first_name", "shipping_last_name", "shipping_phone",
            "shipping_street", "shipping_number", "shipping_complement",
            "shipping_neighborhood", "shipping_city", "shipping_state", "shipping_zip",
            "external_reference", "mp_payment_id", "mp_status",
            "created_at", "items"
        )
        read_only_fields = ("id", "external_reference", "mp_payment_id", "mp_status", "created_at")


class OrderCreateItemInput(serializers.Serializer):
    variant_id = serializers.IntegerField(required=False)
    product_name = serializers.CharField(required=False, allow_blank=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    destination_zip = serializers.CharField(required=False, allow_blank=True)
    shipping_service_name = serializers.CharField(required=False, allow_blank=True)
    shipping_carrier = serializers.CharField(required=False, allow_blank=True)
    shipping_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    shipping_first_name = serializers.CharField(required=False, allow_blank=True)
    shipping_last_name = serializers.CharField(required=False, allow_blank=True)
    shipping_phone = serializers.CharField(required=False, allow_blank=True)
    shipping_street = serializers.CharField(required=False, allow_blank=True)
    shipping_number = serializers.CharField(required=False, allow_blank=True)
    shipping_complement = serializers.CharField(required=False, allow_blank=True)
    shipping_neighborhood = serializers.CharField(required=False, allow_blank=True)
    shipping_city = serializers.CharField(required=False, allow_blank=True)
    shipping_state = serializers.CharField(required=False, allow_blank=True)
    shipping_zip = serializers.CharField(required=False, allow_blank=True)
    items = OrderCreateItemInput(many=True)

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context.get("request").user if self.context.get("request") else None
        order = Order.objects.create(user=user if user and user.is_authenticated else None, **validated_data)
        total = 0
        for it in items_data:
            variant = None
            name = it.get("product_name")
            if it.get("variant_id"):
                try:
                    variant = ProductVariant.objects.select_related('product').get(id=it["variant_id"])
                    if not name:
                        name = variant.product.name
                except ProductVariant.DoesNotExist:
                    variant = None
            qty = int(it["quantity"]) or 1
            price = it["unit_price"]
            OrderItem.objects.create(order=order, variant=variant, product_name=name or "Produto", unit_price=price, quantity=qty)
            total += float(price) * qty
        order.total_amount = total + float(order.shipping_price or 0)
        order.save(update_fields=["total_amount"]) 
        return order
