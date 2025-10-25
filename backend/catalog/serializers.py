from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage
from django.utils.text import slugify


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = (
            'id', 'image', 'alt_text', 'is_primary', 'sort_order', 'variant'
        )


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = (
            'id', 'size', 'color', 'sku', 'price', 'stock', 'is_default'
        )


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            'id', 'name', 'slug', 'description'
        )


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'fabric_type', 'composition',
            'care_instructions', 'base_price', 'is_active', 'created_at', 'updated_at',
            'category', 'variants', 'images', 'catalog_pdf'
        )


class ProductWriteSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'fabric_type', 'composition',
            'care_instructions', 'base_price', 'is_active', 'category'
        )
        read_only_fields = ('id', 'slug')

    def create(self, validated_data):
        name = validated_data.get('name') or ''
        base = slugify(name) or 'produto'
        slug = base
        i = 1
        while Product.objects.filter(slug=slug).exists():
            i += 1
            slug = f"{base}-{i}"
        validated_data['slug'] = slug
        return super().create(validated_data)
