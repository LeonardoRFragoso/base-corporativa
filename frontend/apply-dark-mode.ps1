# Script para aplicar tema escuro em todos os componentes
# BASE CORPORATIVA - Frontend

Write-Host "🌓 Aplicando tema escuro em todos os componentes..." -ForegroundColor Cyan

$replacements = @(
    # Backgrounds
    @{Pattern = 'className="([^"]*?)bg-white([^"]*?)"'; Replacement = 'className="$1bg-white dark:bg-neutral-800$2"'},
    @{Pattern = 'className="([^"]*?)bg-neutral-50([^"]*?)"'; Replacement = 'className="$1bg-neutral-50 dark:bg-neutral-900$2"'},
    @{Pattern = 'className="([^"]*?)bg-neutral-100([^"]*?)"'; Replacement = 'className="$1bg-neutral-100 dark:bg-neutral-800$2"'},
    @{Pattern = 'className="([^"]*?)bg-gray-50([^"]*?)"'; Replacement = 'className="$1bg-gray-50 dark:bg-neutral-900$2"'},
    @{Pattern = 'className="([^"]*?)bg-gray-100([^"]*?)"'; Replacement = 'className="$1bg-gray-100 dark:bg-neutral-800$2"'},
    
    # Text colors
    @{Pattern = 'className="([^"]*?)text-neutral-900([^"]*?)"'; Replacement = 'className="$1text-neutral-900 dark:text-neutral-100$2"'},
    @{Pattern = 'className="([^"]*?)text-neutral-800([^"]*?)"'; Replacement = 'className="$1text-neutral-800 dark:text-neutral-200$2"'},
    @{Pattern = 'className="([^"]*?)text-neutral-700([^"]*?)"'; Replacement = 'className="$1text-neutral-700 dark:text-neutral-300$2"'},
    @{Pattern = 'className="([^"]*?)text-neutral-600([^"]*?)"'; Replacement = 'className="$1text-neutral-600 dark:text-neutral-400$2"'},
    @{Pattern = 'className="([^"]*?)text-gray-900([^"]*?)"'; Replacement = 'className="$1text-gray-900 dark:text-neutral-100$2"'},
    @{Pattern = 'className="([^"]*?)text-gray-700([^"]*?)"'; Replacement = 'className="$1text-gray-700 dark:text-neutral-300$2"'},
    @{Pattern = 'className="([^"]*?)text-gray-600([^"]*?)"'; Replacement = 'className="$1text-gray-600 dark:text-neutral-400$2"'},
    
    # Borders
    @{Pattern = 'className="([^"]*?)border-neutral-200([^"]*?)"'; Replacement = 'className="$1border-neutral-200 dark:border-neutral-700$2"'},
    @{Pattern = 'className="([^"]*?)border-neutral-300([^"]*?)"'; Replacement = 'className="$1border-neutral-300 dark:border-neutral-600$2"'},
    @{Pattern = 'className="([^"]*?)border-gray-200([^"]*?)"'; Replacement = 'className="$1border-gray-200 dark:border-neutral-700$2"'},
    @{Pattern = 'className="([^"]*?)border-gray-300([^"]*?)"'; Replacement = 'className="$1border-gray-300 dark:border-neutral-600$2"'},
    
    # Hover states
    @{Pattern = 'hover:bg-neutral-100'; Replacement = 'hover:bg-neutral-100 dark:hover:bg-neutral-700'},
    @{Pattern = 'hover:bg-gray-100'; Replacement = 'hover:bg-gray-100 dark:hover:bg-neutral-700'},
    @{Pattern = 'hover:bg-neutral-50'; Replacement = 'hover:bg-neutral-50 dark:hover:bg-neutral-800'},
    @{Pattern = 'hover:text-primary-700'; Replacement = 'hover:text-primary-700 dark:hover:text-primary-400'}
)

$files = Get-ChildItem -Path "src" -Include "*.jsx" -Recurse

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0

foreach ($file in $files) {
    $processedFiles++
    Write-Progress -Activity "Processando arquivos" -Status "$processedFiles de $totalFiles" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $modified = $false
    
    # Pular se já tem classes dark:
    if ($content -match 'dark:') {
        Write-Host "  ⏭️  Pulando $($file.Name) (já tem dark mode)" -ForegroundColor Yellow
        continue
    }
    
    foreach ($replacement in $replacements) {
        if ($content -match $replacement.Pattern) {
            $content = $content -replace $replacement.Pattern, $replacement.Replacement
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $modifiedFiles++
        Write-Host "  ✅ Atualizado: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n✨ Concluído!" -ForegroundColor Green
Write-Host "📊 Arquivos processados: $processedFiles" -ForegroundColor Cyan
Write-Host "📝 Arquivos modificados: $modifiedFiles" -ForegroundColor Cyan
Write-Host "`n⚠️  IMPORTANTE: Revise as mudanças antes de commitar!" -ForegroundColor Yellow
Write-Host "💡 Teste o tema escuro no navegador" -ForegroundColor Yellow
