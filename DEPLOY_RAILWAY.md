# 🚂 Guia de Deploy - Backend no Railway

## 📋 Pré-requisitos

- Conta no Railway (https://railway.app)
- Código do backend no GitHub (recomendado) ou deploy direto
- Variáveis de ambiente configuradas

## 🚀 Passo a Passo - Deploy no Railway

### 1️⃣ Criar Projeto no Railway

1. Acesse https://railway.app e faça login
2. Clique em "New Project"
3. Escolha uma das opções:
   - **Deploy from GitHub repo** (recomendado)
   - **Deploy from local directory**

### 2️⃣ Configurar Banco de Dados PostgreSQL

1. No seu projeto Railway, clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. O Railway criará automaticamente:
   - Banco de dados PostgreSQL
   - Variável `DATABASE_URL` (configurada automaticamente)

### 3️⃣ Configurar Variáveis de Ambiente

No painel do Railway, vá em "Variables" e adicione:

#### Variáveis Obrigatórias

```env
# Django
SECRET_KEY=sua-secret-key-super-segura-aqui
DEBUG=False
ALLOWED_HOSTS=seu-app.railway.app,seudominio.com
CORS_ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
CSRF_TRUSTED_ORIGINS=https://seudominio.com,https://www.seudominio.com

# Database (Railway configura automaticamente)
# DATABASE_URL=postgresql://... (não precisa adicionar manualmente)

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui
MERCADOPAGO_NOTIFICATION_URL=https://seu-app.railway.app/api/payments/webhook/

# Melhor Envio (Frete)
SHIPPING_ORIGIN_ZIP=seu-cep-origem
MELHORENVIO_API_TOKEN=seu_token_aqui
MELHORENVIO_CLIENT_ID=seu_client_id
MELHORENVIO_CLIENT_SECRET=seu_client_secret
MELHORENVIO_REDIRECT_URI=https://seu-app.railway.app/api/shipping/oauth/callback/

# Configurações de Frete
SHIPPING_DEFAULT_WEIGHT_GRAMS=300
SHIPPING_DEFAULT_LENGTH_CM=30
SHIPPING_DEFAULT_WIDTH_CM=20
SHIPPING_DEFAULT_HEIGHT_CM=5
SHIPPING_FREE_THRESHOLD=0

# Security (Produção)
SECURE_HSTS_SECONDS=31536000
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

#### Como Gerar SECRET_KEY

```python
# No terminal Python:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4️⃣ Deploy Automático

O Railway detectará automaticamente:
- `requirements.txt` → Instalará dependências Python
- `Procfile` → Comando para iniciar o servidor
- `railway.json` → Configurações de build e deploy

O processo de deploy incluirá:
1. Instalação de dependências
2. Coleta de arquivos estáticos (`collectstatic`)
3. Migrações do banco de dados (`migrate`)
4. Inicialização do Gunicorn

### 5️⃣ Verificar Deploy

1. Aguarde o build completar (2-5 minutos)
2. Railway fornecerá uma URL: `https://seu-app.railway.app`
3. Teste a API: `https://seu-app.railway.app/api/`

### 6️⃣ Configurar Domínio Customizado (Opcional)

1. No Railway, vá em "Settings" → "Domains"
2. Clique em "Add Domain"
3. Adicione seu domínio (ex: `api.seudominio.com`)
4. Configure DNS no seu provedor:
   - Tipo: CNAME
   - Nome: api
   - Valor: fornecido pelo Railway

## 📝 Arquivos de Configuração Criados

### `Procfile`
```
web: gunicorn core.wsgi --bind 0.0.0.0:$PORT
```

### `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate"
  },
  "deploy": {
    "startCommand": "gunicorn core.wsgi --bind 0.0.0.0:$PORT",
    "healthcheckPath": "/api/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `runtime.txt`
```
python-3.11.0
```

## 🔧 Configurações Adicionadas ao Projeto

### `requirements.txt` (novos pacotes)
- `gunicorn` - Servidor WSGI para produção
- `whitenoise` - Servir arquivos estáticos
- `dj-database-url` - Configuração automática do PostgreSQL

### `settings.py` (modificações)
- WhiteNoise middleware para arquivos estáticos
- Configuração automática de PostgreSQL via `DATABASE_URL`
- `STATIC_ROOT` para coleta de arquivos estáticos
- Configurações de segurança para produção

## 🎯 Checklist de Deploy

### Antes do Deploy
- [ ] Código commitado no Git (se usar GitHub)
- [ ] Variáveis de ambiente documentadas
- [ ] Credenciais do Mercado Pago obtidas
- [ ] Credenciais do Melhor Envio obtidas
- [ ] SECRET_KEY gerada

### Durante o Deploy
- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Deploy iniciado

### Após o Deploy
- [ ] Build completado com sucesso
- [ ] API acessível na URL do Railway
- [ ] Banco de dados migrado
- [ ] Arquivos estáticos coletados
- [ ] Testar endpoints principais:
  - [ ] `/api/` - Health check
  - [ ] `/api/catalog/products/` - Listar produtos
  - [ ] `/api/users/register/` - Registro
  - [ ] `/api/cart/` - Carrinho
- [ ] Configurar domínio customizado (opcional)
- [ ] Atualizar `VITE_API_BASE_URL` no frontend

## 🔄 Atualizações Futuras

### Deploy Automático (GitHub)
Se conectou o Railway ao GitHub:
1. Faça commit das mudanças
2. Push para o branch principal
3. Railway fará deploy automaticamente

### Deploy Manual
1. Faça as alterações no código
2. No Railway, clique em "Deploy" → "Redeploy"

## 🆘 Troubleshooting

### Build Falha
**Erro:** `No module named 'gunicorn'`
**Solução:** Verifique se `gunicorn` está em `requirements.txt`

### Database Error
**Erro:** `could not connect to server`
**Solução:** Verifique se o PostgreSQL está rodando e `DATABASE_URL` está configurada

### Static Files não carregam
**Erro:** 404 em arquivos CSS/JS do admin
**Solução:** 
```bash
python manage.py collectstatic --noinput
```

### CORS Error
**Erro:** `CORS policy: No 'Access-Control-Allow-Origin'`
**Solução:** Adicione o domínio do frontend em `CORS_ALLOWED_ORIGINS`

### 502 Bad Gateway
**Erro:** Aplicação não responde
**Solução:** 
1. Verifique logs no Railway
2. Verifique se `PORT` está sendo usado corretamente
3. Verifique se Gunicorn está iniciando

## 📊 Monitoramento

### Logs
- Acesse "Deployments" → Clique no deploy → "View Logs"
- Logs em tempo real disponíveis

### Métricas
- CPU, memória e rede disponíveis no dashboard
- Alertas configuráveis

### Custos
- Railway oferece $5 de crédito grátis/mês
- Monitore uso em "Usage"

## 🔐 Segurança

### Checklist de Segurança
- [ ] `DEBUG=False` em produção
- [ ] `SECRET_KEY` única e segura
- [ ] `ALLOWED_HOSTS` configurado
- [ ] HTTPS habilitado (Railway faz automaticamente)
- [ ] CORS configurado corretamente
- [ ] Credenciais em variáveis de ambiente (não no código)

## 📞 Suporte

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Django Deployment:** https://docs.djangoproject.com/en/stable/howto/deployment/

---

**Última atualização:** 25 de Outubro de 2025  
**Versão:** 1.0.0
