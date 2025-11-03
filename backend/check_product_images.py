"""
Script para verificar imagens dos produtos
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from catalog.models import Product, ProductImage
from django.conf import settings

print("🖼️  Verificando imagens dos produtos...")
print("=" * 80)
print()
print(f"📁 MEDIA_URL: {settings.MEDIA_URL}")
print(f"🪣 AWS_STORAGE_BUCKET_NAME: {settings.AWS_STORAGE_BUCKET_NAME}")
print(f"🌐 AWS_S3_CUSTOM_DOMAIN: {settings.AWS_S3_CUSTOM_DOMAIN}")
print()

# Buscar todos os produtos
products = Product.objects.all()

print(f"📦 Total de produtos: {products.count()}")
print()
print("-" * 80)

for product in products:
    print(f"\n📦 Produto: {product.name} (ID: {product.id})")
    
    # Buscar imagens do produto
    images = ProductImage.objects.filter(product=product)
    
    if images.exists():
        print(f"   🖼️  Imagens encontradas: {images.count()}")
        for img in images:
            print(f"      - {img.image.name}")
            if img.image:
                print(f"        URL: {img.image.url}")
    else:
        print(f"   ⚠️  Nenhuma imagem encontrada!")

print()
print("-" * 80)
print()
print("✅ Verificação concluída!")
