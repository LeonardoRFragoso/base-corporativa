from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage
from django.utils.text import slugify
import uuid
from decimal import Decimal, InvalidOperation


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = (
            'id', 'image', 'alt_text', 'is_primary', 'sort_order', 'variant'
        )
    
    def get_image(self, obj):
        if obj.image:
            # Get the absolute URL from the storage backend
            return obj.image.url
        return None


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
        try:
            variants_data = validated_data.pop('variants', None)
            bp = validated_data.get('base_price')
            if isinstance(bp, str):
                try:
                    validated_data['base_price'] = Decimal(bp.replace('.', '').replace(',', '.'))
                except InvalidOperation:
                    raise serializers.ValidationError({'base_price': 'Número inválido'})
            instance = super().update(instance, validated_data)
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating product {instance.id}: {e}", exc_info=True)
            raise

        if variants_data is not None:
            existing = {v.id: v for v in instance.variants.all()}
            sent_ids = set()

            for v in variants_data:
                vid = v.get('id')
                size_raw = (v.get('size') or '').upper().strip()
                size_map = {'PP':'XS','P':'S','M':'M','G':'L','GG':'XL','XG':'XL','EG':'XL','XXG':'XXL','XGG':'XXL'}
                size_norm = size_raw if size_raw in ['XS','S','M','L','XL','XXL'] else size_map.get(size_raw, size_raw)
                color = v.get('color', '')
                
                # Procura variante existente por ID ou por combinação (product, size, color)
                obj = None
                if vid and vid in existing:
                    obj = existing[vid]
                else:
                    # Tenta encontrar por combinação única
                    try:
                        obj = instance.variants.get(size=size_norm, color=color)
                    except ProductVariant.DoesNotExist:
                        obj = None
                    except ProductVariant.MultipleObjectsReturned:
                        # Se há múltiplas, pega a primeira
                        obj = instance.variants.filter(size=size_norm, color=color).first()
                
                # Processa preço
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

                if obj:
                    # Atualiza variante existente
                    obj.size = size_norm
                    obj.color = color
                    obj.price = price_val
                    obj.stock = stock_val
                    obj.is_default = bool(v.get('is_default', obj.is_default))
                    obj.save()
                    sent_ids.add(obj.id)
                else:
                    # Cria nova variante
                    sku_base = f"{instance.slug}-{color.lower() or 'std'}-{size_norm.lower() or 'u'}"
                    sku = sku_base
                    j = 1
                    while ProductVariant.objects.filter(sku=sku).exists():
                        j += 1
                        sku = f"{sku_base}-{j}"
                    
                    obj = ProductVariant.objects.create(
                        product=instance,
                        size=size_norm,
                        color=color,
                        sku=sku,
                        price=price_val,
                        stock=stock_val,
                        is_default=bool(v.get('is_default', False)),
                    )
                    sent_ids.add(obj.id)

            # Remove variants not sent
            for vid, obj in existing.items():
                if vid not in sent_ids:
                    obj.delete()

        return instance
