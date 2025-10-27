#!/usr/bin/env python
"""
Script de diagnóstico para verificar configuração de storage
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.core.files.storage import default_storage

print("=" * 70)
print("DIAGNÓSTICO DE STORAGE")
print("=" * 70)

print("\n📋 Variáveis de Ambiente AWS:")
print(f"   AWS_STORAGE_BUCKET_NAME: {os.environ.get('AWS_STORAGE_BUCKET_NAME', 'NOT SET')}")
print(f"   AWS_ACCESS_KEY_ID: {os.environ.get('AWS_ACCESS_KEY_ID', 'NOT SET')[:10]}...")
print(f"   AWS_S3_ENDPOINT_URL: {os.environ.get('AWS_S3_ENDPOINT_URL', 'NOT SET')}")
print(f"   AWS_S3_CUSTOM_DOMAIN: {os.environ.get('AWS_S3_CUSTOM_DOMAIN', 'NOT SET')}")

print("\n⚙️  Configurações Django:")
print(f"   DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
print(f"   MEDIA_URL: {settings.MEDIA_URL}")
print(f"   MEDIA_ROOT: {settings.MEDIA_ROOT}")

if hasattr(settings, 'AWS_STORAGE_BUCKET_NAME'):
    print(f"   AWS_STORAGE_BUCKET_NAME: {settings.AWS_STORAGE_BUCKET_NAME}")
    print(f"   AWS_S3_ENDPOINT_URL: {settings.AWS_S3_ENDPOINT_URL}")
    print(f"   AWS_S3_CUSTOM_DOMAIN: {settings.AWS_S3_CUSTOM_DOMAIN}")
    print(f"   AWS_LOCATION: {settings.AWS_LOCATION}")
    print(f"   AWS_S3_ADDRESSING_STYLE: {settings.AWS_S3_ADDRESSING_STYLE}")
else:
    print("   ❌ Configurações AWS não detectadas!")

print("\n🗄️  Default Storage:")
print(f"   Classe: {default_storage.__class__.__name__}")
print(f"   Módulo: {default_storage.__class__.__module__}")

if hasattr(default_storage, 'bucket_name'):
    print(f"   Bucket: {default_storage.bucket_name}")
if hasattr(default_storage, 'location'):
    print(f"   Location: {default_storage.location}")
if hasattr(default_storage, 'custom_domain'):
    print(f"   Custom Domain: {default_storage.custom_domain}")

print("\n🧪 Teste de Upload:")
try:
    from django.core.files.base import ContentFile
    
    test_content = b"Test file from Django diagnostic script"
    test_name = "test/diagnostic_test.txt"
    
    print(f"   Tentando salvar: {test_name}")
    saved_name = default_storage.save(test_name, ContentFile(test_content))
    print(f"   ✅ Salvo como: {saved_name}")
    
    url = default_storage.url(saved_name)
    print(f"   📎 URL: {url}")
    
    exists = default_storage.exists(saved_name)
    print(f"   🔍 Existe: {exists}")
    
    if exists:
        size = default_storage.size(saved_name)
        print(f"   📏 Tamanho: {size} bytes")
        
        # Cleanup
        default_storage.delete(saved_name)
        print(f"   🧹 Arquivo de teste removido")
    
except Exception as e:
    print(f"   ❌ Erro: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("FIM DO DIAGNÓSTICO")
print("=" * 70)
