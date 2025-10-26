from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage
from django.utils.text import slugify
import uuid


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


class ProductVariantWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ProductVariant
        fields = (
            'id', 'size', 'color', 'price', 'stock', 'is_default'
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
    variants = ProductVariantWriteSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'fabric_type', 'composition',
            'care_instructions', 'base_price', 'is_active', 'category', 'variants'
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
        variants_data = validated_data.pop('variants', [])
        validated_data['slug'] = slug
        product = super().create(validated_data)

        for idx, v in enumerate(variants_data or []):
            sku_base = f"{slug}-{(v.get('color') or 'std').lower()}-{(v.get('size') or 'u').lower()}"
            sku = sku_base
            j = 1
            while ProductVariant.objects.filter(sku=sku).exists():
                j += 1
                sku = f"{sku_base}-{j}"
            ProductVariant.objects.create(
                product=product,
                size=v.get('size', ''),
                color=v.get('color', ''),
                sku=sku,
                price=v.get('price') if v.get('price') is not None else product.base_price,
                stock=v.get('stock') or 0,
                is_default=bool(v.get('is_default')),
            )
        return product

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        instance = super().update(instance, validated_data)

        if variants_data is not None:
            existing = {v.id: v for v in instance.variants.all()}
            sent_ids = set()

            for v in variants_data:
                vid = v.get('id')
                if vid and vid in existing:
                    obj = existing[vid]
                    obj.size = v.get('size', obj.size)
                    obj.color = v.get('color', obj.color)
                    obj.price = v.get('price') if v.get('price') is not None else (obj.price or instance.base_price)
                    obj.stock = v.get('stock') if v.get('stock') is not None else obj.stock
                    obj.is_default = bool(v.get('is_default')) if v.get('is_default') is not None else obj.is_default
                    obj.save()
                    sent_ids.add(vid)
                else:
                    sku_base = f"{instance.slug}-{(v.get('color') or 'std').lower()}-{(v.get('size') or 'u').lower()}"
                    sku = sku_base
                    j = 1
                    while ProductVariant.objects.filter(sku=sku).exists():
                        j += 1
                        sku = f"{sku_base}-{j}"
                    obj = ProductVariant.objects.create(
                        product=instance,
                        size=v.get('size', ''),
                        color=v.get('color', ''),
                        sku=sku,
                        price=v.get('price') if v.get('price') is not None else instance.base_price,
                        stock=v.get('stock') or 0,
                        is_default=bool(v.get('is_default')),
                    )
                    sent_ids.add(obj.id)

            # Remove variants not sent
            for vid, obj in existing.items():
                if vid not in sent_ids:
                    obj.delete()

        return instance
