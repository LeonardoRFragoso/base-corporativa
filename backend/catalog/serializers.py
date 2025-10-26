from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage
from django.utils.text import slugify
import uuid
from decimal import Decimal, InvalidOperation


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
        # Normalize base_price that may come as "54,90"
        bp = validated_data.get('base_price')
        if isinstance(bp, str):
            try:
                if ',' in bp:
                    validated_data['base_price'] = Decimal(bp.replace('.', '').replace(',', '.'))
                else:
                    validated_data['base_price'] = Decimal(bp)
            except InvalidOperation:
                raise serializers.ValidationError({'base_price': 'Número inválido'})

        validated_data['slug'] = slug
        product = super().create(validated_data)

        for idx, v in enumerate(variants_data or []):
            # Normalize size and numbers
            size_raw = (v.get('size') or '').upper().strip()
            size_map = {'PP':'XS','P':'S','M':'M','G':'L','GG':'XL','XG':'XL','EG':'XL','XXG':'XXL','XGG':'XXL'}
            size_norm = size_raw if size_raw in ['XS','S','M','L','XL','XXL'] else size_map.get(size_raw, size_raw)

            price_raw = v.get('price')
            if isinstance(price_raw, str):
                try:
                    if ',' in price_raw:
                        price_val = Decimal(price_raw.replace('.', '').replace(',', '.'))
                    else:
                        price_val = Decimal(price_raw)
                except InvalidOperation:
                    price_val = product.base_price
            else:
                price_val = price_raw if price_raw is not None else product.base_price

            stock_raw = v.get('stock')
            try:
                stock_val = int(stock_raw) if stock_raw is not None else 0
            except (TypeError, ValueError):
                stock_val = 0

            sku_base = f"{slug}-{(v.get('color') or 'std').lower()}-{(v.get('size') or 'u').lower()}"
            sku = sku_base
            j = 1
            while ProductVariant.objects.filter(sku=sku).exists():
                j += 1
                sku = f"{sku_base}-{j}"
            ProductVariant.objects.create(
                product=product,
                size=size_norm,
                color=v.get('color', ''),
                sku=sku,
                price=price_val,
                stock=stock_val,
                is_default=bool(v.get('is_default')),
            )
        return product

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        bp = validated_data.get('base_price')
        if isinstance(bp, str):
            try:
                validated_data['base_price'] = Decimal(bp.replace('.', '').replace(',', '.'))
            except InvalidOperation:
                raise serializers.ValidationError({'base_price': 'Número inválido'})
        instance = super().update(instance, validated_data)

        if variants_data is not None:
            existing = {v.id: v for v in instance.variants.all()}
            sent_ids = set()

            for v in variants_data:
                vid = v.get('id')
                if vid and vid in existing:
                    obj = existing[vid]
                    size_raw = (v.get('size') or obj.size or '').upper().strip()
                    size_map = {'PP':'XS','P':'S','M':'M','G':'L','GG':'XL','XG':'XL','EG':'XL','XXG':'XXL','XGG':'XXL'}
                    obj.size = size_raw if size_raw in ['XS','S','M','L','XL','XXL'] else size_map.get(size_raw, size_raw)
                    obj.color = v.get('color', obj.color)
                    price_raw = v.get('price')
                    if isinstance(price_raw, str):
                        try:
                            if ',' in price_raw:
                                obj.price = Decimal(price_raw.replace('.', '').replace(',', '.'))
                            else:
                                obj.price = Decimal(price_raw)
                        except InvalidOperation:
                            obj.price = obj.price or instance.base_price
                    elif price_raw is not None:
                        obj.price = price_raw
                    obj.stock = int(v.get('stock')) if v.get('stock') is not None else obj.stock
                    obj.is_default = bool(v.get('is_default')) if v.get('is_default') is not None else obj.is_default
                    obj.save()
                    sent_ids.add(vid)
                else:
                    size_raw = (v.get('size') or '').upper().strip()
                    size_map = {'PP':'XS','P':'S','M':'M','G':'L','GG':'XL','XG':'XL','EG':'XL','XXG':'XXL','XGG':'XXL'}
                    size_norm = size_raw if size_raw in ['XS','S','M','L','XL','XXL'] else size_map.get(size_raw, size_raw)

                    price_raw = v.get('price')
                    if isinstance(price_raw, str):
                        try:
                            if ',' in price_raw:
                                price_val = Decimal(price_raw.replace('.', '').replace(',', '.'))
                            else:
                                price_val = Decimal(price_raw)
                        except InvalidOperation:
                            price_val = instance.base_price
                    else:
                        price_val = price_raw if price_raw is not None else instance.base_price

                    stock_raw = v.get('stock')
                    try:
                        stock_val = int(stock_raw) if stock_raw is not None else 0
                    except (TypeError, ValueError):
                        stock_val = 0

                    sku_base = f"{instance.slug}-{(v.get('color') or 'std').lower()}-{(v.get('size') or 'u').lower()}"
                    sku = sku_base
                    j = 1
                    while ProductVariant.objects.filter(sku=sku).exists():
                        j += 1
                        sku = f"{sku_base}-{j}"
                    obj = ProductVariant.objects.create(
                        product=instance,
                        size=size_norm,
                        color=v.get('color', ''),
                        sku=sku,
                        price=price_val,
                        stock=stock_val,
                        is_default=bool(v.get('is_default')),
                    )
                    sent_ids.add(obj.id)

            # Remove variants not sent
            for vid, obj in existing.items():
                if vid not in sent_ids:
                    obj.delete()

        return instance
