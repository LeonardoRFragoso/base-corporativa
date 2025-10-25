# Script PowerShell para Build de Producao
# BASE CORPORATIVA - Deploy na Hostinger

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD PARA DEPLOY - BASE CORPORATIVA  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se estamos na pasta correta
if (-not (Test-Path "frontend")) {
    Write-Host "[ERRO] Execute este script na pasta raiz do projeto!" -ForegroundColor Red
    Write-Host "       Pasta atual: $PWD" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Pasta do projeto encontrada" -ForegroundColor Green
Write-Host ""

# 2. Navegar para pasta frontend
Set-Location frontend

# 3. Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERRO] Erro ao instalar dependencias!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Write-Host "[OK] Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencias ja instaladas" -ForegroundColor Green
}
Write-Host ""

# 4. Verificar arquivo .env.production
if (-not (Test-Path ".env.production")) {
    Write-Host "[AVISO] Arquivo .env.production nao encontrado!" -ForegroundColor Yellow
    Write-Host "        Criando arquivo de exemplo..." -ForegroundColor Yellow
    @"
VITE_API_BASE_URL=https://api.basecorporativa.com
VITE_CATALOG_PDF_URL=https://basecorporativa.com/media/catalog/catalogo.pdf
"@ | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "        IMPORTANTE: Edite o arquivo .env.production com suas URLs!" -ForegroundColor Yellow
    Write-Host ""
    
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -ne "s") {
        Set-Location ..
        exit 0
    }
} else {
    Write-Host "[OK] Arquivo .env.production encontrado" -ForegroundColor Green
    Write-Host "     Conteudo:" -ForegroundColor Cyan
    Get-Content ".env.production" | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
}
Write-Host ""

# 5. Limpar build anterior
if (Test-Path "dist") {
    Write-Host "[INFO] Removendo build anterior..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force dist
    Write-Host "[OK] Build anterior removido" -ForegroundColor Green
}
Write-Host ""

# 6. Fazer build de producao
Write-Host "[BUILD] Iniciando build de producao..." -ForegroundColor Cyan
Write-Host ""
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERRO] Erro durante o build!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "[OK] Build concluido com sucesso!" -ForegroundColor Green
Write-Host ""

# 7. Verificar arquivos gerados
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "[INFO] Estatisticas do build:" -ForegroundColor Cyan
    Write-Host "       Tamanho total: $([math]::Round($distSize, 2)) MB" -ForegroundColor Gray
    Write-Host "       Arquivos gerados:" -ForegroundColor Gray
    Get-ChildItem -Path dist -Recurse -File | Select-Object -First 10 | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "       - $($_.Name) ($size KB)" -ForegroundColor Gray
    }
    
    $totalFiles = (Get-ChildItem -Path dist -Recurse -File).Count
    if ($totalFiles -gt 10) {
        Write-Host "       ... e mais $($totalFiles - 10) arquivos" -ForegroundColor Gray
    }
} else {
    Write-Host "[ERRO] Pasta dist nao foi criada!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD CONCLUIDO!                      " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Arquivos prontos para upload em:" -ForegroundColor Yellow
Write-Host "       $PWD\dist" -ForegroundColor White
Write-Host ""
Write-Host "[PROXIMOS PASSOS]" -ForegroundColor Cyan
Write-Host "   1. Acesse o File Manager da Hostinger" -ForegroundColor White
Write-Host "   2. Navegue ate public_html/" -ForegroundColor White
Write-Host "   3. Delete arquivos antigos (faca backup!)" -ForegroundColor White
Write-Host "   4. Faca upload de TODOS os arquivos da pasta dist/" -ForegroundColor White
Write-Host "   5. Verifique se o arquivo .htaccess foi incluido" -ForegroundColor White
Write-Host ""
Write-Host "[DOCS] Consulte DEPLOY_GUIDE.md para instrucoes detalhadas" -ForegroundColor Cyan
Write-Host ""

# Voltar para pasta raiz
Set-Location ..

# Perguntar se deseja abrir a pasta dist
$openFolder = Read-Host "Deseja abrir a pasta dist no explorador? (s/n)"
if ($openFolder -eq "s") {
    Invoke-Item "frontend\dist"
}

Write-Host ""
Write-Host "[SUCESSO] Processo concluido!" -ForegroundColor Green
