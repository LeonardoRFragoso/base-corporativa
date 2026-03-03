from rest_framework import serializers
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    # Campos adicionais da variante
    variant_size = serializers.CharField(source='variant.size', read_only=True)
    variant_color = serializers.CharField(source='variant.color', read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    stock = serializers.IntegerField(source='variant.stock', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    image = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        """Retorna URL da imagem principal do produto"""
        try:
            # Tentar imagem salva no snapshot
            if obj.image_url:
                return {'url': obj.image_url, 'alt': obj.product_name}
            
            # Buscar imagem do produto
            primary_image = obj.variant.product.images.filter(is_primary=True).first()
            if not primary_image:
                primary_image = obj.variant.product.images.first()
            
            if primary_image:
                return {
                    'url': primary_image.image.url,
                    'alt': primary_image.alt_text or obj.product_name
                }
        except Exception:
            pass
        return None
    
    class Meta:
        model = CartItem
        fields = (
            "id", "variant", "product_id", "product_slug", "product_name",
            "unit_price", "quantity", "size", "color", "sku",
            "variant_size", "variant_color", "variant_sku", "stock", "image"
        )


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    
    def get_subtotal(self, obj):
        """Calcula subtotal do carrinho"""
        return sum(item.unit_price * item.quantity for item in obj.items.all())
    
    def get_total_items(self, obj):
        """Calcula total de itens no carrinho"""
        return sum(item.quantity for item in obj.items.all())

    class Meta:
        model = Cart
        fields = ("id", "user", "session_key", "items", "subtotal", "total_items")
