from rest_framework import serializers
from .models import WishlistCollection, WishlistItem, WishlistNotification, WishlistAnalytics
from catalog.serializers import ProductSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    price_drop = serializers.SerializerMethodField()
    back_in_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = WishlistItem
        fields = [
            'id', 'product', 'product_id', 'priority', 'notes',
            'notify_on_sale', 'notify_on_stock', 'notify_on_price_drop',
            'target_price', 'price_when_added', 'stock_when_added',
            'price_drop', 'back_in_stock', 'created_at'
        ]
        read_only_fields = ['price_when_added', 'stock_when_added', 'created_at']
    
    def get_price_drop(self, obj):
        return obj.check_price_drop()
    
    def get_back_in_stock(self, obj):
        return obj.check_back_in_stock()


class WishlistCollectionSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    share_url = serializers.SerializerMethodField()
    
    class Meta:
        model = WishlistCollection
        fields = [
            'id', 'name', 'description', 'is_default', 'is_public',
            'share_token', 'share_url', 'items', 'items_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['share_token', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_share_url(self, obj):
        from django.conf import settings
        if obj.is_public:
            return f"{settings.FRONTEND_BASE_URL}/wishlist/shared/{obj.share_token}"
        return None


class WishlistNotificationSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='wishlist_item.product.name', read_only=True)
    product_id = serializers.IntegerField(source='wishlist_item.product.id', read_only=True)
    
    class Meta:
        model = WishlistNotification
        fields = [
            'id', 'notification_type', 'message', 'sent_at',
            'was_clicked', 'product_name', 'product_id'
        ]


class WishlistAnalyticsSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = WishlistAnalytics
        fields = [
            'product', 'total_wishlists', 'total_conversions',
            'conversion_rate', 'last_30_days_additions',
            'trending_score', 'updated_at'
        ]
