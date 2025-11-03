"""
Script para fazer upload dos PDFs para o Cloudflare R2
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

def upload_to_r2():
    """Faz upload dos PDFs para o R2"""
    
    print("☁️  Upload de PDFs para Cloudflare R2")
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
    
    # Diretório dos PDFs
    pdf_dir = Path('media/product_pdfs')
    
    if not pdf_dir.exists():
        print("❌ Diretório de PDFs não encontrado!")
        return
    
    # Listar PDFs
    pdf_files = list(pdf_dir.glob('*.pdf'))
    total = len(pdf_files)
    
    print(f"📦 Total de PDFs encontrados: {total}")
    print()
    
    if total == 0:
        print("⚠️  Nenhum PDF encontrado para upload.")
        return
    
    print("🔄 Fazendo upload...")
    print("-" * 80)
    
    success_count = 0
    error_count = 0
    
    for i, pdf_file in enumerate(pdf_files, 1):
        try:
            # Key no R2 (caminho no bucket)
            key = f'product_pdfs/{pdf_file.name}'
            
            # Fazer upload
            with open(pdf_file, 'rb') as f:
                s3_client.put_object(
                    Bucket=R2_BUCKET,
                    Key=key,
                    Body=f,
                    ContentType='application/pdf',
                    CacheControl='max-age=31536000'  # 1 ano
                )
            
            # URL pública
            public_url = f'https://pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev/{R2_BUCKET}/{key}'
            
            print(f"✅ [{i}/{total}] {pdf_file.name}")
            print(f"   📤 Enviado para: {key}")
            print(f"   🌐 URL: {public_url}")
            print()
            
            success_count += 1
            
        except ClientError as e:
            print(f"❌ [{i}/{total}] ERRO ao enviar {pdf_file.name}")
            print(f"   Erro: {e}")
            print()
            error_count += 1
        except Exception as e:
            print(f"❌ [{i}/{total}] ERRO inesperado ao enviar {pdf_file.name}")
            print(f"   Erro: {e}")
            print()
            error_count += 1
    
    print("-" * 80)
    print()
    print("📊 RESUMO:")
    print(f"   ✅ Sucesso: {success_count}")
    print(f"   ❌ Erros: {error_count}")
    print(f"   📦 Total: {total}")
    print()
    
    if success_count > 0:
        print("🎉 Upload concluído!")
        print()
        print("🔗 URLs dos PDFs:")
        print(f"   Base: https://pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev/{R2_BUCKET}/product_pdfs/")
        print()
        print("✅ Os PDFs agora estão acessíveis publicamente!")
    
    print()
    print("✅ Processo concluído!")

if __name__ == '__main__':
    upload_to_r2()
