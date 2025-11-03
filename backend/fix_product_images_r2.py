"""
Script para criar cópias das imagens com nomes alternativos no R2
Para resolver os erros 404 de imagens com nomes diferentes
"""
import boto3
from botocore.exceptions import ClientError

# Configurações do R2
R2_ACCESS_KEY = '1b2b06a0569b1cef847eaf770ca146b8'
R2_SECRET_KEY = '04be2eee17efd5cb574fb6b9c3485c9762cecbd02a30f0585db93883b6cd156d'
R2_ENDPOINT = 'https://4c77a700894f0de680be07024f5cec36.r2.cloudflarestorage.com'
R2_BUCKET = 'base-corporativa-media'

def copy_image_in_r2(s3_client, source_key, dest_key):
    """Copia uma imagem dentro do R2"""
    try:
        # Copiar objeto
        copy_source = {'Bucket': R2_BUCKET, 'Key': source_key}
        s3_client.copy_object(
            CopySource=copy_source,
            Bucket=R2_BUCKET,
            Key=dest_key,
            ContentType='image/png',
            CacheControl='max-age=31536000'
        )
        return True
    except ClientError as e:
        print(f"   Erro: {e}")
        return False

def fix_images():
    """Cria cópias das imagens com nomes alternativos"""
    
    print("🔧 Corrigindo nomes de imagens no R2...")
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
    
    # Mapeamento de imagens: origem -> destino(s)
    image_mappings = [
        # Branca
        {
            'source': 'products/CAMISETA OVERSIZED BRANCA 1.png',
            'destinations': [
                'products/oversized_branca_1.png',
                'products/Camiseta_Oversized_Branca_1.png'
            ]
        },
        {
            'source': 'products/CAMISETA OVERSIZED BRANCA 2.png',
            'destinations': [
                'products/oversized_branca_2.png',
                'products/Camiseta_Oversized_Branca_2.png'
            ]
        },
        # Preta
        {
            'source': 'products/CAMISETA OVERSIZED PRETA 1.png',
            'destinations': [
                'products/oversized_preta_1.png',
                'products/Camiseta_Oversized_Preta_1.png'
            ]
        },
        {
            'source': 'products/CAMISETA OVERSIZED PRETA 2.png',
            'destinations': [
                'products/oversized_preta_2.png',
                'products/Camiseta_Oversized_Preta_2.png'
            ]
        },
        {
            'source': 'products/CAMISETA OVERSIZED PRETA 3.png',
            'destinations': [
                'products/oversized_preta_3.png',
                'products/Camiseta_Oversized_Preta_3.png'
            ]
        },
        # Bege
        {
            'source': 'products/CAMISETA OVERSIZED BEGE 1.png',
            'destinations': [
                'products/oversized_bege_1.png',
                'products/Camiseta_Oversized_Bege_1.png'
            ]
        },
        {
            'source': 'products/CAMISETA OVERSIZED BEGE 2.png',
            'destinations': [
                'products/oversized_bege_2.png',
                'products/Camiseta_Oversized_Bege_2.png'
            ]
        },
        {
            'source': 'products/CAMISETA OVERSIZED BEGE 3.png',
            'destinations': [
                'products/oversized_bege_3.png',
                'products/Camiseta_Oversized_Bege_3.png'
            ]
        },
        # Cinza
        {
            'source': 'products/CAMISETA OVERSIZED CINZA 1.png',
            'destinations': [
                'products/oversized_cinza_1.png',
                'products/Camiseta_Oversized_Cinza_1.png'
            ]
        },
        {
            'source': 'products/CAMISETA OVERSIZED CINZA 2.png',
            'destinations': [
                'products/oversized_cinza_2.png',
                'products/Camiseta_Oversized_Cinza_2.png'
            ]
        },
    ]
    
    success_count = 0
    error_count = 0
    total = sum(len(m['destinations']) for m in image_mappings)
    current = 0
    
    print(f"📦 Total de cópias a criar: {total}")
    print()
    print("-" * 80)
    
    for mapping in image_mappings:
        source = mapping['source']
        
        # Verificar se origem existe
        try:
            s3_client.head_object(Bucket=R2_BUCKET, Key=source)
        except ClientError:
            print(f"⚠️  Origem não encontrada: {source}")
            error_count += len(mapping['destinations'])
            continue
        
        print(f"\n📄 Origem: {source}")
        
        for dest in mapping['destinations']:
            current += 1
            
            # Verificar se destino já existe
            try:
                s3_client.head_object(Bucket=R2_BUCKET, Key=dest)
                print(f"   ⏭️  [{current}/{total}] Já existe: {dest}")
                success_count += 1
                continue
            except ClientError:
                pass
            
            # Copiar
            if copy_image_in_r2(s3_client, source, dest):
                print(f"   ✅ [{current}/{total}] Copiado: {dest}")
                success_count += 1
            else:
                print(f"   ❌ [{current}/{total}] Erro: {dest}")
                error_count += 1
    
    print()
    print("-" * 80)
    print()
    print("📊 RESUMO:")
    print(f"   ✅ Sucesso: {success_count}")
    print(f"   ❌ Erros: {error_count}")
    print(f"   📦 Total: {total}")
    print()
    
    if success_count > 0:
        print("🎉 Correção concluída!")
        print()
        print("✅ As imagens agora estão disponíveis com múltiplos nomes:")
        print("   - CAMISETA OVERSIZED XXX 1.png (original)")
        print("   - oversized_xxx_1.png (alternativo)")
        print("   - Camiseta_Oversized_Xxx_1.png (alternativo)")
    
    print()
    print("⚠️  NOTA SOBRE CAPUCCINO:")
    print("   A imagem 'Camiseta_Oversized_Capuccino_1.jpg' não foi encontrada")
    print("   localmente. Você precisa:")
    print("   1. Verificar se esse produto existe no banco de produção")
    print("   2. Fazer upload da imagem correta ou")
    print("   3. Deletar o produto se não for mais usado")
    print()
    print("✅ Processo concluído!")

if __name__ == '__main__':
    fix_images()
