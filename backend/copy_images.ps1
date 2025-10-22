# Script para copiar imagens dos produtos
$sourceDir = "C:\Users\leonardo.fragoso\Desktop\Projetos\Base Corporativa\frontend\assets\img"
$destDir = "media\products"

# Criar diretório se não existir
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force
    Write-Host "Diretório criado: $destDir"
}

# Lista de imagens para copiar
$images = @(
    "CAMISETA OVERSIZED BEGE 1.png",
    "CAMISETA OVERSIZED BEGE 2.png",
    "CAMISETA OVERSIZED BEGE 3.png",
    "CAMISETA OVERSIZED BRANCA 1.png",
    "CAMISETA OVERSIZED BRANCA 2.png",
    "CAMISETA OVERSIZED CINZA 1.png",
    "CAMISETA OVERSIZED CINZA 2.png",
    "CAMISETA OVERSIZED PRETA 1.png",
    "CAMISETA OVERSIZED PRETA 2.png",
    "CAMISETA OVERSIZED PRETA 3.png"
)

# Copiar cada imagem
foreach ($image in $images) {
    $sourcePath = Join-Path $sourceDir $image
    $destPath = Join-Path $destDir $image
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "✅ Copiado: $image"
    } else {
        Write-Host "❌ Não encontrado: $image"
    }
}

Write-Host "🎉 Processo de cópia concluído!"
