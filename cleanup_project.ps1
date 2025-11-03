# Script de Limpeza do Projeto Base Corporativa
# Remove arquivos desnecessarios mantendo apenas o essencial

Write-Host "Iniciando limpeza do projeto..." -ForegroundColor Cyan
Write-Host ""

$rootPath = "C:\Users\leona\OneDrive\Documentos\Projetos\base-corporativa"
$deletedCount = 0
$errorCount = 0

# Lista de arquivos para deletar
$filesToDelete = @(
    "backend\check_and_fix_pdfs.py",
    "backend\check_orders.py",
    "backend\check_orders_integrity.py",
    "backend\check_orders_simple.py",
    "backend\check_production_data.py",
    "backend\diagnose_storage.py",
    "backend\test_email.py",
    "backend\test_frontend_api.py",
    "backend\test_r2_connection.py",
    "backend\test_real_payment.py",
    "backend\test_send_verification.py",
    "backend\test_webhook.py",
    "backend\test_webhook_detailed.py",
    "backend\copy_images.ps1",
    "backend\AUTHENTICATION_API.md",
    "frontend\apply-dark-mode.ps1",
    "frontend\apply-dark-theme.cjs",
    "frontend\dist.zip",
    "GUIA_RAPIDO_ATIVACAO.md",
    "STATUS_REAL_IMPLEMENTACAO.md",
    "SISTEMA_AUTENTICACAO.md",
    "melhorias_esperadas.txt",
    "build-for-deploy.ps1",
    "setup-admin.ps1",
    "package-lock.json"
)

Write-Host "Arquivos marcados para exclusao: $($filesToDelete.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $rootPath $file
    
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "Deletado: $file" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "Erro ao deletar: $file" -ForegroundColor Red
            Write-Host "Motivo: $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "Nao encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "RESUMO DA LIMPEZA:" -ForegroundColor Cyan
Write-Host "Arquivos deletados: $deletedCount" -ForegroundColor Green
Write-Host "Erros: $errorCount" -ForegroundColor Red
Write-Host "Total processado: $($filesToDelete.Count)" -ForegroundColor White
Write-Host ""

if ($deletedCount -gt 0) {
    Write-Host "Limpeza concluida com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Yellow
    Write-Host "1. Revisar mudancas: git status" -ForegroundColor White
    Write-Host "2. Commitar: git add . && git commit -m 'chore: Limpar arquivos desnecessarios'" -ForegroundColor White
    Write-Host "3. Push: git push" -ForegroundColor White
}
else {
    Write-Host "Nenhum arquivo foi deletado." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Script finalizado!" -ForegroundColor Cyan
