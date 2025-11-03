"""
Script para listar todas as imagens no R2
"""
import boto3
from botocore.exceptions import ClientError

# Configurações do R2
R2_ACCESS_KEY = '1b2b06a0569b1cef847eaf770ca146b8'
R2_SECRET_KEY = '04be2eee17efd5cb574fb6b9c3485c9762cecbd02a30f0585db93883b6cd156d'
R2_ENDPOINT = 'https://4c77a700894f0de680be07024f5cec36.r2.cloudflarestorage.com'
R2_BUCKET = 'base-corporativa-media'

def list_r2_images():
    """Lista todas as imagens no bucket R2"""
    
    print("📦 Listando imagens no Cloudflare R2...")
    print("=" * 80)
    print()
    
    # Criar cliente S3
    s3_client = boto3.client(
        's3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name='auto'
    )
    
    try:
        # Listar objetos no bucket
        response = s3_client.list_objects_v2(
            Bucket=R2_BUCKET,
            Prefix='products/'
        )
        
        if 'Contents' not in response:
            print("❌ Nenhum arquivo encontrado no bucket!")
            return
        
        objects = response['Contents']
        total = len(objects)
        
        print(f"📊 Total de arquivos em products/: {total}")
        print()
        print("-" * 80)
        
        # Procurar especificamente pelos arquivos com erro
        problem_files = [
            'products/oversized_preta_1.png',
            'products/oversized_branca_1.png',
            'products/Camiseta_Oversized_Capuccino_1.jpg'
        ]
        
        print("\n🔍 Verificando arquivos com erro 404:")
        print("-" * 80)
        
        for problem_file in problem_files:
            found = any(obj['Key'] == problem_file for obj in objects)
            if found:
                # Buscar o objeto
                obj = next(obj for obj in objects if obj['Key'] == problem_file)
                size_kb = obj['Size'] / 1024
                print(f"✅ EXISTE: {problem_file}")
                print(f"   Tamanho: {size_kb:.2f} KB")
                print(f"   URL: https://pub-e793bb450e29408fb3816d5ed09b0e08.r2.dev/base-corporativa-media/{problem_file}")
            else:
                print(f"❌ NÃO EXISTE: {problem_file}")
        
        print()
        print("-" * 80)
        print("\n📋 Todos os arquivos em products/:")
        print("-" * 80)
        
        for obj in sorted(objects, key=lambda x: x['Key']):
            key = obj['Key']
            size_kb = obj['Size'] / 1024
            print(f"  {key} ({size_kb:.2f} KB)")
        
        print()
        print("-" * 80)
        print()
        print("✅ Listagem concluída!")
        
    except ClientError as e:
        print(f"❌ Erro ao acessar o R2: {e}")

if __name__ == '__main__':
    list_r2_images()
