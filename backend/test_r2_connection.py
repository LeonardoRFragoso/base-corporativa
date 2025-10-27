#!/usr/bin/env python
"""
Script para testar conexão com Cloudflare R2
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

import boto3
from botocore.exceptions import ClientError
from django.conf import settings

def test_r2_connection():
    """Test connection to Cloudflare R2"""
    
    print("=" * 60)
    print("TESTE DE CONEXÃO COM CLOUDFLARE R2")
    print("=" * 60)
    
    # Check if S3 storage is configured
    if not hasattr(settings, 'AWS_STORAGE_BUCKET_NAME'):
        print("❌ AWS_STORAGE_BUCKET_NAME não configurado!")
        print("   Verifique as variáveis de ambiente no Railway.")
        return False
    
    print("\n📋 Configuração Atual:")
    print(f"   Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
    print(f"   Endpoint: {settings.AWS_S3_ENDPOINT_URL}")
    print(f"   Region: {settings.AWS_S3_REGION_NAME}")
    print(f"   Custom Domain: {settings.AWS_S3_CUSTOM_DOMAIN}")
    print(f"   Access Key: {settings.AWS_ACCESS_KEY_ID[:10]}...")
    print(f"   Addressing Style: {settings.AWS_S3_ADDRESSING_STYLE}")
    
    # Create S3 client
    print("\n🔌 Criando cliente S3...")
    try:
        s3_client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
            config=boto3.session.Config(
                signature_version=settings.AWS_S3_SIGNATURE_VERSION,
                s3={'addressing_style': settings.AWS_S3_ADDRESSING_STYLE}
            )
        )
        print("✅ Cliente S3 criado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao criar cliente S3: {e}")
        return False
    
    # Test bucket access
    print(f"\n🪣 Testando acesso ao bucket '{settings.AWS_STORAGE_BUCKET_NAME}'...")
    try:
        response = s3_client.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            MaxKeys=10
        )
        
        object_count = response.get('KeyCount', 0)
        print(f"✅ Bucket acessível! Objetos encontrados: {object_count}")
        
        if object_count > 0:
            print("\n📁 Arquivos no bucket:")
            for obj in response.get('Contents', []):
                print(f"   - {obj['Key']} ({obj['Size']} bytes)")
        else:
            print("   (Bucket vazio)")
            
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_msg = e.response['Error']['Message']
        print(f"❌ Erro ao acessar bucket: {error_code} - {error_msg}")
        
        if error_code == 'NoSuchBucket':
            print("   💡 O bucket não existe ou o nome está incorreto.")
        elif error_code == 'AccessDenied':
            print("   💡 Credenciais inválidas ou sem permissão.")
        elif error_code == 'InvalidAccessKeyId':
            print("   💡 Access Key ID inválido.")
        
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False
    
    # Test upload
    print("\n📤 Testando upload de arquivo...")
    test_content = b"Test file from Django - " + str(os.urandom(16)).encode()
    test_key = "test/django_test.txt"
    
    try:
        s3_client.put_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=test_key,
            Body=test_content,
            ContentType='text/plain'
        )
        print(f"✅ Upload bem-sucedido! Arquivo: {test_key}")
        
        # Verify upload
        print("\n🔍 Verificando arquivo enviado...")
        response = s3_client.head_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=test_key
        )
        print(f"✅ Arquivo verificado! Tamanho: {response['ContentLength']} bytes")
        
        # Generate URL
        if settings.AWS_S3_CUSTOM_DOMAIN:
            url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{settings.AWS_STORAGE_BUCKET_NAME}/{test_key}"
        else:
            url = f"{settings.AWS_S3_ENDPOINT_URL}/{settings.AWS_STORAGE_BUCKET_NAME}/{test_key}"
        
        print(f"\n🌐 URL do arquivo:")
        print(f"   {url}")
        
        # Clean up
        print("\n🧹 Limpando arquivo de teste...")
        s3_client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=test_key
        )
        print("✅ Arquivo de teste removido!")
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_msg = e.response['Error']['Message']
        print(f"❌ Erro no upload: {error_code} - {error_msg}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado no upload: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 60)
    print("✅ TODOS OS TESTES PASSARAM!")
    print("=" * 60)
    return True

if __name__ == '__main__':
    success = test_r2_connection()
    sys.exit(0 if success else 1)
