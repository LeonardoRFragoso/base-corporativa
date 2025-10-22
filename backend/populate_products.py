#!/usr/bin/env python
"""
Script para popular produtos da BASE CORPORATIVA
Execute: python manage.py shell < populate_products.py
"""

import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from catalog.models import Category, Product, ProductVariant, ProductImage

def create_products():
    # Criar categoria se não existir
    category, created = Category.objects.get_or_create(
        name="Camisetas",
        defaults={
            'description': "Camisetas oversized de alta qualidade para o dia a dia profissional"
        }
    )
    
    if created:
        print(f"✅ Categoria criada: {category.name}")
    else:
        print(f"📁 Categoria já existe: {category.name}")

    # Dados dos produtos
    products_data = [
        {
            'name': 'Camiseta Oversized Bege',
            'color': 'Bege',
            'description': 'Camiseta oversized em tom bege neutro, perfeita para compor looks minimalistas e sofisticados. Tecido premium com toque macio e caimento perfeito.',
            'price': 79.90,
            'images': [
                'CAMISETA OVERSIZED BEGE 1.png',
                'CAMISETA OVERSIZED BEGE 2.png',
                'CAMISETA OVERSIZED BEGE 3.png'
            ]
        },
        {
            'name': 'Camiseta Oversized Branca',
            'color': 'Branca',
            'description': 'Camiseta oversized branca clássica, essencial no guarda-roupa corporativo. Versatilidade e elegância em uma peça atemporal.',
            'price': 79.90,
            'images': [
                'CAMISETA OVERSIZED BRANCA 1.png',
                'CAMISETA OVERSIZED BRANCA 2.png'
            ]
        },
        {
            'name': 'Camiseta Oversized Cinza',
            'color': 'Cinza',
            'description': 'Camiseta oversized em tom cinza moderno, ideal para looks profissionais despojados. Combina perfeitamente com qualquer peça do seu guarda-roupa.',
            'price': 79.90,
            'images': [
                'CAMISETA OVERSIZED CINZA 1.png',
                'CAMISETA OVERSIZED CINZA 2.png'
            ]
        },
        {
            'name': 'Camiseta Oversized Preta',
            'color': 'Preta',
            'description': 'Camiseta oversized preta premium, a base perfeita para qualquer look corporativo. Sofisticação e conforto em uma peça indispensável.',
            'price': 79.90,
            'images': [
                'CAMISETA OVERSIZED PRETA 1.png',
                'CAMISETA OVERSIZED PRETA 2.png',
                'CAMISETA OVERSIZED PRETA 3.png'
            ]
        }
    ]

    # Criar produtos
    for product_data in products_data:
        # Criar produto
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults={
                'description': product_data['description'],
                'base_price': product_data['price'],
                'category': category,
                'fabric_type': 'Algodão Premium',
                'fabric_composition': '95% Algodão, 5% Elastano',
                'care_instructions': 'Lavar à máquina em água fria. Não usar alvejante. Secar à sombra.',
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ Produto criado: {product.name}")
            
            # Criar variantes de tamanho
            sizes = ['P', 'M', 'G', 'GG']
            for size in sizes:
                variant, variant_created = ProductVariant.objects.get_or_create(
                    product=product,
                    size=size,
                    defaults={
                        'color': product_data['color'],
                        'stock_quantity': 15,
                        'price_adjustment': 0.00
                    }
                )
                if variant_created:
                    print(f"  📦 Variante criada: {size} - {product_data['color']}")
            
            # Criar imagens
            for i, image_name in enumerate(product_data['images']):
                image_path = f"products/{image_name}"
                product_image, img_created = ProductImage.objects.get_or_create(
                    product=product,
                    image=image_path,
                    defaults={
                        'alt_text': f"{product.name} - Imagem {i+1}",
                        'is_primary': i == 0  # Primeira imagem é primária
                    }
                )
                if img_created:
                    print(f"  🖼️  Imagem adicionada: {image_name}")
        else:
            print(f"📁 Produto já existe: {product.name}")

    print("\n🎉 Processo concluído!")
    print(f"📊 Total de produtos: {Product.objects.count()}")
    print(f"📦 Total de variantes: {ProductVariant.objects.count()}")
    print(f"🖼️  Total de imagens: {ProductImage.objects.count()}")

if __name__ == "__main__":
    create_products()
