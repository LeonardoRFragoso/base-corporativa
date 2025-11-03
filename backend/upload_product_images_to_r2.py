"""
Script para fazer upload das imagens dos produtos para o Cloudflare R2
"""
import os
import boto3
from pathlib import Path
from botocore.exceptions import ClientError

# Configurações do R2
R2_ACCESS_KEY = '1b2b06a0569b1cef847eaf770ca146b8'
R2_SECRET_KEY = '04be2eee17efd5cb574fb6b9c3485c9762cecbd02a30f0585db93883b6cd156d'
R2_ENDPOINT = 'https://4c77a700894f0de680be07024f5cec36.r2.cloudflarestorage.com'
R2_BUCKET = 'base-corporativa-media'

def get_content_type(filename):
    """Retorna o content type baseado na extensão"""
    ext = filename.lower().split('.')[-1]
    content_types = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml'
    }
    return content_types.get(ext, 'application/octet-stream')

def upload_images_to_r2():
    """Faz upload das imagens dos produtos para o R2"""
    
    print("☁️  Upload de Imagens de Produtos para Cloudflare R2")
    print("=" * 80)
    print()
    
    # Criar cliente S3 (compatível com R2)
    s3_client = boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name='auto'
    )
    
    # Diretório das imagens
    images_dir = Path('media/products')
    
    if not images_dir.exists():
        print("❌ Diretório de imagens não encontrado!")
        print(f"   Procurado em: {images_dir.absolute()}")
        return
    
    # Listar imagens
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp']
    image_files = []
    for ext in image_extensions:
        image_files.extend(images_dir.glob(ext))
        # Case insensitive
        image_files.extend(images_dir.glob(ext.upper()))
    
    total = len(image_files)
    
    print(f"📦 Total de imagens encontradas: {total}")
    print()
    
    if total == 0:
        print("⚠️  Nenhuma imagem encontrada para upload.")
        return
    
    print("🔄 Fazendo upload...")
    print("-" * 80)
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for i, image_file in enumerate(image_files, 1):
        try:
            # Key no R2 (caminho no bucket)
            key = f'products/{image_file.name}'
            
            # Verificar se já existe
            try:
                s3_client.head_object(Bucket=R2_BUCKET, Key=key)
                print(f"⏭️  [{i}/{total}] Já existe: {image_file.name}")
                skipped_count += 1
                continue
            except ClientError:
                pass  # Não existe, fazer upload
            
            # Fazer upload
            content_type = get_content_type(image_file.name)
            
            with open(image_file, 'rb') as f:
                s3_client.put_object(
                    Bucket=R2_BUCKET,
                    Key=key,
                    Body=f,
                    ContentType=content_type,
                    CacheControl='max-age=31536000'  # 1 ano
                )
            
            # URL pública
            public_url = f'https://pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev/{R2_BUCKET}/{key}'
            
            print(f"✅ [{i}/{total}] {image_file.name}")
            print(f"   📤 Enviado para: {key}")
            print(f"   🌐 URL: {public_url}")
            print()
            
            success_count += 1
            
        except ClientError as e:
            print(f"❌ [{i}/{total}] ERRO ao enviar {image_file.name}")
            print(f"   Erro: {e}")
            print()
            error_count += 1
        except Exception as e:
            print(f"❌ [{i}/{total}] ERRO inesperado ao enviar {image_file.name}")
            print(f"   Erro: {e}")
            print()
            error_count += 1
    
    print("-" * 80)
    print()
    print("📊 RESUMO:")
    print(f"   ✅ Sucesso: {success_count}")
    print(f"   ⏭️  Já existiam: {skipped_count}")
    print(f"   ❌ Erros: {error_count}")
    print(f"   📦 Total: {total}")
    print()
    
    if success_count > 0 or skipped_count > 0:
        print("🎉 Upload concluído!")
        print()
        print("🔗 URLs das imagens:")
        print(f"   Base: https://pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev/{R2_BUCKET}/products/")
        print()
        print("✅ As imagens agora estão acessíveis publicamente!")
        print()
        print("⚠️  IMPORTANTE:")
        print("   As imagens em produção (Railway) já devem estar usando o R2.")
        print("   Se ainda houver erro 404, verifique:")
        print("   1. Se as variáveis de ambiente estão corretas no Railway")
        print("   2. Se o deploy foi feito após as correções")
    
    print()
    print("✅ Processo concluído!")

if __name__ == '__main__':
    upload_images_to_r2()
