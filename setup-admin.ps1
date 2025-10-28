# Script de Setup do Sistema Administrativo
# BASE CORPORATIVA

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP SISTEMA ADMINISTRATIVO" -ForegroundColor Cyan
Write-Host "  BASE CORPORATIVA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "backend")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
Set-Location backend

# Ativar ambiente virtual se existir
if (Test-Path "venv/Scripts/Activate.ps1") {
    Write-Host "🔧 Ativando ambiente virtual..." -ForegroundColor Yellow
    & venv/Scripts/Activate.ps1
}

# Instalar dependências
Write-Host "📥 Instalando pacotes Python..." -ForegroundColor Yellow
pip install -r requirements.txt

# Executar migrações
Write-Host "🗄️  Executando migrações do banco de dados..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate

# Coletar arquivos estáticos
Write-Host "📁 Coletando arquivos estáticos..." -ForegroundColor Yellow
python manage.py collectstatic --noinput

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Perguntar se deseja criar superusuário
Write-Host "Deseja criar um usuário administrador agora? (S/N)" -ForegroundColor Cyan
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host ""
    Write-Host "👤 Criando superusuário..." -ForegroundColor Yellow
    python manage.py createsuperuser
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Inicie o servidor backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Acesse o Django Admin:" -ForegroundColor White
Write-Host "   http://localhost:8000/admin/" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Inicie o frontend (em outro terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  Acesse o Dashboard Admin:" -ForegroundColor White
Write-Host "   http://localhost:5173/admin/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Consulte ADMIN_GUIDE.md para mais informações" -ForegroundColor Cyan
Write-Host ""

Set-Location ..
