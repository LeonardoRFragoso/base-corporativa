"""
Script para verificar e corrigir URLs de PDFs no R2
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from catalog.models import Product
from django.conf import settings

print("🔍 Verificando produtos com PDFs...")
print(f"📁 MEDIA_URL configurado: {settings.MEDIA_URL}")
print(f"🪣 Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
print(f"🌐 Custom Domain: {settings.AWS_S3_CUSTOM_DOMAIN}")
print()

products_with_pdf = Product.objects.exclude(catalog_pdf='').exclude(catalog_pdf__isnull=True)
total = products_with_pdf.count()

print(f"📊 Total de produtos com PDF: {total}")
print()

if total == 0:
    print("✅ Nenhum produto com PDF encontrado.")
else:
    print("📋 Lista de produtos com PDF:")
    print("-" * 80)
    
    for product in products_with_pdf:
        pdf_path = product.catalog_pdf.name if product.catalog_pdf else 'N/A'
        
        # Gerar URL completa
        if product.catalog_pdf:
            pdf_url = product.catalog_pdf.url
        else:
            pdf_url = 'N/A'
        
        print(f"📦 Produto: {product.name}")
        print(f"   ID: {product.id}")
        print(f"   Caminho no storage: {pdf_path}")
        print(f"   URL gerada: {pdf_url}")
        print()

print("-" * 80)
print()
print("🔧 Para corrigir URLs:")
print("1. A URL deve ser: https://pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev/base-corporativa-media/product_pdfs/arquivo.pdf")
print("2. Verifique se o arquivo existe no bucket R2")
print("3. Se não existir, faça upload novamente")
print()
print("✅ Verificação concluída!")
