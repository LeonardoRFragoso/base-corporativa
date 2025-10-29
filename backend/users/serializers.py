from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from .models import WishlistItem

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Usuário já existe")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("E-mail já cadastrado")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "is_staff")
        read_only_fields = ("id", "username", "is_staff")


class WishlistItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ("id", "product_id", "product_name", "created_at")


class UserListSerializer(serializers.ModelSerializer):
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    days_since_last_order = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name", 
            "is_active", "is_staff", "date_joined", "last_login",
            "total_orders", "total_spent", "days_since_last_order"
        )

    def get_total_orders(self, obj):
        from orders.models import Order
        return Order.objects.filter(user=obj).count()

    def get_total_spent(self, obj):
        from orders.models import Order
        total = Order.objects.filter(user=obj, status='paid').aggregate(
            total=Sum('total_amount')
        )['total']
        return float(total or 0)

    def get_days_since_last_order(self, obj):
        from orders.models import Order
        from django.utils import timezone
        last_order = Order.objects.filter(user=obj).order_by('-created_at').first()
        if last_order:
            delta = timezone.now().date() - last_order.created_at.date()
            return delta.days
        return None
